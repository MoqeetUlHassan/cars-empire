<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'phone' => '+92300123456',
            'city' => 'Lahore',
            'state' => 'Punjab',
        ]);

        // Create additional users
        User::factory(10)->create();

        // Create vehicle categories (Cars, Bikes, Trucks)
        $categories = [
            ['name' => 'Cars', 'slug' => 'cars', 'description' => 'All types of cars including sedans, hatchbacks, SUVs, and more', 'icon' => 'car'],
            ['name' => 'Bikes', 'slug' => 'bikes', 'description' => 'Motorcycles, scooters, and other two-wheelers', 'icon' => 'bike'],
            ['name' => 'Trucks', 'slug' => 'trucks', 'description' => 'Commercial vehicles, trucks, and heavy machinery', 'icon' => 'truck'],
        ];

        foreach ($categories as $categoryData) {
            VehicleCategory::firstOrCreate(
                ['slug' => $categoryData['slug']],
                array_merge($categoryData, ['is_active' => true, 'sort_order' => 1])
            );
        }

        // Create vehicle makes for each category
        $carCategory = VehicleCategory::where('slug', 'cars')->first();
        $bikeCategory = VehicleCategory::where('slug', 'bikes')->first();
        $truckCategory = VehicleCategory::where('slug', 'trucks')->first();

        // Car makes
        $carMakes = ['Toyota', 'Honda', 'Suzuki', 'Nissan', 'Hyundai'];
        foreach ($carMakes as $makeName) {
            $make = VehicleMake::firstOrCreate([
                'category_id' => $carCategory->id,
                'name' => $makeName,
                'slug' => Str::slug($makeName),
                'country' => 'Japan',
                'is_active' => true,
            ]);

            // Create models for each make
            $models = match($makeName) {
                'Toyota' => ['Corolla', 'Camry', 'Prius', 'Vitz'],
                'Honda' => ['Civic', 'City', 'Accord', 'BR-V'],
                'Suzuki' => ['Swift', 'Cultus', 'Alto', 'Mehran'],
                'Nissan' => ['Sunny', 'Note', 'Juke', 'X-Trail'],
                'Hyundai' => ['Elantra', 'Tucson', 'Sonata', 'i10'],
                default => ['Model 1', 'Model 2'],
            };

            foreach ($models as $modelName) {
                VehicleModel::firstOrCreate([
                    'make_id' => $make->id,
                    'name' => $modelName,
                    'slug' => Str::slug($modelName),
                    'is_active' => true,
                ]);
            }
        }

        // Bike makes
        $bikeMakes = ['Honda', 'Yamaha', 'Suzuki'];
        foreach ($bikeMakes as $makeName) {
            $make = VehicleMake::firstOrCreate([
                'category_id' => $bikeCategory->id,
                'name' => $makeName,
                'slug' => Str::slug($makeName . '-bike'),
                'country' => 'Japan',
                'is_active' => true,
            ]);

            $models = match($makeName) {
                'Honda' => ['CD 70', 'CD 125', 'CG 125', 'Pridor'],
                'Yamaha' => ['YBR 125', 'YB 125Z', 'YBR 250'],
                'Suzuki' => ['GS 150', 'GD 110S', 'Hayabusa'],
                default => ['Model 1', 'Model 2'],
            };

            foreach ($models as $modelName) {
                VehicleModel::firstOrCreate([
                    'make_id' => $make->id,
                    'name' => $modelName,
                    'slug' => Str::slug($modelName),
                    'is_active' => true,
                ]);
            }
        }

        // Truck makes
        $truckMakes = ['Isuzu', 'Hino', 'Mitsubishi'];
        foreach ($truckMakes as $makeName) {
            $make = VehicleMake::firstOrCreate([
                'category_id' => $truckCategory->id,
                'name' => $makeName,
                'slug' => Str::slug($makeName . '-truck'),
                'country' => 'Japan',
                'is_active' => true,
            ]);

            $models = match($makeName) {
                'Isuzu' => ['NPR', 'ELF', 'Forward'],
                'Hino' => ['300 Series', '500 Series', '700 Series'],
                'Mitsubishi' => ['Canter', 'Fuso', 'Fighter'],
                default => ['Model 1', 'Model 2'],
            };

            foreach ($models as $modelName) {
                VehicleModel::firstOrCreate([
                    'make_id' => $make->id,
                    'name' => $modelName,
                    'slug' => Str::slug($modelName),
                    'is_active' => true,
                ]);
            }
        }

        // Create 50 sample vehicles
        Vehicle::factory(50)->create();

        $this->command->info('Database seeded successfully!');
        $this->command->info('Created:');
        $this->command->info('- ' . User::count() . ' users');
        $this->command->info('- ' . VehicleCategory::count() . ' categories');
        $this->command->info('- ' . VehicleMake::count() . ' makes');
        $this->command->info('- ' . VehicleModel::count() . ' models');
        $this->command->info('- ' . Vehicle::count() . ' vehicles');
    }
}
