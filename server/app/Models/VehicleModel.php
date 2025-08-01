<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'make_id',
        'name',
        'slug',
        'year_start',
        'year_end',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the make that owns the model.
     */
    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class, 'make_id');
    }

    /**
     * Get the vehicles for the model.
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class, 'model_id');
    }

    /**
     * Scope a query to only include active models.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by year range.
     */
    public function scopeForYear($query, $year)
    {
        return $query->where(function ($q) use ($year) {
            $q->where('year_start', '<=', $year)
              ->where(function ($subQ) use ($year) {
                  $subQ->whereNull('year_end')
                       ->orWhere('year_end', '>=', $year);
              });
        });
    }

    /**
     * Get the full model name with make.
     */
    public function getFullNameAttribute(): string
    {
        return $this->make->name . ' ' . $this->name;
    }
}
