<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'store_id',
        'address_id',
        'driver_id',
        'status',
        'items_total',
        'delivery_fee',
        'grand_total',
        'payment_method',
    ];

    protected $casts = [
        'items_total' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    // العلاقات
    public function customer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
    public function user()
{
    return $this->belongsTo(User::class, 'user_id');
}
}
