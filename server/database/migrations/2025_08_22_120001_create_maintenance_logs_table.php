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
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('garage_vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Maintenance Information
            $table->string('title'); // e.g., "Oil Change", "Brake Replacement"
            $table->text('description')->nullable();
            $table->date('service_date');
            $table->integer('mileage_at_service');
            
            // Service Provider
            $table->string('service_provider')->nullable(); // Workshop/garage name
            $table->string('service_provider_contact')->nullable();
            
            // Cost Information
            $table->decimal('cost', 10, 2)->nullable();
            $table->string('currency', 3)->default('PKR');
            
            // Maintenance Type
            $table->enum('maintenance_type', [
                'routine', // Regular maintenance
                'repair', // Fix issues
                'upgrade', // Improvements
                'inspection', // Safety/legal inspections
                'other'
            ])->default('routine');
            
            // Parts & Labor
            $table->json('parts_used')->nullable(); // Array of parts with costs
            $table->decimal('labor_cost', 10, 2)->nullable();
            $table->decimal('parts_cost', 10, 2)->nullable();
            
            // Documentation
            $table->string('bill_image')->nullable(); // Receipt/bill image
            $table->json('additional_images')->nullable(); // Before/after photos
            $table->string('invoice_number')->nullable();
            
            // Next Service
            $table->date('next_service_date')->nullable();
            $table->integer('next_service_mileage')->nullable();
            
            // Status
            $table->enum('status', ['completed', 'pending', 'scheduled'])->default('completed');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['garage_vehicle_id', 'service_date']);
            $table->index(['user_id', 'service_date']);
            $table->index(['maintenance_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
