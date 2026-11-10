<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use App\Http\Requests\V1\Admin\CreateStoreRequest;
use App\Http\Resources\V1\StoreResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StoreController extends Controller
{
    /**
     * استعراض جميع المتاجر (مع مديريها ومناطقها)
     */
    public function index()
    {
        // نستخدم with لجلب العلاقات وتقليل استعلامات قاعدة البيانات (Eager Loading)
        $stores = Store::with(['manager', 'region'])->latest()->paginate(10);

        return StoreResource::collection($stores);
    }

    /**
     * إنشاء متجر جديد
     */
    public function store(CreateStoreRequest $request)
    {
        // جلب البيانات التي اجتازت شروط التحقق في CreateStoreRequest
        $validated = $request->validated();

        // 1. التأكد من أن المستخدم المختار يمتلك صلاحية مدير متجر
        // إذا كان زبوناً عادياً، نقوم بترقيته لمدير متجر
        $user = User::findOrFail($validated['user_id']);
        if ($user->role !== 'store_manager') {
            $user->update(['role' => 'store_manager']);
        }

        // 2. معالجة وحفظ صورة الشعار (Logo) في حال تم رفعها
        if ($request->hasFile('logo')) {
            // سيتم حفظ الصورة في مجلد storage/app/public/stores/logos
            $validated['logo'] = $request->file('logo')->store('stores/logos', 'public');
        }

        // 3. إنشاء المتجر في قاعدة البيانات
        $store = Store::create($validated);

        // 4. إرجاع بيانات المتجر الجديد مع رسالة نجاح
        // نستخدم load لجلب العلاقات بعد الإنشاء مباشرة
        return response()->json([
            'message' => 'تم إضافة المتجر بنجاح',
            'store'   => new StoreResource($store->load(['manager', 'region']))
        ], 201);
    }

    /**
     * تعديل وتحديث بيانات المتجر أو حالته (تفعيل/تعطيل)
     */
    public function update(Request $request, Store $store)
    {

        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:255',
            'user_id'   => 'sometimes|required|exists:users,id',
            'region_id' => 'sometimes|required|exists:regions,id',
            'logo'      => 'nullable|image|max:2048',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['user_id'])) {
            $user = User::findOrFail($validated['user_id']);
            if ($user->role !== 'store_manager') {
                $user->update(['role' => 'store_manager']);
            }
        }

        if ($request->hasFile('logo')) {
            if ($store->logo) {
                Storage::disk('public')->delete($store->logo);
            }
            $validated['logo'] = $request->file('logo')->store('stores/logos', 'public');
        }

        $store->update($validated);

        return response()->json([
            'message' => 'تم تحديث المتجر بنجاح',
            'store'   => new StoreResource($store->load(['manager', 'region']))
        ]);
    }

    /**
     * حذف المتجر
     */
    public function destroy(Store $store)
    {
        if ($store->logo) {
            Storage::disk('public')->delete($store->logo);
        }

        $store->delete();

        return response()->json([
            'message' => 'تم حذف المتجر بنجاح'
        ]);
    }
}
