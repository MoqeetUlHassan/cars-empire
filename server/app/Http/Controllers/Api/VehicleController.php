<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller
{
    /**
     * Search vehicles with filters
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:car,bike,truck',
            'category_id' => 'nullable|exists:vehicle_categories,id',
            'make_id' => 'nullable|exists:vehicle_makes,id',
            'model_id' => 'nullable|exists:vehicle_models,id',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'city' => 'nullable|string|max:100',
            'condition' => 'nullable|string|in:new,used,certified_pre_owned',
            'transmission' => 'nullable|string|in:manual,automatic,cvt,semi_automatic',
            'fuel_type' => 'nullable|string|in:petrol,diesel,hybrid,electric,cng,lpg',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
            'sort_by' => 'nullable|string|in:price,year,created_at,views_count',
            'sort_order' => 'nullable|string|in:asc,desc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

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
    public function index(Request $request)
    {
        return $this->search($request);
    }

    /**
     * Get vehicle by ID
     */
    public function show($id)
    {
        $vehicle = Vehicle::with(['category', 'make', 'model', 'images', 'user'])
            ->where('status', 'active')
            ->findOrFail($id);

        // Increment view count
        $vehicle->increment('views_count');

        return response()->json([
            'message' => 'Vehicle retrieved successfully',
            'data' => $vehicle
        ]);
    }
}
