<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class UpdateVehicleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $vehicle = $this->route('vehicle');

        // User must be authenticated and own the vehicle
        return Auth::check() && $vehicle && $vehicle->user_id === Auth::id();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Basic vehicle information (all optional for updates)
            'title' => 'sometimes|string|max:255|min:10',
            'description' => 'sometimes|string|min:50|max:5000',
            'category_id' => 'sometimes|exists:vehicle_categories,id',
            'make_id' => 'sometimes|exists:vehicle_makes,id',
            'model_id' => 'sometimes|exists:vehicle_models,id',

            // Price and negotiation
            'price' => 'sometimes|numeric|min:1|max:999999999',
            'is_negotiable' => 'sometimes|boolean',

            // Vehicle specifications
            'year' => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'color' => 'sometimes|string|max:50',
            'condition' => 'sometimes|string|in:new,used,certified_pre_owned',
            'transmission' => 'sometimes|string|in:manual,automatic,cvt,semi_automatic',
            'fuel_type' => 'sometimes|string|in:petrol,diesel,hybrid,electric,cng,lpg',
            'engine_capacity' => 'sometimes|string|max:20',
            'engine_power' => 'sometimes|numeric|min:1|max:2000',
            'mileage' => 'sometimes|numeric|min:0|max:9999999',

            // Location
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'address' => 'sometimes|string|max:500',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',

            // Contact information
            'contact_name' => 'sometimes|string|max:255',
            'contact_phone' => 'sometimes|string|max:20|regex:/^[\+]?[0-9\-\(\)\s]+$/',
            'contact_email' => 'sometimes|email|max:255',
            'show_phone' => 'sometimes|boolean',
            'show_email' => 'sometimes|boolean',

            // Features (arrays)
            'features' => 'sometimes|array',
            'features.*' => 'string|max:100',
            'safety_features' => 'sometimes|array',
            'safety_features.*' => 'string|max:100',
            'exterior_features' => 'sometimes|array',
            'exterior_features.*' => 'string|max:100',
            'interior_features' => 'sometimes|array',
            'interior_features.*' => 'string|max:100',

            // Images
            'images' => 'sometimes|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max per image

            // Status and listing options
            'status' => 'sometimes|string|in:active,draft,sold,expired',
            'is_featured' => 'sometimes|boolean',
            'is_premium' => 'sometimes|boolean',
            'expires_at' => 'sometimes|date|after:today',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'title.min' => 'Title must be at least 10 characters long',
            'description.min' => 'Description must be at least 50 characters long',
            'description.max' => 'Description cannot exceed 5000 characters',
            'category_id.exists' => 'Selected category is invalid',
            'make_id.exists' => 'Selected make is invalid',
            'model_id.exists' => 'Selected model is invalid',
            'price.min' => 'Price must be at least 1',
            'price.max' => 'Price cannot exceed 999,999,999',
            'year.min' => 'Year cannot be before 1900',
            'year.max' => 'Year cannot be in the future',
            'condition.in' => 'Condition must be new, used, or certified pre-owned',
            'transmission.in' => 'Invalid transmission type',
            'fuel_type.in' => 'Invalid fuel type',
            'contact_phone.regex' => 'Please provide a valid phone number',
            'contact_email.email' => 'Please provide a valid email address',
            'images.max' => 'You can upload maximum 10 images',
            'images.*.image' => 'All files must be images',
            'images.*.mimes' => 'Images must be jpeg, png, jpg, or gif format',
            'images.*.max' => 'Each image must be less than 5MB',
            'status.in' => 'Status must be active, draft, sold, or expired',
            'expires_at.after' => 'Expiry date must be in the future',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'category_id' => 'vehicle category',
            'make_id' => 'vehicle make',
            'model_id' => 'vehicle model',
            'is_negotiable' => 'price negotiable',
            'engine_capacity' => 'engine capacity',
            'engine_power' => 'engine power',
            'contact_name' => 'contact name',
            'contact_phone' => 'contact phone',
            'contact_email' => 'contact email',
            'show_phone' => 'show phone publicly',
            'show_email' => 'show email publicly',
            'is_featured' => 'featured listing',
            'is_premium' => 'premium listing',
            'expires_at' => 'listing expiry date',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Update slug if title is being updated
        if ($this->has('title')) {
            $this->merge([
                'slug' => Str::slug($this->title) . '-' . time()
            ]);
        }

        // Convert boolean fields if they exist
        if ($this->has('is_negotiable')) {
            $this->merge(['is_negotiable' => $this->boolean('is_negotiable')]);
        }
        if ($this->has('show_phone')) {
            $this->merge(['show_phone' => $this->boolean('show_phone')]);
        }
        if ($this->has('show_email')) {
            $this->merge(['show_email' => $this->boolean('show_email')]);
        }
        if ($this->has('is_featured')) {
            $this->merge(['is_featured' => $this->boolean('is_featured')]);
        }
        if ($this->has('is_premium')) {
            $this->merge(['is_premium' => $this->boolean('is_premium')]);
        }

        // Clean phone number if provided
        if ($this->has('contact_phone')) {
            $this->merge([
                'contact_phone' => preg_replace('/[^\+0-9]/', '', $this->contact_phone)
            ]);
        }
    }
}
