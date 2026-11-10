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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete(); // الزبون
            $table->foreignId('store_id')->constrained()->restrictOnDelete(); // المتجر
            $table->foreignId('address_id')->constrained()->restrictOnDelete(); // عنوان التوصيل
            $table->enum('status', ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'])->default('pending');
            $table->decimal('items_total', 10, 2); // مجموع المنتجات
            $table->decimal('delivery_fee', 8, 2); // رسوم التوصيل الثابتة وقت الطلب
            $table->decimal('grand_total', 10, 2); // المجموع الكلي
            $table->string('payment_method')->default('cash_on_delivery');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
