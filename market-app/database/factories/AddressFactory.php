<?php
namespace Database\Factories;

use App\Models\User;
use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'customer']),
            'region_id' => Region::inRandomOrder()->first()?->id ?? Region::factory(),
            'street_details' => fake()->streetAddress(),
            'is_default' => true,
        ];
    }
}
