<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'status'         => $this->status,
            'items_total'    => (float) $this->items_total,
            'delivery_fee'   => (float) $this->delivery_fee,
            'grand_total'    => (float) $this->grand_total,
            'payment_method' => $this->payment_method,

            // بيانات الزبون
            'customer'       => $this->whenLoaded('customer', function () {
                return [
                    'name'  => $this->customer->name,
                    'phone' => $this->customer->phone,
                ];
            }),

            // عنوان التوصيل
            'address'        => $this->whenLoaded('address', function () {
                return [
                    'street_details' => $this->address->street_details,
                    'region'         => $this->address->region->name ?? null,
                ];
            }),

            // تفاصيل المنتجات داخل الطلب
            'items'          => OrderItemResource::collection($this->whenLoaded('items')),

            'created_at'     => $this->created_at->format('Y-m-d H:i'),
        ];
    }
}
