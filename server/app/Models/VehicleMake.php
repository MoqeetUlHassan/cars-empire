<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleMake extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'user_id',
        'name',
        'slug',
        'logo',
        'country',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the category that owns the make.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(VehicleCategory::class, 'category_id');
    }

    /**
     * Get the user that owns the make (for custom makes).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the models for the make.
     */
    public function models(): HasMany
    {
        return $this->hasMany(VehicleModel::class, 'make_id');
    }

    /**
     * Scope to get makes available to a specific user (global + user's custom)
     */
    public function scopeAvailableToUser($query, $userId = null)
    {
        return $query->where(function ($q) use ($userId) {
            $q->whereNull('user_id'); // Global makes
            if ($userId) {
                $q->orWhere('user_id', $userId); // User's custom makes
            }
        });
    }

    /**
     * Check if this is a custom make created by a user
     */
    public function isCustom(): bool
    {
        return !is_null($this->user_id);
    }

    /**
     * Get the vehicles for the make.
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class, 'make_id');
    }

    /**
     * Scope a query to only include active makes.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
