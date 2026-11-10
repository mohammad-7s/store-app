<?php

namespace App\Http\Requests\V1\StoreManager;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $order = $this->route('order');
        // التحقق أن المستخدم مدير متجر وأن الطلب يتبع لمتجره حصراً
        return $this->user()->role === 'store_manager'
            && $this->user()->store !== null
            && $order->store_id === $this->user()->store->id;
    }

    public function rules(): array
    {
        return [
            // الحالات المسموح لمدير المتجر تحديثها (لا يمكنه إرجاع الطلب إلى pending مثلاً بشكل عشوائي حسب القواعد)
            'status' => ['required', 'string', 'in:processing,out_for_delivery,delivered,cancelled'],
        ];
    }
}
