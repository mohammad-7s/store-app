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
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            // cascadeOnDelete: إذا تم حذف المستخدم تُحذف عناوينه
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // restrictOnDelete: لا يمكن حذف منطقة مرتبط بها عناوين زبائن
            $table->foreignId('region_id')->constrained()->restrictOnDelete();
            $table->string('street_details');
            $table->boolean('is_default')->default(false); // هل هو العنوان الافتراضي؟
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
