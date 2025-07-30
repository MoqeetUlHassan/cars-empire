<?php

namespace Database\Factories;

use App\Models\VehicleCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VehicleMake>
 */
class VehicleMakeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $carMakes = ['Toyota', 'Honda', 'Suzuki', 'Nissan', 'Hyundai', 'KIA', 'BMW', 'Mercedes', 'Audi', 'Ford'];
        $bikeMakes = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Harley Davidson', 'Ducati', 'KTM', 'Bajaj'];
        $truckMakes = ['Isuzu', 'Hino', 'Mitsubishi', 'Ford', 'Volvo', 'Scania', 'MAN', 'DAF'];

        $categories = VehicleCategory::all();
        $category = $categories->random();

        $makes = match($category->slug) {
            'cars' => $carMakes,
            'bikes' => $bikeMakes,
            'trucks' => $truckMakes,
            default => $carMakes,
        };

        $name = $this->faker->randomElement($makes);

        return [
            'category_id' => $category->id,
            'name' => $name,
            'slug' => Str::slug($name),
            'logo' => null,
            'country' => $this->faker->randomElement(['Japan', 'Germany', 'USA', 'South Korea', 'Italy']),
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(1, 100),
        ];
    }
}
