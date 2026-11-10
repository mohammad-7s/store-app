<?php
namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreRegionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'super_admin';
    }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255', 'unique:regions,name'],
            'delivery_cost' => ['required', 'numeric', 'min:0'],
        ];
    }
}
