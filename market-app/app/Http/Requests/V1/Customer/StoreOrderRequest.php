<?php

namespace App\Http\Requests\V1\Customer;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'customer';
    }

    public function rules(): array
    {
        return [
            'store_id'            => ['required', 'exists:stores,id'],
            'address_id'          => ['required', 'exists:addresses,id'],
            // مصفوفة المنتجات المطلوبة مع كمياتها
            'items'               => ['required', 'array', 'min:1'],
            'items.*.product_id'  => ['required', 'exists:products,id'],
            'items.*.quantity'    => ['required', 'integer', 'min:1'],
        ];
    }
}
