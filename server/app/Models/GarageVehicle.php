<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GarageVehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'make_id',
        'model_id',
        'name',
        'license_plate',
        'year',
        'color',
        'vin',
        'purchase_price',
        'purchase_date',
        'current_mileage',
        'condition',
        'transmission',
        'fuel_type',
        'engine_capacity',
        'engine_power',
        'insurance_company',
        'insurance_policy_number',
        'insurance_expiry',
        'registration_expiry',
        'status',
        'listing_id',
        'notes',
        'features',
        'images',
        'video',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'insurance_expiry' => 'date',
        'registration_expiry' => 'date',
        'features' => 'array',
        'images' => 'array',
        'purchase_price' => 'decimal:2',
    ];

    /**
     * Get the user that owns the garage vehicle.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category of the garage vehicle.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(VehicleCategory::class);
    }

    /**
     * Get the make of the garage vehicle.
     */
    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class);
    }

    /**
     * Get the model of the garage vehicle.
     */
    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class);
    }

    /**
     * Get the maintenance logs for the garage vehicle.
     */
    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class)->orderBy('service_date', 'desc');
    }

    /**
     * Get the associated listing if the vehicle is for sale.
     */
    public function listing(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'listing_id');
    }

    /**
     * Get the total maintenance cost for this vehicle.
     */
    public function getTotalMaintenanceCostAttribute(): float
    {
        return $this->maintenanceLogs()->sum('cost') ?? 0;
    }

    /**
     * Get the latest maintenance log.
     */
    public function getLatestMaintenanceAttribute()
    {
        return $this->maintenanceLogs()->first();
    }

    /**
     * Get upcoming maintenance (based on next service dates).
     */
    public function getUpcomingMaintenanceAttribute()
    {
        return $this->maintenanceLogs()
            ->whereNotNull('next_service_date')
            ->where('next_service_date', '>=', now())
            ->orderBy('next_service_date')
            ->first();
    }

    /**
     * Check if insurance is expiring soon (within 30 days).
     */
    public function getInsuranceExpiringSoonAttribute(): bool
    {
        if (!$this->insurance_expiry) {
            return false;
        }

        return $this->insurance_expiry->diffInDays(now()) <= 30;
    }

    /**
     * Check if registration is expiring soon (within 30 days).
     */
    public function getRegistrationExpiringSoonAttribute(): bool
    {
        if (!$this->registration_expiry) {
            return false;
        }

        return $this->registration_expiry->diffInDays(now()) <= 30;
    }

    /**
     * Get the vehicle's full name (make model year).
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->make->name} {$this->model->name} {$this->year}";
    }

    /**
     * Scope to get vehicles by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get vehicles with expiring documents.
     */
    public function scopeWithExpiringDocuments($query, $days = 30)
    {
        return $query->where(function ($q) use ($days) {
            $q->where('insurance_expiry', '<=', now()->addDays($days))
              ->orWhere('registration_expiry', '<=', now()->addDays($days));
        });
    }
}
