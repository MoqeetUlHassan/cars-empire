<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GarageVehicle;
use App\Models\MaintenanceLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MaintenanceLogController extends Controller
{
    /**
     * Get maintenance logs for a specific garage vehicle
     */
    public function index(Request $request, GarageVehicle $garageVehicle)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = $garageVehicle->maintenanceLogs();

        // Filter by maintenance type
        if ($request->filled('type')) {
            $query->where('maintenance_type', $request->type);
        }

        // Filter by date range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('service_date', [$request->start_date, $request->end_date]);
        }

        // Search by title or description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('service_provider', 'like', "%{$search}%");
            });
        }

        $logs = $query->orderBy('service_date', 'desc')->paginate(15);

        // Add computed fields
        $logs->getCollection()->transform(function ($log) {
            $log->formatted_cost = $log->formatted_cost;
            $log->service_date_human = $log->service_date_human;
            $log->next_service_date_human = $log->next_service_date_human;
            $log->service_due_soon = $log->service_due_soon;
            return $log;
        });

        return response()->json([
            'message' => 'Maintenance logs retrieved successfully',
            'data' => $logs
        ]);
    }

    /**
     * Store a new maintenance log
     */
    public function store(Request $request, GarageVehicle $garageVehicle)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'service_date' => 'required|date|before_or_equal:today',
            'mileage_at_service' => 'required|integer|min:0',
            'service_provider' => 'nullable|string|max:255',
            'service_provider_contact' => 'nullable|string|max:100',
            'cost' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'maintenance_type' => 'required|in:routine,repair,upgrade,inspection,other',
            'parts_used' => 'nullable|array',
            'parts_used.*.name' => 'required|string|max:255',
            'parts_used.*.cost' => 'nullable|numeric|min:0',
            'parts_used.*.quantity' => 'nullable|integer|min:1',
            'labor_cost' => 'nullable|numeric|min:0',
            'parts_cost' => 'nullable|numeric|min:0',
            'bill_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,pdf|max:10240',
            'additional_images' => 'nullable|array|max:5',
            'additional_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240',
            'invoice_number' => 'nullable|string|max:100',
            'next_service_date' => 'nullable|date|after:service_date',
            'next_service_mileage' => 'nullable|integer|min:0',
            'status' => 'nullable|in:completed,pending,scheduled',
        ]);

        $logData = $request->except(['bill_image', 'additional_images']);
        $logData['garage_vehicle_id'] = $garageVehicle->id;
        $logData['user_id'] = Auth::id();
        $logData['currency'] = $logData['currency'] ?? 'PKR';
        $logData['status'] = $logData['status'] ?? 'completed';

        // Handle bill image upload
        if ($request->hasFile('bill_image')) {
            $billPath = $request->file('bill_image')->store(
                'garage/maintenance/' . $garageVehicle->id, 
                'public'
            );
            $logData['bill_image'] = $billPath;
        }

        // Handle additional images upload
        if ($request->hasFile('additional_images')) {
            $additionalImagePaths = [];
            foreach ($request->file('additional_images') as $image) {
                $path = $image->store(
                    'garage/maintenance/' . $garageVehicle->id, 
                    'public'
                );
                $additionalImagePaths[] = $path;
            }
            $logData['additional_images'] = $additionalImagePaths;
        }

        $log = MaintenanceLog::create($logData);

        // Update garage vehicle mileage if this is the latest service
        if ($log->mileage_at_service > $garageVehicle->current_mileage) {
            $garageVehicle->update(['current_mileage' => $log->mileage_at_service]);
        }

        return response()->json([
            'message' => 'Maintenance log created successfully',
            'data' => $log
        ], 201);
    }

    /**
     * Show a specific maintenance log
     */
    public function show(GarageVehicle $garageVehicle, MaintenanceLog $maintenanceLog)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id() || $maintenanceLog->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if log belongs to the garage vehicle
        if ($maintenanceLog->garage_vehicle_id !== $garageVehicle->id) {
            return response()->json(['message' => 'Maintenance log not found for this vehicle'], 404);
        }

        // Add computed fields
        $maintenanceLog->formatted_cost = $maintenanceLog->formatted_cost;
        $maintenanceLog->service_date_human = $maintenanceLog->service_date_human;
        $maintenanceLog->next_service_date_human = $maintenanceLog->next_service_date_human;
        $maintenanceLog->service_due_soon = $maintenanceLog->service_due_soon;

        return response()->json([
            'message' => 'Maintenance log retrieved successfully',
            'data' => $maintenanceLog
        ]);
    }

    /**
     * Update a maintenance log
     */
    public function update(Request $request, GarageVehicle $garageVehicle, MaintenanceLog $maintenanceLog)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id() || $maintenanceLog->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if log belongs to the garage vehicle
        if ($maintenanceLog->garage_vehicle_id !== $garageVehicle->id) {
            return response()->json(['message' => 'Maintenance log not found for this vehicle'], 404);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'service_date' => 'sometimes|date|before_or_equal:today',
            'mileage_at_service' => 'sometimes|integer|min:0',
            'service_provider' => 'nullable|string|max:255',
            'service_provider_contact' => 'nullable|string|max:100',
            'cost' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'maintenance_type' => 'sometimes|in:routine,repair,upgrade,inspection,other',
            'parts_used' => 'nullable|array',
            'parts_used.*.name' => 'required|string|max:255',
            'parts_used.*.cost' => 'nullable|numeric|min:0',
            'parts_used.*.quantity' => 'nullable|integer|min:1',
            'labor_cost' => 'nullable|numeric|min:0',
            'parts_cost' => 'nullable|numeric|min:0',
            'bill_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,pdf|max:10240',
            'additional_images' => 'nullable|array|max:5',
            'additional_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240',
            'invoice_number' => 'nullable|string|max:100',
            'next_service_date' => 'nullable|date|after:service_date',
            'next_service_mileage' => 'nullable|integer|min:0',
            'status' => 'nullable|in:completed,pending,scheduled',
        ]);

        $logData = $request->except(['bill_image', 'additional_images']);

        // Handle bill image upload
        if ($request->hasFile('bill_image')) {
            // Delete old bill image
            if ($maintenanceLog->bill_image) {
                Storage::disk('public')->delete($maintenanceLog->bill_image);
            }

            $billPath = $request->file('bill_image')->store(
                'garage/maintenance/' . $garageVehicle->id, 
                'public'
            );
            $logData['bill_image'] = $billPath;
        }

        // Handle additional images upload
        if ($request->hasFile('additional_images')) {
            // Delete old additional images
            if ($maintenanceLog->additional_images) {
                foreach ($maintenanceLog->additional_images as $oldImage) {
                    Storage::disk('public')->delete($oldImage);
                }
            }

            $additionalImagePaths = [];
            foreach ($request->file('additional_images') as $image) {
                $path = $image->store(
                    'garage/maintenance/' . $garageVehicle->id, 
                    'public'
                );
                $additionalImagePaths[] = $path;
            }
            $logData['additional_images'] = $additionalImagePaths;
        }

        $maintenanceLog->update($logData);

        // Update garage vehicle mileage if this is the latest service
        if (isset($logData['mileage_at_service']) && $logData['mileage_at_service'] > $garageVehicle->current_mileage) {
            $garageVehicle->update(['current_mileage' => $logData['mileage_at_service']]);
        }

        return response()->json([
            'message' => 'Maintenance log updated successfully',
            'data' => $maintenanceLog
        ]);
    }

    /**
     * Delete a maintenance log
     */
    public function destroy(GarageVehicle $garageVehicle, MaintenanceLog $maintenanceLog)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id() || $maintenanceLog->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if log belongs to the garage vehicle
        if ($maintenanceLog->garage_vehicle_id !== $garageVehicle->id) {
            return response()->json(['message' => 'Maintenance log not found for this vehicle'], 404);
        }

        // Delete images
        if ($maintenanceLog->bill_image) {
            Storage::disk('public')->delete($maintenanceLog->bill_image);
        }

        if ($maintenanceLog->additional_images) {
            foreach ($maintenanceLog->additional_images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $maintenanceLog->delete();

        return response()->json([
            'message' => 'Maintenance log deleted successfully'
        ]);
    }

    /**
     * Get maintenance statistics for a garage vehicle
     */
    public function statistics(GarageVehicle $garageVehicle)
    {
        // Check ownership
        if ($garageVehicle->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stats = [
            'total_logs' => $garageVehicle->maintenanceLogs()->count(),
            'total_cost' => $garageVehicle->maintenanceLogs()->sum('cost') ?? 0,
            'average_cost' => $garageVehicle->maintenanceLogs()->avg('cost') ?? 0,
            'routine_maintenance' => $garageVehicle->maintenanceLogs()->where('maintenance_type', 'routine')->count(),
            'repairs' => $garageVehicle->maintenanceLogs()->where('maintenance_type', 'repair')->count(),
            'upgrades' => $garageVehicle->maintenanceLogs()->where('maintenance_type', 'upgrade')->count(),
            'inspections' => $garageVehicle->maintenanceLogs()->where('maintenance_type', 'inspection')->count(),
            'last_service_date' => $garageVehicle->maintenanceLogs()->max('service_date'),
            'upcoming_services' => $garageVehicle->maintenanceLogs()
                ->whereNotNull('next_service_date')
                ->where('next_service_date', '>=', now())
                ->count(),
        ];

        return response()->json([
            'message' => 'Maintenance statistics retrieved successfully',
            'data' => $stats
        ]);
    }
}
