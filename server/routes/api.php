<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomVehicleDataController;
use App\Http\Controllers\Api\GarageController;
use App\Http\Controllers\Api\MaintenanceLogController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\VehicleDataController;
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



// Vehicle routes (public)
Route::get('/vehicles/search', [VehicleController::class, 'search']);
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show']);

// Public vehicle data routes
Route::get('/categories', [VehicleDataController::class, 'getCategories']);
Route::get('/category-counts', [VehicleDataController::class, 'getCategoryCounts']);
Route::get('/featured-vehicles', [VehicleDataController::class, 'getFeaturedVehicles']);
Route::get('/makes', [VehicleDataController::class, 'getPublicMakes']);
Route::get('/models', [VehicleDataController::class, 'getPublicModels']);

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

    // Custom vehicle data management
    Route::get('/vehicle-data/makes', [CustomVehicleDataController::class, 'getMakes']);
    Route::get('/vehicle-data/models', [CustomVehicleDataController::class, 'getModels']);
    Route::post('/vehicle-data/makes', [CustomVehicleDataController::class, 'createMake']);
    Route::post('/vehicle-data/models', [CustomVehicleDataController::class, 'createModel']);

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
