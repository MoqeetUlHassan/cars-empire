<?php

namespace Database\Seeders;

use App\Models\VehicleCategory;
use Illuminate\Database\Seeder;

class VehicleCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Cars',
                'slug' => 'cars',
                'description' => 'All types of cars including sedans, hatchbacks, SUVs, and more',
                'icon' => 'car',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Bikes',
                'slug' => 'bikes',
                'description' => 'Motorcycles, scooters, and other two-wheelers',
                'icon' => 'bike',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Trucks',
                'slug' => 'trucks',
                'description' => 'Commercial vehicles, trucks, and heavy machinery',
                'icon' => 'truck',
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($categories as $category) {
            VehicleCategory::create($category);
        }
    }
}
