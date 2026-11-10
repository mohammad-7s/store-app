<?php
namespace Database\Factories;

use App\Models\Store;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'store_id' => Store::inRandomOrder()->first()?->id ?? Store::factory(),
            'category_id' => Category::inRandomOrder()->first()?->id ?? Category::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 10, 500),
            'stock' => fake()->numberBetween(5, 100),
            'is_active' => true,
        ];
    }
}
