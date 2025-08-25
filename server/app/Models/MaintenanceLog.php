<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'garage_vehicle_id',
        'user_id',
        'title',
        'description',
        'service_date',
        'mileage_at_service',
        'service_provider',
        'service_provider_contact',
        'cost',
        'currency',
        'maintenance_type',
        'parts_used',
        'labor_cost',
        'parts_cost',
        'bill_image',
        'additional_images',
        'invoice_number',
        'next_service_date',
        'next_service_mileage',
        'status',
    ];

    protected $casts = [
        'service_date' => 'date',
        'next_service_date' => 'date',
        'parts_used' => 'array',
        'additional_images' => 'array',
        'cost' => 'decimal:2',
        'labor_cost' => 'decimal:2',
        'parts_cost' => 'decimal:2',
    ];

    /**
     * Get the garage vehicle that owns the maintenance log.
     */
    public function garageVehicle(): BelongsTo
    {
        return $this->belongsTo(GarageVehicle::class);
    }

    /**
     * Get the user that owns the maintenance log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the formatted cost with currency.
     */
    public function getFormattedCostAttribute(): string
    {
        if (!$this->cost) {
            return 'N/A';
        }
        
        return $this->currency . ' ' . number_format($this->cost, 2);
    }

    /**
     * Get the service date in human readable format.
     */
    public function getServiceDateHumanAttribute(): string
    {
        return $this->service_date->format('M d, Y');
    }

    /**
     * Get the next service date in human readable format.
     */
    public function getNextServiceDateHumanAttribute(): ?string
    {
        return $this->next_service_date?->format('M d, Y');
    }

    /**
     * Check if next service is due soon (within 30 days or mileage).
     */
    public function getServiceDueSoonAttribute(): bool
    {
        if ($this->next_service_date && $this->next_service_date->diffInDays(now()) <= 30) {
            return true;
        }
        
        if ($this->next_service_mileage && $this->garageVehicle) {
            $mileageDiff = $this->next_service_mileage - $this->garageVehicle->current_mileage;
            return $mileageDiff <= 1000; // Due within 1000 km
        }
        
        return false;
    }

    /**
     * Scope to get logs by maintenance type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('maintenance_type', $type);
    }

    /**
     * Scope to get logs within date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('service_date', [$startDate, $endDate]);
    }

    /**
     * Scope to get logs with upcoming service.
     */
    public function scopeWithUpcomingService($query, $days = 30)
    {
        return $query->whereNotNull('next_service_date')
                    ->where('next_service_date', '<=', now()->addDays($days));
    }

    /**
     * Scope to get recent logs.
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('service_date', '>=', now()->subDays($days));
    }
}
