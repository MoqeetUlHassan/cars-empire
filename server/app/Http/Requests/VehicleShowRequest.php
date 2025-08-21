<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VehicleShowRequest extends FormRequest
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
            // Route parameter validation is handled by route model binding
            // Additional query parameters for vehicle show
            'include_related' => 'nullable|boolean',
            'include_images' => 'nullable|boolean',
            'include_user' => 'nullable|boolean',
            'track_view' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'include_related.boolean' => 'Include related must be true or false',
            'include_images.boolean' => 'Include images must be true or false',
            'include_user.boolean' => 'Include user must be true or false',
            'track_view.boolean' => 'Track view must be true or false',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'include_related' => 'include related vehicles',
            'include_images' => 'include images',
            'include_user' => 'include user information',
            'track_view' => 'track view count',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Set default values for optional parameters
        $this->merge([
            'include_related' => $this->boolean('include_related', false),
            'include_images' => $this->boolean('include_images', true),
            'include_user' => $this->boolean('include_user', true),
            'track_view' => $this->boolean('track_view', true),
        ]);
    }
}
