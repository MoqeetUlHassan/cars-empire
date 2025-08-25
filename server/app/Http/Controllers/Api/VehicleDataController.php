<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Http\Request;

class VehicleDataController extends Controller
{
    /**
     * Get all active categories (public)
     */
    public function getCategories()
    {
        return response()->json([
            'data' => VehicleCategory::where('is_active', true)
                ->orderBy('sort_order')
                ->get()
        ]);
    }

    /**
     * Get category counts (public)
     */
    public function getCategoryCounts()
    {
        $categories = VehicleCategory::where('is_active', true)->get();
        $counts = [];

        foreach ($categories as $category) {
            $counts[$category->slug] = Vehicle::where('category_id', $category->id)
                ->where('status', 'active')
                ->count();
        }

        return response()->json([
            'data' => $counts
        ]);
    }

    /**
     * Get featured vehicles (public)
     */
    public function getFeaturedVehicles()
    {
        $featuredVehicles = Vehicle::where('status', 'active')
            ->where('is_featured', true)
            ->with(['category', 'make', 'model', 'images', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        // Transform the data to include additional computed fields
        $featuredVehicles->transform(function ($vehicle) {
            // Add primary image
            $vehicle->primary_image = $vehicle->images->where('is_primary', true)->first()
                ?: $vehicle->images->first();

            // Add formatted price
            $vehicle->formatted_price = 'Rs ' . number_format($vehicle->price);

            // Add time ago
            $vehicle->created_at_human = $vehicle->created_at->diffForHumans();

            return $vehicle;
        });

        return response()->json([
            'data' => $featuredVehicles
        ]);
    }

    /**
     * Get public makes (only global ones, no custom makes)
     */
    public function getPublicMakes(Request $request)
    {
        $query = VehicleMake::where('is_active', true)
            ->whereNull('user_id'); // Only global makes for public

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json([
            'data' => $query->orderBy('sort_order')->get()
        ]);
    }

    /**
     * Get public models (only global ones, no custom models)
     */
    public function getPublicModels(Request $request)
    {
        $query = VehicleModel::where('is_active', true)
            ->whereNull('user_id'); // Only global models for public

        if ($request->filled('make_id')) {
            $query->where('make_id', $request->make_id);
        }

        return response()->json([
            'data' => $query->orderBy('name')->get()
        ]);
    }
}
