<?php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RegionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->city(),
            'delivery_cost' => fake()->randomFloat(2, 5, 25),
        ];
    }
}
