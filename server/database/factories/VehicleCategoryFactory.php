<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VehicleCategory>
 */
class VehicleCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            ['name' => 'Cars', 'slug' => 'cars', 'description' => 'All types of cars including sedans, hatchbacks, SUVs, and more', 'icon' => 'car'],
            ['name' => 'Bikes', 'slug' => 'bikes', 'description' => 'Motorcycles, scooters, and other two-wheelers', 'icon' => 'bike'],
            ['name' => 'Trucks', 'slug' => 'trucks', 'description' => 'Commercial vehicles, trucks, and heavy machinery', 'icon' => 'truck'],
        ];

        $category = $this->faker->randomElement($categories);

        return [
            'name' => $category['name'],
            'slug' => $category['slug'],
            'description' => $category['description'],
            'icon' => $category['icon'],
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(1, 10),
        ];
    }
}
