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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained('vehicle_categories');
            $table->foreignId('make_id')->constrained('vehicle_makes');
            $table->foreignId('model_id')->constrained('vehicle_models');

            // Basic Information
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 12, 2);
            $table->boolean('is_negotiable')->default(true);
            $table->integer('year');
            $table->string('color')->nullable();
            $table->integer('mileage')->nullable(); // in kilometers

            // Vehicle Specifications
            $table->enum('condition', ['new', 'used', 'certified_pre_owned'])->default('used');
            $table->enum('transmission', ['manual', 'automatic', 'cvt', 'semi_automatic'])->nullable();
            $table->enum('fuel_type', ['petrol', 'diesel', 'hybrid', 'electric', 'cng', 'lpg'])->nullable();
            $table->string('engine_capacity')->nullable(); // e.g., "1300cc"
            $table->integer('engine_power')->nullable(); // in HP

            // Location
            $table->string('city');
            $table->string('state')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Listing Details
            $table->enum('status', ['draft', 'active', 'sold', 'expired', 'suspended'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_premium')->default(false);
            $table->timestamp('featured_until')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('views_count')->default(0);
            $table->integer('favorites_count')->default(0);

            // Contact Information
            $table->string('contact_name')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->boolean('show_phone')->default(true);
            $table->boolean('show_email')->default(true);

            // Additional Features (JSON)
            $table->json('features')->nullable(); // Air conditioning, Power steering, etc.
            $table->json('safety_features')->nullable(); // ABS, Airbags, etc.
            $table->json('exterior_features')->nullable(); // Alloy wheels, Sunroof, etc.
            $table->json('interior_features')->nullable(); // Leather seats, Navigation, etc.

            $table->timestamps();

            // Indexes
            $table->index(['status', 'is_featured']);
            $table->index(['category_id', 'make_id', 'model_id']);
            $table->index(['city', 'state']);
            $table->index(['price', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
