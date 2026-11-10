<?php

namespace App\Http\Resources\V1\Customer;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'street_details' => $this->street_details,
            'is_default'     => (bool) $this->is_default,
            'region'         => [
                'id'            => $this->region->id,
                'name'          => $this->region->name,
                'delivery_cost' => (float) $this->region->delivery_cost,
            ],
        ];
    }
}
