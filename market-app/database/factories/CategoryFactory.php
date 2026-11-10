<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['وجبات سريعة', 'مشروبات', 'حلويات', 'معجنات', 'خضار وفواكه']),
            'is_active' => true,
        ];
    }
}
