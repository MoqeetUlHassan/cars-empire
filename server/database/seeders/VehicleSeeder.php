<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test user first
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'phone' => '+92300123456',
                'city' => 'Lahore',
                'state' => 'Punjab',
            ]
        );

        // Get categories
        $carCategory = VehicleCategory::where('slug', 'cars')->first();
        $bikeCategory = VehicleCategory::where('slug', 'bikes')->first();
        $truckCategory = VehicleCategory::where('slug', 'trucks')->first();

        // Create makes and models
        $this->createMakesAndModels($carCategory, $bikeCategory, $truckCategory);

        // Create sample vehicles
        $this->createSampleVehicles($user, $carCategory, $bikeCategory, $truckCategory);
    }

    private function createMakesAndModels($carCategory, $bikeCategory, $truckCategory)
    {
        // Car makes and models
        if ($carCategory) {
            $toyota = VehicleMake::firstOrCreate([
                'category_id' => $carCategory->id,
                'name' => 'Toyota',
                'slug' => 'toyota',
                'country' => 'Japan',
            ]);

            VehicleModel::firstOrCreate([
                'make_id' => $toyota->id,
                'name' => 'Corolla',
                'slug' => 'corolla',
            ]);

            VehicleModel::firstOrCreate([
                'make_id' => $toyota->id,
                'name' => 'Camry',
                'slug' => 'camry',
            ]);

            $honda = VehicleMake::firstOrCreate([
                'category_id' => $carCategory->id,
                'name' => 'Honda',
                'slug' => 'honda',
                'country' => 'Japan',
            ]);

            VehicleModel::firstOrCreate([
                'make_id' => $honda->id,
                'name' => 'Civic',
                'slug' => 'civic',
            ]);

            VehicleModel::firstOrCreate([
                'make_id' => $honda->id,
                'name' => 'City',
                'slug' => 'city',
            ]);
        }

        // Bike makes and models
        if ($bikeCategory) {
            $yamaha = VehicleMake::firstOrCreate([
                'category_id' => $bikeCategory->id,
                'name' => 'Yamaha',
                'slug' => 'yamaha',
                'country' => 'Japan',
            ]);

            VehicleModel::firstOrCreate([
                'make_id' => $yamaha->id,
                'name' => 'YBR 125',
                'slug' => 'ybr-125',
            ]);

            $honda_bike = VehicleMake::firstOrCreate([
                'category_id' => $bikeCategory->id,
                'name' => 'Honda',
                'slug' => 'honda-bike',
                'country' => 'Japan',
            ]);

            VehicleModel::firstOrCreate([
                'make_id' => $honda_bike->id,
                'name' => 'CD 70',
                'slug' => 'cd-70',
            ]);
        }
    }

    private function createSampleVehicles($user, $carCategory, $bikeCategory, $truckCategory)
    {
        $vehicles = [
            [
                'category_id' => $carCategory?->id,
                'make_id' => VehicleMake::where('name', 'Toyota')->first()?->id,
                'model_id' => VehicleModel::where('name', 'Corolla')->first()?->id,
                'title' => '2020 Toyota Corolla GLi Manual',
                'description' => 'Excellent condition Toyota Corolla with low mileage. Single owner, all documents clear.',
                'price' => 3200000,
                'year' => 2020,
                'color' => 'White',
                'mileage' => 45000,
                'condition' => 'used',
                'transmission' => 'manual',
                'fuel_type' => 'petrol',
                'engine_capacity' => '1300cc',
                'city' => 'Lahore',
                'state' => 'Punjab',
                'status' => 'active',
            ],
            [
                'category_id' => $carCategory?->id,
                'make_id' => VehicleMake::where('name', 'Honda')->first()?->id,
                'model_id' => VehicleModel::where('name', 'Civic')->first()?->id,
                'title' => '2019 Honda Civic Turbo RS',
                'description' => 'Top of the line Honda Civic with turbo engine. Fully loaded with all features.',
                'price' => 4500000,
                'year' => 2019,
                'color' => 'Black',
                'mileage' => 35000,
                'condition' => 'used',
                'transmission' => 'automatic',
                'fuel_type' => 'petrol',
                'engine_capacity' => '1500cc',
                'city' => 'Karachi',
                'state' => 'Sindh',
                'status' => 'active',
            ],
            [
                'category_id' => $bikeCategory?->id,
                'make_id' => VehicleMake::where('name', 'Yamaha')->first()?->id,
                'model_id' => VehicleModel::where('name', 'YBR 125')->first()?->id,
                'title' => '2021 Yamaha YBR 125 - Like New',
                'description' => 'Almost new Yamaha YBR 125 with very low mileage. Perfect for daily commute.',
                'price' => 185000,
                'year' => 2021,
                'color' => 'Red',
                'mileage' => 8000,
                'condition' => 'used',
                'transmission' => 'manual',
                'fuel_type' => 'petrol',
                'engine_capacity' => '125cc',
                'city' => 'Islamabad',
                'state' => 'ICT',
                'status' => 'active',
            ],
        ];

        foreach ($vehicles as $vehicleData) {
            if ($vehicleData['category_id'] && $vehicleData['make_id'] && $vehicleData['model_id']) {
                $vehicleData['user_id'] = $user->id;
                $vehicleData['slug'] = Str::slug($vehicleData['title']);
                Vehicle::create($vehicleData);
            }
        }
    }
}
