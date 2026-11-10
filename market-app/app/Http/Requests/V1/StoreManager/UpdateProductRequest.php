<?php

namespace App\Http\Requests\V1\StoreManager;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        // التأكد من أن المستخدم مدير متجر ولديه متجر مرتبط، وأن المنتج المطلوب تعديله يتبع لمتجره
        $product = $this->route('product'); // جلب المنتج من مسار الـ Route
        return $this->user()->role === 'store_manager'
            && $this->user()->store !== null
            && $product->store_id === $this->user()->store->id;
    }

    public function rules(): array
    {
        return [
            'name'        => ['sometimes', 'required', 'string', 'max:255'],
            'category_id' => ['sometimes', 'required', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'price'       => ['sometimes', 'required', 'numeric', 'min:0'],
            'stock'       => ['sometimes', 'required', 'integer', 'min:0'],
            'image'       => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active'   => ['nullable', 'boolean'],
        ];
    }
}
