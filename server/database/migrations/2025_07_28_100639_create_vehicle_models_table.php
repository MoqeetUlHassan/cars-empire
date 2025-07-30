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
        Schema::create('vehicle_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('make_id')->constrained('vehicle_makes')->onDelete('cascade');
            $table->string('name');
            $table->string('slug');
            $table->integer('year_start')->nullable();
            $table->integer('year_end')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['make_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_models');
    }
};
