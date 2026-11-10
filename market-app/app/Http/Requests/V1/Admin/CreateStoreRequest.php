<?php
namespace App\Http\Requests\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        // حماية أمنية: فقط السوبر أدمن يمكنه إنشاء المتاجر
        return $this->user()->role === 'super_admin';
    }

    public function rules(): array
    {
        return [
            // يجب أن يكون المدير موجوداً في جدول المستخدمين وصلاحيته store_manager
            'user_id'   => ['required', 'exists:users,id'],
            // يجب أن تكون المنطقة موجودة لضمان حساب رسوم التوصيل لاحقاً
            'region_id' => ['required', 'exists:regions,id'],
            'name'      => ['required', 'string', 'max:255'],
            'logo'      => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
            'is_active' => ['boolean'],
        ];
    }
}
