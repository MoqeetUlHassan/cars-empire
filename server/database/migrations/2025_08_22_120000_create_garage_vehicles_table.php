<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('garage_vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained('vehicle_categories');
            $table->foreignId('make_id')->constrained('vehicle_makes');
            $table->foreignId('model_id')->constrained('vehicle_models');
            
            // Basic Information
            $table->string('name'); // User's custom name for the vehicle
            $table->string('license_plate')->nullable();
            $table->integer('year');
            $table->string('color');
            $table->string('vin')->nullable(); // Vehicle Identification Number
            $table->decimal('purchase_price', 12, 2)->nullable();
            $table->date('purchase_date')->nullable();
            $table->integer('current_mileage')->default(0);
            
            // Vehicle Specifications
            $table->enum('condition', ['excellent', 'good', 'fair', 'poor'])->default('good');
            $table->enum('transmission', ['manual', 'automatic', 'cvt', 'semi_automatic']);
            $table->enum('fuel_type', ['petrol', 'diesel', 'hybrid', 'electric', 'cng', 'lpg']);
            $table->string('engine_capacity')->nullable();
            $table->integer('engine_power')->nullable();
            
            // Insurance & Registration
            $table->string('insurance_company')->nullable();
            $table->string('insurance_policy_number')->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->date('registration_expiry')->nullable();
            
            // Status
            $table->enum('status', ['owned', 'for_sale', 'sold'])->default('owned');
            $table->foreignId('listing_id')->nullable()->constrained('vehicles')->onDelete('set null');
            
            // Additional Information
            $table->text('notes')->nullable();
            $table->json('features')->nullable();
            $table->json('images')->nullable(); // Store image paths
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['license_plate']);
            $table->unique(['user_id', 'license_plate']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('garage_vehicles');
    }
};
