<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class StoreVehicleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check(); // User must be authenticated
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Basic vehicle information
            'title' => 'required|string|max:255|min:10',
            'description' => 'required|string|min:50|max:5000',
            'category_id' => 'required|exists:vehicle_categories,id',
            'make_id' => 'required|exists:vehicle_makes,id',
            'model_id' => 'required|exists:vehicle_models,id',

            // Price and negotiation
            'price' => 'required|numeric|min:1|max:999999999',
            'is_negotiable' => 'nullable|boolean',

            // Vehicle specifications
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'color' => 'required|string|max:50',
            'condition' => 'required|string|in:new,used,certified_pre_owned',
            'transmission' => 'required|string|in:manual,automatic,cvt,semi_automatic',
            'fuel_type' => 'required|string|in:petrol,diesel,hybrid,electric,cng,lpg',
            'engine_capacity' => 'required|string|max:20',
            'engine_power' => 'nullable|numeric|min:1|max:2000',
            'mileage' => 'required|numeric|min:0|max:9999999',

            // Location
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',

            // Contact information
            'contact_name' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:20|regex:/^[\+]?[0-9\-\(\)\s]+$/',
            'contact_email' => 'required|email|max:255',
            'show_phone' => 'nullable|boolean',
            'show_email' => 'nullable|boolean',

            // Features (arrays)
            'features' => 'nullable|array',
            'features.*' => 'string|max:100',
            'safety_features' => 'nullable|array',
            'safety_features.*' => 'string|max:100',
            'exterior_features' => 'nullable|array',
            'exterior_features.*' => 'string|max:100',
            'interior_features' => 'nullable|array',
            'interior_features.*' => 'string|max:100',

            // Images (max 10 images, 10MB each)
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max per image

            // Video clip (max 100MB, 10 seconds duration)
            'video' => 'sometimes|file|mimes:mp4,mov,avi,wmv,flv,webm|max:102400', // 100MB max

            // Social media links
            'social_media_links' => 'sometimes|array',
            'social_media_links.facebook' => 'nullable|url|max:255',
            'social_media_links.instagram' => 'nullable|url|max:255',
            'social_media_links.twitter' => 'nullable|url|max:255',
            'social_media_links.youtube' => 'nullable|url|max:255',
            'social_media_links.tiktok' => 'nullable|url|max:255',
            'social_media_links.whatsapp' => 'nullable|string|max:20', // Phone number for WhatsApp

            // Listing options
            'is_featured' => 'nullable|boolean',
            'is_premium' => 'nullable|boolean',
            'expires_at' => 'nullable|date|after:today',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Vehicle title is required',
            'title.min' => 'Title must be at least 10 characters long',
            'description.required' => 'Vehicle description is required',
            'description.min' => 'Description must be at least 50 characters long',
            'description.max' => 'Description cannot exceed 5000 characters',
            'category_id.required' => 'Please select a vehicle category',
            'category_id.exists' => 'Selected category is invalid',
            'make_id.required' => 'Please select a vehicle make',
            'make_id.exists' => 'Selected make is invalid',
            'model_id.required' => 'Please select a vehicle model',
            'model_id.exists' => 'Selected model is invalid',
            'price.required' => 'Price is required',
            'price.min' => 'Price must be at least 1',
            'price.max' => 'Price cannot exceed 999,999,999',
            'year.required' => 'Manufacturing year is required',
            'year.min' => 'Year cannot be before 1900',
            'year.max' => 'Year cannot be in the future',
            'color.required' => 'Vehicle color is required',
            'condition.required' => 'Vehicle condition is required',
            'condition.in' => 'Condition must be new, used, or certified pre-owned',
            'transmission.required' => 'Transmission type is required',
            'transmission.in' => 'Invalid transmission type',
            'fuel_type.required' => 'Fuel type is required',
            'fuel_type.in' => 'Invalid fuel type',
            'engine_capacity.required' => 'Engine capacity is required',
            'mileage.required' => 'Mileage is required',
            'city.required' => 'City is required',
            'state.required' => 'State/Province is required',
            'contact_name.required' => 'Contact name is required',
            'contact_phone.required' => 'Contact phone is required',
            'contact_phone.regex' => 'Please provide a valid phone number',
            'contact_email.required' => 'Contact email is required',
            'contact_email.email' => 'Please provide a valid email address',
            'images.max' => 'You can upload maximum 10 images',
            'images.*.image' => 'All files must be images',
            'images.*.mimes' => 'Images must be jpeg, png, jpg, or gif format',
            'images.*.max' => 'Each image must be less than 10MB',
            'video.file' => 'Video must be a valid file',
            'video.mimes' => 'Video must be mp4, mov, avi, wmv, flv, or webm format',
            'video.max' => 'Video file must be less than 100MB',
            'social_media_links.facebook.url' => 'Facebook link must be a valid URL',
            'social_media_links.instagram.url' => 'Instagram link must be a valid URL',
            'social_media_links.twitter.url' => 'Twitter link must be a valid URL',
            'social_media_links.youtube.url' => 'YouTube link must be a valid URL',
            'social_media_links.tiktok.url' => 'TikTok link must be a valid URL',
            'social_media_links.whatsapp.string' => 'WhatsApp number must be a valid phone number',
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
        // Generate slug from title
        if ($this->has('title')) {
            $this->merge([
                'slug' => Str::slug($this->title) . '-' . time()
            ]);
        }

        // Set user_id to current authenticated user
        $this->merge([
            'user_id' => Auth::id()
        ]);

        // Convert boolean fields
        $this->merge([
            'is_negotiable' => $this->boolean('is_negotiable', true),
            'show_phone' => $this->boolean('show_phone', true),
            'show_email' => $this->boolean('show_email', false),
            'is_featured' => $this->boolean('is_featured', false),
            'is_premium' => $this->boolean('is_premium', false),
        ]);

        // Set default status
        $this->merge([
            'status' => 'active'
        ]);

        // Clean phone number
        if ($this->has('contact_phone')) {
            $this->merge([
                'contact_phone' => preg_replace('/[^\+0-9]/', '', $this->contact_phone)
            ]);
        }
    }
}
