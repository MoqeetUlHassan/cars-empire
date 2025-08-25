<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomVehicleDataController;
use App\Http\Controllers\Api\GarageController;
use App\Http\Controllers\Api\MaintenanceLogController;
use App\Http\Controllers\Api\UserController;
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

// Vehicle data routes (public)
Route::get('/vehicle-data/categories', function () {
    return response()->json([
        'message' => 'Categories retrieved successfully',
        'data' => \App\Models\VehicleCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
    ]);
});

Route::get('/vehicle-data/makes', function () {
    return response()->json([
        'message' => 'Makes retrieved successfully',
        'data' => \App\Models\VehicleMake::where('is_active', true)
            ->orderBy('name')
            ->get()
    ]);
});

Route::get('/vehicle-data/models', function () {
    $makeId = request('make_id');
    $query = \App\Models\VehicleModel::where('is_active', true);

    if ($makeId) {
        $query->where('make_id', $makeId);
    }

    return response()->json([
        'message' => 'Models retrieved successfully',
        'data' => $query->orderBy('name')->get()
    ]);
});



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

// Featured vehicles (public)
Route::get('/featured-vehicles', function () {
    $featuredVehicles = \App\Models\Vehicle::where('status', 'active')
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

    // User profile management
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::delete('/profile/avatar', [UserController::class, 'deleteAvatar']);
    Route::get('/profile/activity', [UserController::class, 'activitySummary']);

    // Garage management
    Route::get('/garage', [GarageController::class, 'index']);
    Route::post('/garage', [GarageController::class, 'store']);
    Route::get('/garage/statistics', [GarageController::class, 'statistics']);
    Route::get('/garage/{garageVehicle}', [GarageController::class, 'show']);
    Route::put('/garage/{garageVehicle}', [GarageController::class, 'update']);
    Route::delete('/garage/{garageVehicle}', [GarageController::class, 'destroy']);

    // Garage vehicle actions
    Route::post('/garage/{garageVehicle}/list-for-sale', [GarageController::class, 'listForSale']);
    Route::post('/garage/{garageVehicle}/remove-from-sale', [GarageController::class, 'removeFromSale']);
    Route::post('/garage/{garageVehicle}/mark-as-sold', [GarageController::class, 'markAsSold']);

    // Maintenance logs
    Route::get('/garage/{garageVehicle}/maintenance', [MaintenanceLogController::class, 'index']);
    Route::post('/garage/{garageVehicle}/maintenance', [MaintenanceLogController::class, 'store']);
    Route::get('/garage/{garageVehicle}/maintenance/statistics', [MaintenanceLogController::class, 'statistics']);
    Route::get('/garage/{garageVehicle}/maintenance/{maintenanceLog}', [MaintenanceLogController::class, 'show']);
    Route::put('/garage/{garageVehicle}/maintenance/{maintenanceLog}', [MaintenanceLogController::class, 'update']);
    Route::delete('/garage/{garageVehicle}/maintenance/{maintenanceLog}', [MaintenanceLogController::class, 'destroy']);

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

    // Video management
    Route::delete('/vehicles/{vehicle}/video', [VehicleController::class, 'deleteVideo'])->middleware('vehicle.owner');

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
