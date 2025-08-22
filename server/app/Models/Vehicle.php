<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'make_id',
        'model_id',
        'title',
        'slug',
        'description',
        'price',
        'is_negotiable',
        'year',
        'color',
        'mileage',
        'condition',
        'transmission',
        'fuel_type',
        'engine_capacity',
        'engine_power',
        'city',
        'state',
        'address',
        'latitude',
        'longitude',
        'status',
        'is_featured',
        'is_premium',
        'featured_until',
        'expires_at',
        'views_count',
        'favorites_count',
        'contact_name',
        'contact_phone',
        'contact_email',
        'social_media_links',
        'video_path',
        'video_thumbnail_path',
        'video_duration',
        'video_size',
        'show_phone',
        'show_email',
        'features',
        'safety_features',
        'exterior_features',
        'interior_features',
    ];

    protected function casts(): array
    {
        return [
            'is_negotiable' => 'boolean',
            'is_featured' => 'boolean',
            'is_premium' => 'boolean',
            'show_phone' => 'boolean',
            'show_email' => 'boolean',
            'featured_until' => 'datetime',
            'expires_at' => 'datetime',
            'features' => 'array',
            'safety_features' => 'array',
            'exterior_features' => 'array',
            'interior_features' => 'array',
            'social_media_links' => 'array',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    /**
     * Get the user that owns the vehicle.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category that owns the vehicle.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(VehicleCategory::class, 'category_id');
    }

    /**
     * Get the make that owns the vehicle.
     */
    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class, 'make_id');
    }

    /**
     * Get the model that owns the vehicle.
     */
    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }

    /**
     * Get the images for the vehicle.
     */
    public function images(): HasMany
    {
        return $this->hasMany(VehicleImage::class);
    }

    /**
     * Get the favorites for the vehicle.
     */
    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    /**
     * Scope a query to only include active vehicles.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include featured vehicles.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Get the formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rs ' . number_format($this->price);
    }

    /**
     * Get the primary image.
     */
    public function getPrimaryImageAttribute()
    {
        return $this->images()->where('is_primary', true)->first()
            ?? $this->images()->first();
    }
}
