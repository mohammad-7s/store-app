<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Region;
use App\Models\Store;
use App\Models\Category;
use App\Models\Product;
use App\Models\Address;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. إنشاء حساب مدير النظام الأساسي (Super Admin)
        User::create([
            'name' => 'مدير النظام',
            'phone' => '0000000000',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
        ]);

        // 2. إنشاء مناطق جغرافية أساسية
        $regions = Region::factory(5)->create();

        // 3. إنشاء تصنيفات المنتجات
        $categories = Category::factory(4)->create();

        // 4. إنشاء زبائن مع عناوينهم في نفس المناطق
        User::factory(10)->state(['role' => 'customer'])->create()->each(function ($customer) use ($regions) {
            Address::factory()->create([
                'user_id' => $customer->id,
                'region_id' => $regions->random()->id,
            ]);
        });

        // 5. إنشاء سائقين
        User::factory(3)->state(['role' => 'driver'])->create()->each(function ($driver) use ($regions) {
            Address::factory()->create([
                'user_id' => $driver->id,
                'region_id' => $regions->random()->id,
                'is_default' => true,
            ]);
        });

        // 6. إنشاء مديري متاجر مع متاجرهم ومنتجاتهم
        User::factory(3)->state(['role' => 'store_manager'])->create()->each(function ($manager) use ($regions, $categories) {
            $store = Store::create([
                'user_id' => $manager->id,
                'region_id' => $regions->random()->id,
                'name' => 'متجر ' . fake()->company(),
                'is_active' => true,
            ]);

            // إنشاء منتجات تابعة لكل متجر
            Product::factory(5)->create([
                'store_id' => $store->id,
                'category_id' => $categories->random()->id,
            ]);
        });
    }
}
