<?php

namespace App\Http\Requests\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        // تسجيل الدخول متاح للجميع (Guest)
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            // التأكد من أن رقم الهاتف فريد ولم يُسجل به من قبل
            'phone'    => ['required', 'string', 'unique:users,phone', 'max:20', 'min:10'],
            // يجب إرسال password_confirmation للتأكيد من التطبيق
            'password' => ['required', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.unique' => 'رقم الهاتف مسجل مسبقاً، الرجاء تسجيل الدخول.',
            'password.confirmed' => 'كلمات المرور غير متطابقة.',
        ];
    }
}
