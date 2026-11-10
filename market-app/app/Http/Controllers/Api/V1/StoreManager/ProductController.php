<?php

namespace App\Http\Controllers\Api\V1\StoreManager;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Requests\V1\StoreManager\StoreProductRequest;
use App\Http\Requests\V1\StoreManager\UpdateProductRequest;
use App\Http\Resources\V1\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * استعراض منتجات المتجر الحالي فقط مع التصفح (Pagination)
     */
    public function index(Request $request)
    {
        $store = \App\Models\Store::where('user_id', $request->user()->id)->first();
        if (!$store) {
        return response()->json([
            'success' => true,
            'message' => 'لم تقم بإنشاء متجر خاص بك بعد.',
            'data' => []
        ]);
    }
        $storeId = $request->user()->store->id;

        $products = Product::where('store_id', $storeId)
                            ->with('category')
                            ->latest()
                            ->paginate(15);

        return ProductResource::collection($products);
    }

    /**
     * إضافة منتج جديد لمتجر المدير
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();

        // ربط المنتج حصراً بمتجر المدير الحالي (حماية أمنية منعاً للتلاعب)
        $validated['store_id'] = $request->user()->store->id;

        // معالجة رفع الصورة إذا وجدت
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($validated);

        return response()->json([
            'message' => 'تم إضافة المنتج بنجاح',
            'product' => new ProductResource($product->load('category'))
        ], 201);
    }

    /**
     * استعراض تفاصيل منتج معين
     */
    public function show(Request $request, Product $product)
    {
        // التحقق من ملكية المتجر للمنتج
        if ($product->store_id !== $request->user()->store->id) {
            return response()->json(['message' => 'غير مصرح لك بالوصول لهذا المنتج'], 403);
        }

        return new ProductResource($product->load('category'));
    }

    /**
     * تعديل بيانات المنتج
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        // معالجة تحديث الصورة (استبدال القديمة بالجديدة)
        if ($request->hasFile('image')) {
            // حذف الصورة القديمة إن وجدت
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return response()->json([
            'message' => 'تم تعديل المنتج بنجاح',
            'product' => new ProductResource($product->load('category'))
        ], 200);
    }

    /**
     * حذف المنتج (Soft Delete)
     */
    public function destroy(Request $request, Product $product)
    {
        // التحقق من الملكية
        if ($product->store_id !== $request->user()->store->id) {
            return response()->json(['message' => 'غير مصرح لك بحذف هذا المنتج'], 403);
        }

        // تنفيذ الحذف المرن لحماية الطلبات والالفواتير القديمة
        $product->delete();

        return response()->json([
            'message' => 'تم حذف المنتج بنجاح'
        ], 200);
    }
}
