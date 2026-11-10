<?php

namespace App\Http\Requests\V1\StoreManager;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * تحديد ما إذا كان المستخدم مصرحاً له بالقيام بهذا الطلب.
     */
    public function authorize(): bool
    {
        // فقط مدير المتجر يمكنه إضافة منتجات
        return $this->user()->role === 'store_manager' && $this->user()->store !== null;
    }

    /**
     * قواعد التحقق من البيانات المرسلة من React.
     */
    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id,is_active,1'],
            'description' => ['nullable', 'string'],
            'price'       => ['required', 'numeric', 'min:0'],
            'stock'       => ['required', 'integer', 'min:0'],
            'image'       => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'], // 2MB كحد أقصى
            'is_active'   => ['nullable', 'boolean'],
        ];
    }

    /**
     * (اختياري) تخصيص رسائل الخطأ لتظهر بالعربية في تطبيق React
     */
    public function messages(): array
    {
        return [
            'category_id.exists' => 'القسم المختار غير موجود في النظام.',
            'price.min'          => 'يجب أن يكون السعر صفراً أو أكبر.',
            'image.max'          => 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت.',
        ];
    }
}
