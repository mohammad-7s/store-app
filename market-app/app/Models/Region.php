<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'delivery_cost',
    ];

    // العلاقات
    public function stores()
    {
        return $this->hasMany(Store::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }
}
