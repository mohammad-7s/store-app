<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'is_active'  => (bool) $this->is_active,
            'logo_url'   => $this->logo ? asset('storage/' . $this->logo) : null,

            // جلب بيانات المدير إذا تم استدعاؤها مع المتجر
            'manager'    => $this->whenLoaded('manager', function () {
                return [
                    'id'    => $this->manager->id,
                    'name'  => $this->manager->name,
                    'phone' => $this->manager->phone,
                ];
            }),

            // جلب بيانات المنطقة
            'region'     => $this->whenLoaded('region', function () {
                return [
                    'id'   => $this->region->id,
                    'name' => $this->region->name,
                ];
            }),

            'created_at' => $this->created_at->format('Y-m-d'),
        ];
    }
}
