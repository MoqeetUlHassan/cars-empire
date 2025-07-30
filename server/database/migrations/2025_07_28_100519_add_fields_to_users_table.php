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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->text('bio')->nullable()->after('phone');
            $table->string('city')->nullable()->after('bio');
            $table->string('state')->nullable()->after('city');
            $table->string('avatar')->nullable()->after('state');
            $table->enum('role', ['user', 'admin'])->default('user')->after('avatar');
            $table->boolean('is_verified')->default(false)->after('role');
            $table->timestamp('last_active_at')->nullable()->after('is_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'bio',
                'city',
                'state',
                'avatar',
                'role',
                'is_verified',
                'last_active_at'
            ]);
        });
    }
};
