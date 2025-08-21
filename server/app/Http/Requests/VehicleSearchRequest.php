<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VehicleSearchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public endpoint, no authorization needed
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Search and basic filters
            'query' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:cars,bikes,trucks',
            'category_id' => 'nullable|exists:vehicle_categories,id',
            'make_id' => 'nullable|exists:vehicle_makes,id',
            'model_id' => 'nullable|exists:vehicle_models,id',

            // Price filters
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0|gte:min_price',
            'is_negotiable' => 'nullable|boolean',

            // Vehicle specifications
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'min_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'max_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1) . '|gte:min_year',
            'color' => 'nullable|string|max:50',
            'condition' => 'nullable|string|in:new,used,certified_pre_owned',
            'transmission' => 'nullable|string|in:manual,automatic,cvt,semi_automatic',
            'fuel_type' => 'nullable|string|in:petrol,diesel,hybrid,electric,cng,lpg',
            'engine_capacity' => 'nullable|string|max:20',
            'min_mileage' => 'nullable|numeric|min:0',
            'max_mileage' => 'nullable|numeric|min:0|gte:min_mileage',

            // Location filters
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',

            // Status and features
            'status' => 'nullable|string|in:active,draft,sold,expired',
            'is_featured' => 'nullable|boolean',
            'is_premium' => 'nullable|boolean',
            'has_images' => 'nullable|boolean',

            // Date filters
            'created_after' => 'nullable|date',
            'created_before' => 'nullable|date|after_or_equal:created_after',
            'updated_after' => 'nullable|date',
            'updated_before' => 'nullable|date|after_or_equal:updated_after',

            // Pagination and sorting
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:price,year,created_at,updated_at,views_count,favorites_count,mileage,title',
            'sort_order' => 'nullable|string|in:asc,desc',

            // Advanced filters
            'user_id' => 'nullable|exists:users,id',
            'exclude_user_id' => 'nullable|exists:users,id',
            'min_views' => 'nullable|integer|min:0',
            'max_views' => 'nullable|integer|min:0|gte:min_views',
            'min_favorites' => 'nullable|integer|min:0',
            'max_favorites' => 'nullable|integer|min:0|gte:min_favorites',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'type.in' => 'Vehicle type must be one of: cars, bikes, trucks',
            'condition.in' => 'Condition must be one of: new, used, certified_pre_owned',
            'transmission.in' => 'Transmission must be one of: manual, automatic, cvt, semi_automatic',
            'fuel_type.in' => 'Fuel type must be one of: petrol, diesel, hybrid, electric, cng, lpg',
            'status.in' => 'Status must be one of: active, draft, sold, expired',
            'sort_by.in' => 'Sort by must be one of: price, year, created_at, updated_at, views_count, favorites_count, mileage, title',
            'sort_order.in' => 'Sort order must be either: asc, desc',
            'max_price.gte' => 'Maximum price must be greater than or equal to minimum price',
            'max_year.gte' => 'Maximum year must be greater than or equal to minimum year',
            'max_mileage.gte' => 'Maximum mileage must be greater than or equal to minimum mileage',
            'max_views.gte' => 'Maximum views must be greater than or equal to minimum views',
            'max_favorites.gte' => 'Maximum favorites must be greater than or equal to minimum favorites',
            'created_before.after_or_equal' => 'Created before date must be after or equal to created after date',
            'updated_before.after_or_equal' => 'Updated before date must be after or equal to updated after date',
            'per_page.max' => 'Per page cannot exceed 100 items',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'min_price' => 'minimum price',
            'max_price' => 'maximum price',
            'min_year' => 'minimum year',
            'max_year' => 'maximum year',
            'min_mileage' => 'minimum mileage',
            'max_mileage' => 'maximum mileage',
            'min_views' => 'minimum views',
            'max_views' => 'maximum views',
            'min_favorites' => 'minimum favorites',
            'max_favorites' => 'maximum favorites',
            'created_after' => 'created after date',
            'created_before' => 'created before date',
            'updated_after' => 'updated after date',
            'updated_before' => 'updated before date',
            'per_page' => 'items per page',
            'sort_by' => 'sort field',
            'sort_order' => 'sort order',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Custom validation logic can be added here

            // Ensure min/max price logic
            if ($this->filled(['min_price', 'max_price'])) {
                if ($this->min_price > $this->max_price) {
                    $validator->errors()->add('max_price', 'Maximum price must be greater than minimum price.');
                }
            }

            // Ensure min/max year logic
            if ($this->filled(['min_year', 'max_year'])) {
                if ($this->min_year > $this->max_year) {
                    $validator->errors()->add('max_year', 'Maximum year must be greater than minimum year.');
                }
            }

            // Ensure min/max mileage logic
            if ($this->filled(['min_mileage', 'max_mileage'])) {
                if ($this->min_mileage > $this->max_mileage) {
                    $validator->errors()->add('max_mileage', 'Maximum mileage must be greater than minimum mileage.');
                }
            }
        });
    }
}
