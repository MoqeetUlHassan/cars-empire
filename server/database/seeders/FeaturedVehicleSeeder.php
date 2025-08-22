<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Models\User;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FeaturedVehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user or create one
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'Demo User',
                'email' => 'demo@example.com',
                'email_verified_at' => now(),
                'password' => bcrypt('password'),
            ]);
        }

        // Get categories
        $carCategory = VehicleCategory::where('slug', 'cars')->first();
        $bikeCategory = VehicleCategory::where('slug', 'bikes')->first();

        // Get existing makes and models
        $toyotaMake = VehicleMake::where('slug', 'toyota')->first();
        if (!$toyotaMake) {
            $toyotaMake = VehicleMake::create([
                'category_id' => $carCategory->id,
                'name' => 'Toyota',
                'slug' => 'toyota',
                'is_active' => true,
                'sort_order' => 1,
            ]);
        }

        $corollaModel = VehicleModel::where('slug', 'corolla')->first();
        if (!$corollaModel) {
            $corollaModel = VehicleModel::create([
                'make_id' => $toyotaMake->id,
                'name' => 'Corolla',
                'slug' => 'corolla',
                'is_active' => true,
            ]);
        }

        $hondaMake = VehicleMake::where('slug', 'honda-bikes')->first();
        if (!$hondaMake) {
            $hondaMake = VehicleMake::create([
                'category_id' => $bikeCategory->id,
                'name' => 'Honda',
                'slug' => 'honda-bikes',
                'is_active' => true,
                'sort_order' => 1,
            ]);
        }

        $cd70Model = VehicleModel::where('slug', 'cd-70')->first();
        if (!$cd70Model) {
            $cd70Model = VehicleModel::create([
                'make_id' => $hondaMake->id,
                'name' => 'CD 70',
                'slug' => 'cd-70',
                'is_active' => true,
            ]);
        }

        // Create featured vehicles
        $featuredVehicles = [
            [
                'user_id' => $user->id,
                'category_id' => $carCategory->id,
                'make_id' => $toyotaMake->id,
                'model_id' => $corollaModel->id,
                'title' => '2022 Toyota Corolla GLi Manual - Excellent Condition',
                'slug' => Str::slug('2022 Toyota Corolla GLi Manual - Excellent Condition'),
                'description' => 'Beautiful 2022 Toyota Corolla in excellent condition. Single owner, all maintenance records available. Perfect for family use.',
                'price' => 4500000,
                'is_negotiable' => true,
                'year' => 2022,
                'color' => 'Pearl White',
                'condition' => 'used',
                'transmission' => 'manual',
                'fuel_type' => 'petrol',
                'engine_capacity' => '1300cc',
                'mileage' => 15000,
                'city' => 'Lahore',
                'state' => 'Punjab',
                'contact_name' => 'Ahmed Ali',
                'contact_phone' => '+92 300 1234567',
                'contact_email' => 'ahmed@example.com',
                'show_phone' => true,
                'show_email' => false,
                'status' => 'active',
                'is_featured' => true,
                'views_count' => 245,
                'favorites_count' => 18,
            ],
            [
                'user_id' => $user->id,
                'category_id' => $bikeCategory->id,
                'make_id' => $hondaMake->id,
                'model_id' => $cd70Model->id,
                'title' => '2023 Honda CD 70 - Brand New Condition',
                'slug' => Str::slug('2023 Honda CD 70 - Brand New Condition'),
                'description' => 'Almost new Honda CD 70 with very low mileage. Perfect for daily commute and fuel efficient.',
                'price' => 120000,
                'is_negotiable' => false,
                'year' => 2023,
                'color' => 'Red',
                'condition' => 'used',
                'transmission' => 'manual',
                'fuel_type' => 'petrol',
                'engine_capacity' => '70cc',
                'mileage' => 2500,
                'city' => 'Karachi',
                'state' => 'Sindh',
                'contact_name' => 'Muhammad Hassan',
                'contact_phone' => '+92 321 9876543',
                'contact_email' => 'hassan@example.com',
                'show_phone' => true,
                'show_email' => true,
                'status' => 'active',
                'is_featured' => true,
                'views_count' => 156,
                'favorites_count' => 12,
            ],
            [
                'user_id' => $user->id,
                'category_id' => $carCategory->id,
                'make_id' => $toyotaMake->id,
                'model_id' => $corollaModel->id,
                'title' => '2021 Toyota Corolla Altis Grande - Top of the Line',
                'slug' => Str::slug('2021 Toyota Corolla Altis Grande - Top of the Line'),
                'description' => 'Premium Toyota Corolla with all features. Leather seats, sunroof, navigation system, and much more.',
                'price' => 5200000,
                'is_negotiable' => true,
                'year' => 2021,
                'color' => 'Black',
                'condition' => 'used',
                'transmission' => 'automatic',
                'fuel_type' => 'petrol',
                'engine_capacity' => '1800cc',
                'mileage' => 25000,
                'city' => 'Islamabad',
                'state' => 'ICT',
                'contact_name' => 'Sarah Khan',
                'contact_phone' => '+92 333 5555555',
                'contact_email' => 'sarah@example.com',
                'show_phone' => true,
                'show_email' => false,
                'status' => 'active',
                'is_featured' => true,
                'views_count' => 389,
                'favorites_count' => 31,
            ],
        ];

        foreach ($featuredVehicles as $vehicleData) {
            Vehicle::updateOrCreate(
                ['slug' => $vehicleData['slug']],
                $vehicleData
            );
        }

        $this->command->info('Featured vehicles seeded successfully!');
    }
}
