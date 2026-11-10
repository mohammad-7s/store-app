<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'product_id'  => $this->product_id,
            // استخدام العلاقة مع المنتج (مع مراعاة withTrashed لضمان ظهور اسم المنتج حتى لو تم حذفه)
            'product_name' => $this->product->name ?? 'منتج محذوف',
            'quantity'    => (int) $this->quantity,
            'unit_price'  => (float) $this->unit_price,
            'total_price' => (float) $this->total_price,
        ];
    }
}
