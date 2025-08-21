<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public login endpoint
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::exists('users', 'email'),
            ],
            'password' => 'required|string|min:1',
            'remember_me' => 'nullable|boolean',
            'device_name' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required',
            'email.email' => 'Please provide a valid email address',
            'email.exists' => 'No account found with this email address',
            'password.required' => 'Password is required',
            'password.min' => 'Password is required',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'email' => 'email address',
            'password' => 'password',
            'remember_me' => 'remember me',
            'device_name' => 'device name',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Normalize email to lowercase
        if ($this->has('email')) {
            $this->merge([
                'email' => strtolower(trim($this->email))
            ]);
        }

        // Set default device name if not provided
        if (!$this->has('device_name') || empty($this->device_name)) {
            $this->merge([
                'device_name' => $this->header('User-Agent', 'Unknown Device')
            ]);
        }

        // Ensure remember_me is boolean
        if ($this->has('remember_me')) {
            $this->merge([
                'remember_me' => $this->boolean('remember_me')
            ]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Additional custom validation can be added here
            // For example, rate limiting checks, account status checks, etc.
        });
    }
}
