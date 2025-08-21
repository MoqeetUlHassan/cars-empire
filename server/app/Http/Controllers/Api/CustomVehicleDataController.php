<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CustomVehicleDataController extends Controller
{
    /**
     * Create a custom vehicle make
     */
    public function createMake(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:vehicle_categories,id',
            'name' => 'required|string|max:255|min:2',
            'country' => 'nullable|string|max:100',
        ]);

        // Check if make already exists for this user or globally
        $existingMake = VehicleMake::where('category_id', $request->category_id)
            ->where('name', 'LIKE', $request->name)
            ->where(function ($query) {
                $query->whereNull('user_id')
                      ->orWhere('user_id', Auth::id());
            })
            ->first();

        if ($existingMake) {
            return response()->json([
                'message' => 'A make with this name already exists',
                'data' => $existingMake
            ], 409);
        }

        // Create custom make
        $make = VehicleMake::create([
            'category_id' => $request->category_id,
            'user_id' => Auth::id(),
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Auth::id(),
            'country' => $request->country,
            'is_active' => true,
            'sort_order' => 999, // Custom makes appear at the end
        ]);

        return response()->json([
            'message' => 'Custom make created successfully',
            'data' => $make
        ], 201);
    }

    /**
     * Create a custom vehicle model
     */
    public function createModel(Request $request)
    {
        $request->validate([
            'make_id' => 'required|exists:vehicle_makes,id',
            'name' => 'required|string|max:255|min:2',
            'year_start' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'year_end' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
        ]);

        // Verify user has access to this make
        $make = VehicleMake::where('id', $request->make_id)
            ->where(function ($query) {
                $query->whereNull('user_id')
                      ->orWhere('user_id', Auth::id());
            })
            ->first();

        if (!$make) {
            return response()->json([
                'message' => 'Make not found or access denied'
            ], 404);
        }

        // Check if model already exists for this make and user
        $existingModel = VehicleModel::where('make_id', $request->make_id)
            ->where('name', 'LIKE', $request->name)
            ->where(function ($query) {
                $query->whereNull('user_id')
                      ->orWhere('user_id', Auth::id());
            })
            ->first();

        if ($existingModel) {
            return response()->json([
                'message' => 'A model with this name already exists for this make',
                'data' => $existingModel
            ], 409);
        }

        // Create custom model
        $model = VehicleModel::create([
            'make_id' => $request->make_id,
            'user_id' => Auth::id(),
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Auth::id(),
            'year_start' => $request->year_start,
            'year_end' => $request->year_end,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Custom model created successfully',
            'data' => $model
        ], 201);
    }

    /**
     * Get makes available to the authenticated user
     */
    public function getMakes(Request $request)
    {
        $query = VehicleMake::availableToUser(Auth::id())
            ->where('is_active', true);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $makes = $query->orderByRaw('user_id IS NULL DESC') // Global makes first
                      ->orderBy('sort_order')
                      ->orderBy('name')
                      ->get();

        return response()->json([
            'data' => $makes->map(function ($make) {
                return [
                    'id' => $make->id,
                    'name' => $make->name,
                    'country' => $make->country,
                    'is_custom' => $make->isCustom(),
                    'category_id' => $make->category_id,
                ];
            })
        ]);
    }

    /**
     * Get models available to the authenticated user
     */
    public function getModels(Request $request)
    {
        $query = VehicleModel::availableToUser(Auth::id())
            ->where('is_active', true);

        if ($request->filled('make_id')) {
            $query->where('make_id', $request->make_id);
        }

        $models = $query->orderByRaw('user_id IS NULL DESC') // Global models first
                       ->orderBy('name')
                       ->get();

        return response()->json([
            'data' => $models->map(function ($model) {
                return [
                    'id' => $model->id,
                    'name' => $model->name,
                    'year_start' => $model->year_start,
                    'year_end' => $model->year_end,
                    'is_custom' => $model->isCustom(),
                    'make_id' => $model->make_id,
                ];
            })
        ]);
    }
}
