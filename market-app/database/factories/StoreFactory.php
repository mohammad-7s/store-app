<?php
namespace Database\Factories;

use App\Models\User;
use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;

class StoreFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'store_manager']),
            'region_id' => Region::inRandomOrder()->first()?->id ?? Region::factory(),
            'name' => 'متجر ' . fake()->company(),
            'is_active' => true,
        ];
    }
}
