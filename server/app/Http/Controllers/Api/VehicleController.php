<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VehicleSearchRequest;
use App\Http\Requests\VehicleShowRequest;
use App\Models\Vehicle;

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
            $searchTerm = $request->query;
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
                'transmission', 'fuel_type'
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
}
