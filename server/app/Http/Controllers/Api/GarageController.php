<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GarageVehicle;
use App\Models\MaintenanceLog;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GarageController extends Controller
{
    /**
     * Get all garage vehicles for the authenticated user
     */
    public function index(Request $request)
    {
        $query = GarageVehicle::where('user_id', Auth::id())
            ->with(['category', 'make', 'model', 'maintenanceLogs' => function($q) {
                $q->latest('service_date')->limit(3);
            }]);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or license plate
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('license_plate', 'like', "%{$search}%");
            });
        }

        $vehicles = $query->orderBy('created_at', 'desc')->paginate(12);

        // Add computed fields
        $vehicles->getCollection()->transform(function ($vehicle) {
            $vehicle->total_maintenance_cost = $vehicle->total_maintenance_cost;
            $vehicle->latest_maintenance = $vehicle->latest_maintenance;
            $vehicle->upcoming_maintenance = $vehicle->upcoming_maintenance;
            $vehicle->insurance_expiring_soon = $vehicle->insurance_expiring_soon;
            $vehicle->registration_expiring_soon = $vehicle->registration_expiring_soon;
            $vehicle->full_name = $vehicle->full_name;
            return $vehicle;
        });

        return response()->json([
            'message' => 'Garage vehicles retrieved successfully',
            'data' => $vehicles
        ]);
    }

    /**
     * Store a new garage vehicle
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:vehicle_categories,id',
            'make_id' => 'required|exists:vehicle_makes,id',
            'model_id' => 'required|exists:vehicle_models,id',
            'name' => 'required|string|max:255',
            'license_plate' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('garage_vehicles')->where(function ($query) {
                    return $query->where('user_id', Auth::id());
                }),
            ],
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'color' => 'required|string|max:50',
            'vin' => 'nullable|string|max:17',
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'current_mileage' => 'required|integer|min:0',
            'condition' => 'required|in:excellent,good,fair,poor',
            'transmission' => 'required|in:manual,automatic,cvt,semi_automatic',
            'fuel_type' => 'required|in:petrol,diesel,hybrid,electric,cng,lpg',
            'engine_capacity' => 'nullable|string|max:20',
            'engine_power' => 'nullable|integer|min:1',
            'insurance_company' => 'nullable|string|max:255',
            'insurance_policy_number' => 'nullable|string|max:100',
            'insurance_expiry' => 'nullable|date|after:today',
            'registration_expiry' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000',
            'features' => 'nullable|array',
            'features.*' => 'string|max:100',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240',
            'video' => 'nullable|file|mimes:mp4,mov,avi,wmv|max:51200', // 50MB max
        ]);

        $vehicleData = $request->except(['images', 'video']);
        $vehicleData['user_id'] = Auth::id();

        // Handle image uploads
        Log::info('Checking for images in request', ['has_images' => $request->hasFile('images')]);
        if ($request->hasFile('images')) {
            Log::info('Processing images', ['count' => count($request->file('images'))]);
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('garage/vehicles/' . Auth::id(), 'public');
                $imagePaths[] = $path;
                Log::info('Image stored', ['path' => $path]);
            }
            $vehicleData['images'] = $imagePaths;
        }

        // Handle video upload
        Log::info('Checking for video in request', ['has_video' => $request->hasFile('video')]);
        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('garage/videos/' . Auth::id(), 'public');
            $vehicleData['video'] = $videoPath;
            Log::info('Video stored', ['path' => $videoPath]);
        }

        $vehicle = GarageVehicle::create($vehicleData);
        $vehicle->load(['category', 'make', 'model']);

        return response()->json([
            'message' => 'Vehicle added to garage successfully',
            'data' => $vehicle
        ], 201);
    }

    /**
     * Show a specific garage vehicle
     */
    public function show(GarageVehicle $garageVehicle)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $garageVehicle->load([
            'category',
            'make',
            'model',
            'maintenanceLogs' => function($q) {
                $q->orderBy('service_date', 'desc');
            },
            'listing'
        ]);

        // Add computed fields
        $garageVehicle->total_maintenance_cost = $garageVehicle->total_maintenance_cost;
        $garageVehicle->latest_maintenance = $garageVehicle->latest_maintenance;
        $garageVehicle->upcoming_maintenance = $garageVehicle->upcoming_maintenance;
        $garageVehicle->insurance_expiring_soon = $garageVehicle->insurance_expiring_soon;
        $garageVehicle->registration_expiring_soon = $garageVehicle->registration_expiring_soon;
        $garageVehicle->full_name = $garageVehicle->full_name;

        return response()->json([
            'message' => 'Garage vehicle retrieved successfully',
            'data' => $garageVehicle
        ]);
    }

    /**
     * Update a garage vehicle
     */
    public function update(Request $request, GarageVehicle $garageVehicle)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'category_id' => 'sometimes|exists:vehicle_categories,id',
            'make_id' => 'sometimes|exists:vehicle_makes,id',
            'model_id' => 'sometimes|exists:vehicle_models,id',
            'name' => 'sometimes|string|max:255',
            'license_plate' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('garage_vehicles')->where(function ($query) {
                    return $query->where('user_id', Auth::id());
                })->ignore($garageVehicle->id),
            ],
            'year' => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'color' => 'sometimes|string|max:50',
            'vin' => 'nullable|string|max:17',
            'purchase_price' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'current_mileage' => 'sometimes|integer|min:0',
            'condition' => 'sometimes|in:excellent,good,fair,poor',
            'transmission' => 'sometimes|in:manual,automatic,cvt,semi_automatic',
            'fuel_type' => 'sometimes|in:petrol,diesel,hybrid,electric,cng,lpg',
            'engine_capacity' => 'nullable|string|max:20',
            'engine_power' => 'nullable|integer|min:1',
            'insurance_company' => 'nullable|string|max:255',
            'insurance_policy_number' => 'nullable|string|max:100',
            'insurance_expiry' => 'nullable|date|after:today',
            'registration_expiry' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000',
            'features' => 'nullable|array',
            'features.*' => 'string|max:100',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240',
            'video' => 'nullable|file|mimes:mp4,mov,avi,wmv|max:51200', // 50MB max
        ]);

        $vehicleData = $request->except(['images', 'video']);

        // Handle image uploads
        if ($request->hasFile('images')) {
            // Delete old images
            if ($garageVehicle->images) {
                foreach ($garageVehicle->images as $oldImage) {
                    Storage::disk('public')->delete($oldImage);
                }
            }

            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('garage/vehicles/' . Auth::id(), 'public');
                $imagePaths[] = $path;
            }
            $vehicleData['images'] = $imagePaths;
        }

        // Handle video upload
        if ($request->hasFile('video')) {
            // Delete old video
            if ($garageVehicle->video) {
                Storage::disk('public')->delete($garageVehicle->video);
            }

            $videoPath = $request->file('video')->store('garage/videos/' . Auth::id(), 'public');
            $vehicleData['video'] = $videoPath;
        }

        $garageVehicle->update($vehicleData);
        $garageVehicle->load(['category', 'make', 'model']);

        return response()->json([
            'message' => 'Garage vehicle updated successfully',
            'data' => $garageVehicle
        ]);
    }

    /**
     * Delete a garage vehicle
     */
    public function destroy(GarageVehicle $garageVehicle)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete images
        if ($garageVehicle->images) {
            foreach ($garageVehicle->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        // If vehicle is listed for sale, remove the listing
        if ($garageVehicle->listing_id) {
            $listing = Vehicle::find($garageVehicle->listing_id);
            if ($listing) {
                $listing->delete();
            }
        }

        $garageVehicle->delete();

        return response()->json([
            'message' => 'Garage vehicle deleted successfully'
        ]);
    }

    /**
     * Get garage statistics
     */
    public function statistics()
    {
        $userId = Auth::id();

        $stats = [
            'total_vehicles' => GarageVehicle::where('user_id', $userId)->count(),
            'owned_vehicles' => GarageVehicle::where('user_id', $userId)->where('status', 'owned')->count(),
            'for_sale_vehicles' => GarageVehicle::where('user_id', $userId)->where('status', 'for_sale')->count(),
            'sold_vehicles' => GarageVehicle::where('user_id', $userId)->where('status', 'sold')->count(),
            'total_maintenance_cost' => MaintenanceLog::where('user_id', $userId)->sum('cost') ?? 0,
            'maintenance_logs_count' => MaintenanceLog::where('user_id', $userId)->count(),
            'vehicles_with_expiring_insurance' => GarageVehicle::where('user_id', $userId)
                ->whereNotNull('insurance_expiry')
                ->where('insurance_expiry', '<=', now()->addDays(30))
                ->count(),
            'vehicles_with_expiring_registration' => GarageVehicle::where('user_id', $userId)
                ->whereNotNull('registration_expiry')
                ->where('registration_expiry', '<=', now()->addDays(30))
                ->count(),
        ];

        return response()->json([
            'message' => 'Garage statistics retrieved successfully',
            'data' => $stats
        ]);
    }

    /**
     * List a garage vehicle for sale
     */
    public function listForSale(Request $request, GarageVehicle $garageVehicle)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'price' => 'required|numeric|min:1',
            'is_negotiable' => 'boolean',
            'description' => 'nullable|string|max:5000',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'address' => 'nullable|string|max:255',
            'contact_name' => 'required|string|max:100',
            'contact_phone' => 'required|string|max:20',
            'contact_email' => 'required|email|max:255',
            'show_phone' => 'boolean',
            'show_email' => 'boolean',
        ]);

        // Create listing from garage vehicle
        $listingData = [
            'user_id' => Auth::id(),
            'title' => $garageVehicle->name . ' - ' . $garageVehicle->full_name,
            'slug' => Str::slug($garageVehicle->name . ' ' . $garageVehicle->full_name) . '-' . time(),
            'description' => $request->description ?: "Well-maintained {$garageVehicle->full_name} with complete maintenance history.",
            'category_id' => $garageVehicle->category_id,
            'make_id' => $garageVehicle->make_id,
            'model_id' => $garageVehicle->model_id,
            'price' => $request->price,
            'is_negotiable' => $request->is_negotiable ?? false,
            'year' => $garageVehicle->year,
            'color' => $garageVehicle->color,
            'condition' => $garageVehicle->condition,
            'transmission' => $garageVehicle->transmission,
            'fuel_type' => $garageVehicle->fuel_type,
            'engine_capacity' => $garageVehicle->engine_capacity,
            'engine_power' => $garageVehicle->engine_power,
            'mileage' => $garageVehicle->current_mileage,
            'city' => $request->city,
            'state' => $request->state,
            'address' => $request->address,
            'contact_name' => $request->contact_name,
            'contact_phone' => $request->contact_phone,
            'contact_email' => $request->contact_email,
            'show_phone' => $request->show_phone ?? true,
            'show_email' => $request->show_email ?? false,
            'features' => $garageVehicle->features,
            'status' => 'active',
            'is_featured' => false,
            'is_premium' => false,
        ];

        $listing = Vehicle::create($listingData);

        // Copy images from garage vehicle to listing
        if ($garageVehicle->images) {
            foreach ($garageVehicle->images as $index => $imagePath) {
                $listing->images()->create([
                    'path' => $imagePath,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        // Update garage vehicle status and link to listing
        $garageVehicle->update([
            'status' => 'for_sale',
            'listing_id' => $listing->id,
        ]);

        return response()->json([
            'message' => 'Vehicle listed for sale successfully',
            'data' => [
                'garage_vehicle' => $garageVehicle,
                'listing' => $listing,
            ]
        ]);
    }

    /**
     * Remove a garage vehicle from sale
     */
    public function removeFromSale(GarageVehicle $garageVehicle)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($garageVehicle->status !== 'for_sale' || !$garageVehicle->listing_id) {
            return response()->json(['message' => 'Vehicle is not currently for sale'], 400);
        }

        // Delete the listing
        $listing = Vehicle::find($garageVehicle->listing_id);
        if ($listing) {
            $listing->delete();
        }

        // Update garage vehicle status
        $garageVehicle->update([
            'status' => 'owned',
            'listing_id' => null,
        ]);

        return response()->json([
            'message' => 'Vehicle removed from sale successfully',
            'data' => $garageVehicle
        ]);
    }

    /**
     * Mark a garage vehicle as sold
     */
    public function markAsSold(GarageVehicle $garageVehicle)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update listing status if exists
        if ($garageVehicle->listing_id) {
            $listing = Vehicle::find($garageVehicle->listing_id);
            if ($listing) {
                $listing->update(['status' => 'sold']);
            }
        }

        // Update garage vehicle status
        $garageVehicle->update(['status' => 'sold']);

        return response()->json([
            'message' => 'Vehicle marked as sold successfully',
            'data' => $garageVehicle
        ]);
    }
}
