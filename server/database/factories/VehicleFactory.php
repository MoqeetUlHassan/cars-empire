<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VehicleCategory;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vehicle>
 */
class VehicleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = VehicleCategory::all();
        if ($categories->isEmpty()) {
            throw new \Exception('No vehicle categories found. Please seed categories first.');
        }
        $category = $categories->random();

        $makes = VehicleMake::where('category_id', $category->id)->get();
        if ($makes->isEmpty()) {
            throw new \Exception('No vehicle makes found for category: ' . $category->name);
        }
        $make = $makes->random();

        $models = VehicleModel::where('make_id', $make->id)->get();
        if ($models->isEmpty()) {
            throw new \Exception('No vehicle models found for make: ' . $make->name);
        }
        $model = $models->random();

        $year = $this->faker->numberBetween(2010, 2024);
        $title = $year . ' ' . $make->name . ' ' . $model->name;

        $cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];
        $colors = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Gray', 'Brown', 'Green'];

        // Price ranges based on category
        $priceRange = match($category->slug) {
            'cars' => [500000, 8000000],
            'bikes' => [50000, 500000],
            'trucks' => [1000000, 15000000],
            default => [100000, 1000000],
        };

        // Engine capacity based on category
        $engineCapacities = match($category->slug) {
            'cars' => ['800cc', '1000cc', '1300cc', '1500cc', '1600cc', '1800cc', '2000cc', '2400cc'],
            'bikes' => ['70cc', '100cc', '125cc', '150cc', '200cc', '250cc', '400cc', '600cc'],
            'trucks' => ['2000cc', '2500cc', '3000cc', '3500cc', '4000cc', '5000cc'],
            default => ['1000cc', '1300cc', '1500cc'],
        };

        return [
            'user_id' => User::factory(),
            'category_id' => $category->id,
            'make_id' => $make->id,
            'model_id' => $model->id,
            'title' => $title,
            'slug' => Str::slug($title) . '-' . $this->faker->randomNumber(4),
            'description' => $this->faker->paragraphs(3, true),
            'price' => $this->faker->numberBetween($priceRange[0], $priceRange[1]),
            'is_negotiable' => $this->faker->boolean(80),
            'year' => $year,
            'color' => $this->faker->randomElement($colors),
            'mileage' => $this->faker->numberBetween(5000, 200000),
            'condition' => $this->faker->randomElement(['new', 'used', 'certified_pre_owned']),
            'transmission' => $this->faker->randomElement(['manual', 'automatic', 'cvt']),
            'fuel_type' => $this->faker->randomElement(['petrol', 'diesel', 'hybrid', 'electric']),
            'engine_capacity' => $this->faker->randomElement($engineCapacities),
            'engine_power' => $this->faker->numberBetween(60, 400),
            'city' => $this->faker->randomElement($cities),
            'state' => $this->faker->randomElement(['Punjab', 'Sindh', 'KPK', 'Balochistan', 'ICT']),
            'address' => $this->faker->address,
            'status' => $this->faker->randomElement(['active', 'active', 'active', 'draft']), // 75% active
            'is_featured' => $this->faker->boolean(20),
            'is_premium' => $this->faker->boolean(15),
            'views_count' => $this->faker->numberBetween(0, 1000),
            'favorites_count' => $this->faker->numberBetween(0, 50),
            'contact_name' => $this->faker->name,
            'contact_phone' => $this->faker->phoneNumber,
            'contact_email' => $this->faker->email,
            'show_phone' => $this->faker->boolean(90),
            'show_email' => $this->faker->boolean(70),
            'features' => json_encode($this->faker->randomElements([
                'Air Conditioning', 'Power Steering', 'Power Windows', 'Central Locking',
                'Alloy Wheels', 'Fog Lights', 'CD Player', 'Cassette Player', 'DVD Player'
            ], $this->faker->numberBetween(2, 6))),
            'safety_features' => json_encode($this->faker->randomElements([
                'ABS', 'Airbags', 'Immobilizer', 'Child Lock', 'Seat Belts'
            ], $this->faker->numberBetween(1, 4))),
        ];
    }
}
