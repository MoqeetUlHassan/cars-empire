<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleImage extends Model
{
    protected $fillable = [
        'vehicle_id',
        'path',
        'original_name',
        'alt_text',
        'size',
        'mime_type',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    /**
     * Get the vehicle that owns the image.
     */
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
