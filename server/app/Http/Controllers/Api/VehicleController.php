<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Http\Requests\VehicleSearchRequest;
use App\Http\Requests\VehicleShowRequest;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class VehicleController extends Controller
{
    /**
     * Search vehicles with filters
     */
    public function search(VehicleSearchRequest $request)
    {
        // Validation is automatically handled by VehicleSearchRequest

        $query = Vehicle::with(['category', 'make', 'model', 'images'])
            ->where('status', 'active');

        // Text search in title and description
        if ($request->filled('query')) {
            $searchTerm = $request->get('query');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                  ->orWhereHas('make', function ($makeQuery) use ($searchTerm) {
                      $makeQuery->where('name', 'LIKE', "%{$searchTerm}%");
                  })
                  ->orWhereHas('model', function ($modelQuery) use ($searchTerm) {
                      $modelQuery->where('name', 'LIKE', "%{$searchTerm}%");
                  });
            });
        }

        // Filter by vehicle type (category slug)
        if ($request->filled('type')) {
            $query->whereHas('category', function ($categoryQuery) use ($request) {
                $categoryQuery->where('slug', $request->type);
            });
        }

        // Filter by category ID
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by make
        if ($request->filled('make_id')) {
            $query->where('make_id', $request->make_id);
        }

        // Filter by model
        if ($request->filled('model_id')) {
            $query->where('model_id', $request->model_id);
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Year filter
        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        // City filter
        if ($request->filled('city')) {
            $query->where('city', 'LIKE', "%{$request->city}%");
        }

        // Condition filter
        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        // Transmission filter
        if ($request->filled('transmission')) {
            $query->where('transmission', $request->transmission);
        }

        // Fuel type filter
        if ($request->filled('fuel_type')) {
            $query->where('fuel_type', $request->fuel_type);
        }

        // Featured filter
        if ($request->filled('featured') && $request->featured === 'true') {
            $query->where('is_featured', true);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 12);
        $vehicles = $query->paginate($perPage);

        return response()->json([
            'message' => 'Vehicles retrieved successfully',
            'data' => $vehicles->items(),
            'pagination' => [
                'current_page' => $vehicles->currentPage(),
                'last_page' => $vehicles->lastPage(),
                'per_page' => $vehicles->perPage(),
                'total' => $vehicles->total(),
                'from' => $vehicles->firstItem(),
                'to' => $vehicles->lastItem(),
            ],
            'filters_applied' => $request->only([
                'query', 'type', 'category_id', 'make_id', 'model_id',
                'min_price', 'max_price', 'year', 'city', 'condition',
                'transmission', 'fuel_type', 'featured'
            ])
        ]);
    }

    /**
     * Get all vehicles (with basic filters)
     */
    public function index(VehicleSearchRequest $request)
    {
        return $this->search($request);
    }

    /**
     * Get vehicle by ID
     */
    public function show(VehicleShowRequest $request, $id)
    {
        // Build the query with conditional includes based on request parameters
        $with = [];

        if ($request->include_images) {
            $with[] = 'images';
        }

        if ($request->include_user) {
            $with[] = 'user';
        }

        // Always include category, make, and model for basic vehicle info
        $with = array_merge($with, ['category', 'make', 'model']);

        $vehicle = Vehicle::with($with)
            ->where('status', 'active')
            ->findOrFail($id);

        // Increment view count if tracking is enabled
        if ($request->track_view) {
            $vehicle->increment('views_count');
        }

        $response = [
            'message' => 'Vehicle retrieved successfully',
            'data' => $vehicle
        ];

        // Add related vehicles if requested
        if ($request->include_related) {
            $relatedVehicles = Vehicle::with(['category', 'make', 'model', 'images'])
                ->where('status', 'active')
                ->where('id', '!=', $id)
                ->where(function ($query) use ($vehicle) {
                    $query->where('make_id', $vehicle->make_id)
                          ->orWhere('category_id', $vehicle->category_id);
                })
                ->limit(6)
                ->get();

            $response['related_vehicles'] = $relatedVehicles;
        }

        return response()->json($response);
    }

    /**
     * Store a newly created vehicle in storage.
     */
    public function store(StoreVehicleRequest $request)
    {
        // Create the vehicle with validated data
        $vehicleData = $request->validated();

        // Remove images and video from vehicle data as they'll be handled separately
        $images = $vehicleData['images'] ?? [];
        $video = $vehicleData['video'] ?? null;
        unset($vehicleData['images'], $vehicleData['video']);

        // Process social media links - convert from form array format to JSON
        if (isset($vehicleData['social_media_links']) && is_array($vehicleData['social_media_links'])) {
            // Filter out empty values
            $socialMediaLinks = array_filter($vehicleData['social_media_links'], function($value) {
                return !empty($value);
            });
            $vehicleData['social_media_links'] = empty($socialMediaLinks) ? null : $socialMediaLinks;
        }

        $vehicle = Vehicle::create($vehicleData);

        // Handle image uploads
        if (!empty($images)) {
            $this->handleImageUploads($vehicle, $images);
        }

        // Handle video upload
        if ($video) {
            $this->handleVideoUpload($vehicle, $video);
        }

        // Load relationships for response
        $vehicle->load(['category', 'make', 'model', 'images', 'user']);

        return response()->json([
            'message' => 'Vehicle listing created successfully',
            'data' => $vehicle
        ], 201);
    }

    /**
     * Update the specified vehicle in storage.
     */
    public function update(UpdateVehicleRequest $request, Vehicle $vehicle)
    {
        // Update the vehicle with validated data
        $vehicleData = $request->validated();

        // Remove images and video from vehicle data as they'll be handled separately
        $images = $vehicleData['images'] ?? [];
        $video = $vehicleData['video'] ?? null;
        unset($vehicleData['images'], $vehicleData['video']);

        // Process social media links - convert from form array format to JSON
        if (isset($vehicleData['social_media_links']) && is_array($vehicleData['social_media_links'])) {
            // Filter out empty values
            $socialMediaLinks = array_filter($vehicleData['social_media_links'], function($value) {
                return !empty($value);
            });
            $vehicleData['social_media_links'] = empty($socialMediaLinks) ? null : $socialMediaLinks;
        }

        $vehicle->update($vehicleData);

        // Handle image uploads if provided
        if (!empty($images)) {
            $this->handleImageUploads($vehicle, $images);
        }

        // Handle video upload if provided
        if ($video) {
            // Delete old video if exists
            $this->deleteVideoFiles($vehicle);
            $this->handleVideoUpload($vehicle, $video);
        }

        // Load relationships for response
        $vehicle->load(['category', 'make', 'model', 'images', 'user']);

        return response()->json([
            'message' => 'Vehicle listing updated successfully',
            'data' => $vehicle
        ]);
    }

    /**
     * Remove the specified vehicle from storage.
     */
    public function destroy(Vehicle $vehicle)
    {
        // Check if user owns the vehicle
        if ($vehicle->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized to delete this vehicle'
            ], 403);
        }

        // Delete associated images from storage
        foreach ($vehicle->images as $image) {
            if (Storage::disk('public')->exists($image->path)) {
                Storage::disk('public')->delete($image->path);
            }
            $image->delete();
        }

        // Delete the vehicle
        $vehicle->delete();

        return response()->json([
            'message' => 'Vehicle listing deleted successfully'
        ]);
    }

    /**
     * Get vehicles owned by the authenticated user
     */
    public function myVehicles(Request $request)
    {
        $user = Auth::user();

        // Build query for user's vehicles only
        $query = Vehicle::where('user_id', $user->id)
            ->with(['category', 'make', 'model', 'images', 'user']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // Validate sort fields to prevent SQL injection
        $allowedSortFields = [
            'created_at', 'updated_at', 'title', 'price',
            'year', 'views_count', 'favorites_count'
        ];

        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Get paginated results
        $perPage = min($request->get('per_page', 20), 50); // Max 50 per page
        $vehicles = $query->paginate($perPage);

        // Transform the data to include additional computed fields
        $vehicles->getCollection()->transform(function ($vehicle) {
            // Add primary image
            $vehicle->primary_image = $vehicle->images->where('is_primary', true)->first()
                ?: $vehicle->images->first();

            // Add counts (these would normally come from relationships or separate queries)
            $vehicle->views_count = $vehicle->views_count ?? 0;
            $vehicle->favorites_count = $vehicle->favorites_count ?? 0;

            // Add formatted price
            $vehicle->formatted_price = 'Rs ' . number_format($vehicle->price);

            // Add time ago
            $vehicle->created_at_human = $vehicle->created_at->diffForHumans();
            $vehicle->updated_at_human = $vehicle->updated_at->diffForHumans();

            return $vehicle;
        });

        return response()->json([
            'success' => true,
            'data' => $vehicles->items(),
            'pagination' => [
                'current_page' => $vehicles->currentPage(),
                'last_page' => $vehicles->lastPage(),
                'per_page' => $vehicles->perPage(),
                'total' => $vehicles->total(),
                'from' => $vehicles->firstItem(),
                'to' => $vehicles->lastItem(),
            ],
            'stats' => [
                'total_listings' => $vehicles->total(),
                'active_listings' => Vehicle::where('user_id', $user->id)->where('status', 'active')->count(),
                'draft_listings' => Vehicle::where('user_id', $user->id)->where('status', 'draft')->count(),
                'sold_listings' => Vehicle::where('user_id', $user->id)->where('status', 'sold')->count(),
                'expired_listings' => Vehicle::where('user_id', $user->id)->where('status', 'expired')->count(),
            ]
        ]);
    }

    /**
     * Get user's vehicle statistics
     */
    public function myVehicleStats()
    {
        $user = Auth::user();

        $stats = [
            'total_listings' => Vehicle::where('user_id', $user->id)->count(),
            'active_listings' => Vehicle::where('user_id', $user->id)->where('status', 'active')->count(),
            'draft_listings' => Vehicle::where('user_id', $user->id)->where('status', 'draft')->count(),
            'sold_listings' => Vehicle::where('user_id', $user->id)->where('status', 'sold')->count(),
            'expired_listings' => Vehicle::where('user_id', $user->id)->where('status', 'expired')->count(),
            'total_views' => Vehicle::where('user_id', $user->id)->sum('views_count'),
            'total_favorites' => Vehicle::where('user_id', $user->id)->sum('favorites_count'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Handle image uploads for a vehicle
     */
    private function handleImageUploads(Vehicle $vehicle, array $images)
    {
        foreach ($images as $index => $image) {
            // Store the image
            $path = $image->store('vehicles/' . $vehicle->id, 'public');

            // Create image record
            $vehicle->images()->create([
                'path' => $path,
                'is_primary' => $index === 0, // First image is primary
                'sort_order' => $index + 1,
            ]);
        }
    }

    /**
     * Upload additional images to existing vehicle
     */
    public function uploadImages(Request $request, Vehicle $vehicle)
    {
        // Check if user owns the vehicle
        if ($vehicle->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized to upload images for this vehicle'
            ], 403);
        }

        $request->validate([
            'images' => 'required|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        // Check total image count
        $currentImageCount = $vehicle->images()->count();
        $newImageCount = count($request->images);

        if ($currentImageCount + $newImageCount > 10) {
            return response()->json([
                'message' => 'Cannot upload more than 10 images per vehicle'
            ], 422);
        }

        $this->handleImageUploads($vehicle, $request->images);

        $vehicle->load('images');

        return response()->json([
            'message' => 'Images uploaded successfully',
            'data' => $vehicle->images
        ]);
    }

    /**
     * Delete a specific image
     */
    public function deleteImage(Vehicle $vehicle, $imageId)
    {
        // Check if user owns the vehicle
        if ($vehicle->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized to delete images for this vehicle'
            ], 403);
        }

        $image = $vehicle->images()->findOrFail($imageId);

        // Delete from storage
        if (Storage::disk('public')->exists($image->path)) {
            Storage::disk('public')->delete($image->path);
        }

        $image->delete();

        return response()->json([
            'message' => 'Image deleted successfully'
        ]);
    }

    /**
     * Handle video upload for a vehicle
     */
    private function handleVideoUpload(Vehicle $vehicle, $video)
    {
        // Store the video file
        $videoPath = $video->store('vehicles/' . $vehicle->id . '/videos', 'public');

        // Get video information
        $videoSize = $video->getSize();

        // Update vehicle with video information
        $vehicle->update([
            'video_path' => $videoPath,
            'video_size' => $videoSize,
            'video_duration' => null, // Will be set by frontend or video processing
        ]);
    }

    /**
     * Delete video files for a vehicle
     */
    private function deleteVideoFiles(Vehicle $vehicle)
    {
        // Delete video file
        if ($vehicle->video_path && Storage::disk('public')->exists($vehicle->video_path)) {
            Storage::disk('public')->delete($vehicle->video_path);
        }

        // Delete video thumbnail
        if ($vehicle->video_thumbnail_path && Storage::disk('public')->exists($vehicle->video_thumbnail_path)) {
            Storage::disk('public')->delete($vehicle->video_thumbnail_path);
        }

        // Clear video fields
        $vehicle->update([
            'video_path' => null,
            'video_thumbnail_path' => null,
            'video_duration' => null,
            'video_size' => null,
        ]);
    }

    /**
     * Delete video for a vehicle
     */
    public function deleteVideo(Vehicle $vehicle)
    {
        // Check if user owns the vehicle
        if ($vehicle->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized to delete video for this vehicle'
            ], 403);
        }

        $this->deleteVideoFiles($vehicle);

        return response()->json([
            'message' => 'Video deleted successfully'
        ]);
    }
}
