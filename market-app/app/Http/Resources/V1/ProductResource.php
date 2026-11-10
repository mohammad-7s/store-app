<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            // تحويل السعر إلى رقم عشري لتجنب مشاكل الجافاسكربت مع النصوص
            'price'       => (float) $this->price,
            'stock'       => (int) $this->stock,
            'is_active'   => (bool) $this->is_active,
            // تحضير الرابط الكامل للصورة لتتمكن React من عرضها مباشرة
            'image_url'   => $this->image ? asset('storage/' . $this->image) : null,

            // جلب بيانات القسم فقط إذا تم طلبها (لمنع مشكلة N+1 في قواعد البيانات)
            'category'    => new CategoryResource($this->whenLoaded('category')),

            // تنسيق التاريخ ليناسب قراءته في الواجهة
            'created_at'  => $this->created_at->format('Y-m-d'),
        ];
    }
}
