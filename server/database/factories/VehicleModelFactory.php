<?php

namespace Database\Factories;

use App\Models\VehicleMake;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VehicleModel>
 */
class VehicleModelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $carModels = ['Corolla', 'Civic', 'City', 'Camry', 'Accord', 'Prius', 'Vitz', 'Cultus', 'Alto', 'Swift', 'Mehran', 'Bolan'];
        $bikeModels = ['CD 70', 'CD 125', 'YBR 125', 'CG 125', 'Pridor', 'Deluxe', 'Super Power', 'Road Prince', 'Unique'];
        $truckModels = ['NPR', 'ELF', 'Canter', 'Ranger', 'Hilux', 'Shehzore', 'Mazda T3500', 'Suzuki Pickup'];

        $makes = VehicleMake::with('category')->get();
        $make = $makes->random();

        $models = match($make->category->slug) {
            'cars' => $carModels,
            'bikes' => $bikeModels,
            'trucks' => $truckModels,
            default => $carModels,
        };

        $name = $this->faker->randomElement($models);

        return [
            'make_id' => $make->id,
            'name' => $name,
            'slug' => Str::slug($name),
            'year_start' => $this->faker->numberBetween(1990, 2020),
            'year_end' => $this->faker->optional(0.3)->numberBetween(2021, 2024),
            'is_active' => true,
        ];
    }
}
