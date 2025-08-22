<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomVehicleDataController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!', 'timestamp' => now()]);
});

Route::get('/categories', function () {
    return response()->json([
        'message' => 'Categories retrieved successfully',
        'data' => \App\Models\VehicleCategory::all()
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);



// Vehicle routes (public)
Route::get('/vehicles/search', [VehicleController::class, 'search']);
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show']);

// Categories, Makes, Models (public)
Route::get('/categories', function () {
    return response()->json([
        'data' => \App\Models\VehicleCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
    ]);
});

// Category counts (public)
Route::get('/category-counts', function () {
    $categories = \App\Models\VehicleCategory::where('is_active', true)->get();
    $counts = [];

    foreach ($categories as $category) {
        $counts[$category->slug] = \App\Models\Vehicle::where('category_id', $category->id)
            ->where('status', 'active')
            ->count();
    }

    return response()->json([
        'data' => $counts
    ]);
});

// Public makes (only global ones)
Route::get('/makes', function (Request $request) {
    $query = \App\Models\VehicleMake::where('is_active', true)
        ->whereNull('user_id'); // Only global makes for public

    if ($request->filled('category_id')) {
        $query->where('category_id', $request->category_id);
    }

    return response()->json([
        'data' => $query->orderBy('sort_order')->get()
    ]);
});

// Public models (only global ones)
Route::get('/models', function (Request $request) {
    $query = \App\Models\VehicleModel::where('is_active', true)
        ->whereNull('user_id'); // Only global models for public

    if ($request->filled('make_id')) {
        $query->where('make_id', $request->make_id);
    }

    return response()->json([
        'data' => $query->orderBy('name')->get()
    ]);
});

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Vehicle CRUD operations (authenticated)
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{vehicle}', [VehicleController::class, 'update'])->middleware('vehicle.owner');
    Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy'])->middleware('vehicle.owner');

    // User's vehicles
    Route::get('/my-vehicles', [VehicleController::class, 'myVehicles']);
    Route::get('/my-vehicle-stats', [VehicleController::class, 'myVehicleStats']);

    // Image management
    Route::post('/vehicles/{vehicle}/images', [VehicleController::class, 'uploadImages'])->middleware('vehicle.owner');
    Route::delete('/vehicles/{vehicle}/images/{imageId}', [VehicleController::class, 'deleteImage'])->middleware('vehicle.owner');

    // Custom vehicle data (authenticated users get global + their custom data)
    Route::get('/user-makes', [CustomVehicleDataController::class, 'getMakes']);
    Route::get('/user-models', [CustomVehicleDataController::class, 'getModels']);
    Route::post('/custom-makes', [CustomVehicleDataController::class, 'createMake']);
    Route::post('/custom-models', [CustomVehicleDataController::class, 'createModel']);

    // Test route for user data
    Route::get('/test-user-data', function () {
        $user = \Illuminate\Support\Facades\Auth::user();
        $vehicleCount = \App\Models\Vehicle::where('user_id', $user->id)->count();

        return response()->json([
            'message' => 'User vehicle data endpoints',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'vehicle_count' => $vehicleCount,
            'endpoints' => [
                'GET /my-vehicles - Get user\'s vehicles with filtering/sorting',
                'GET /my-vehicle-stats - Get user\'s vehicle statistics',
                'PUT /vehicles/{id} - Update user\'s vehicle',
                'DELETE /vehicles/{id} - Delete user\'s vehicle',
            ],
            'available_filters' => [
                'status' => ['active', 'draft', 'sold', 'expired'],
                'sort_by' => ['created_at', 'updated_at', 'title', 'price', 'year', 'views_count'],
                'sort_order' => ['asc', 'desc'],
            ]
        ]);
    });


});
