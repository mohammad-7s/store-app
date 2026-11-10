<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // إضافة حقل السائق بحيث يكون يقبل القيم الفارغة (nullable) في البداية قبل أن يقبل السائق الطلب
            $table->unsignedBigInteger('driver_id')->nullable()->after('user_id');

            // ربط المفتاح الأجنبي مع جدول users، وإذا تم حذف السائق يتم جعل الـ driver_id يساوي null
            $table->foreign('driver_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['driver_id']);
            $table->dropColumn('driver_id');
        });
    }
};
