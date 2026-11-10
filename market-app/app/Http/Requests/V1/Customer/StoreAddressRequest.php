<?php

namespace App\Http\Requests\V1\Customer;

use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'customer';
    }

    public function rules(): array
    {
        return [
            'region_id'      => ['required', 'exists:regions,id'],
            'street_details' => ['required', 'string', 'max:255'],
            'is_default'     => ['nullable', 'boolean'],
        ];
    }
}
