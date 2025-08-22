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
        Schema::table('vehicles', function (Blueprint $table) {
            // Social media links (JSON field)
            $table->json('social_media_links')->nullable()->after('contact_email');

            // Video clip for advertisement
            $table->string('video_path')->nullable()->after('social_media_links');
            $table->string('video_thumbnail_path')->nullable()->after('video_path');
            $table->integer('video_duration')->nullable()->comment('Duration in seconds')->after('video_thumbnail_path');
            $table->bigInteger('video_size')->nullable()->comment('File size in bytes')->after('video_duration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn([
                'social_media_links',
                'video_path',
                'video_thumbnail_path',
                'video_duration',
                'video_size'
            ]);
        });
    }
};
