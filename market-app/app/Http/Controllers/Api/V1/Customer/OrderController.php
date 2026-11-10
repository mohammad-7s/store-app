<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\Product;
use App\Models\Order;
use App\Models\Address;
use App\Http\Requests\V1\Customer\StoreOrderRequest;
use App\Http\Resources\V1\StoreResource;
use App\Http\Resources\V1\ProductResource;
use App\Http\Resources\V1\OrderResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * استعراض المتاجر المفعلة في منطقة الزبون الحالية
     */
   public function stores(Request $request)
{
    $regionId = $request->input('region_id');

    if (!$regionId) {
        $defaultAddress = Address::where('user_id', $request->user()->id)
            ->where('is_default', true)
            ->first();

        $regionId = $defaultAddress ? $defaultAddress->region_id : null;
    }

    $storesQuery = Store::where('is_active', true)->with(['manager', 'region']);

    if ($regionId) {
        $storesQuery->where('region_id', $regionId);
    }

    return StoreResource::collection($storesQuery->get());
}

    /**
     * استعراض منتجات متجر معين للزبون
     */
    public function storeProducts(Store $store)
    {
        if (!$store->is_active) {
            return response()->json(['message' => 'هذا المتجر غير متوفر حالياً'], 404);
        }

        $products = Product::where('store_id', $store->id)
                            ->where('is_active', true)
                            ->where('stock', '>', 0)
                            ->with('category')
                            ->get();

        return ProductResource::collection($products);
    }

    /**
     * استعراض سجل طلبات الزبون
     */
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
                      ->with(['store', 'address.region', 'items.product'])
                      ->latest()
                      ->paginate(10);

        return OrderResource::collection($orders);
    }

    /**
     * خوارزمية إنشاء الطلب (Place Order) مع المعاملات الآمنة (DB Transactions)
     */
    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        // 1. التحقق من أن العنوان يتبع للزبون
        $address = Address::where('id', $validated['address_id'])
                          ->where('user_id', $user->id)
                          ->with('region')
                          ->first();

        if (! $address) {
            return response()->json(['message' => 'عنوان التوصيل غير صالح'], 422);
        }

        // 2. التحقق من أن المتجر مفعل
        $store = Store::where('id', $validated['store_id'])->where('is_active', true)->first();
        if (! $store) {
            return response()->json(['message' => 'المتجر غير متاح للطلب حالياً'], 422);
        }

        // استخدام Database Transaction لضمان سلامة البيانات (خصم المخزون وتسجيل الطلب معاً)
        return DB::transaction(function () use ($validated, $user, $address, $store) {

            $itemsTotal = 0;
            $orderItemsData = [];

            // 3. التحقق من الأسعار والمخزون وحساب المجموع بدقة من السيرفر (لا نعتمد على أسعار الواجهة أبداً لأسباب أمنية)
            foreach ($validated['items'] as $item) {
                $product = Product::where('id', $item['product_id'])
                                  ->where('store_id', $store->id)
                                  ->where('is_active', true)
                                  ->lockForUpdate() // قفل السجل لمنع حدوث تضارب في المخزون المتزامن
                                  ->first();

                if (! $product) {
                    throw new \Exception("المنتج برقم {$item['product_id']} غير متوفر في هذا المتجر.");
                }

                if ($product->stock < $item['quantity']) {
                    throw new \Exception("الكمية المطلوبة غير متوفرة للمنتج: {$product->name}");
                }

                $unitPrice = $product->price;
                $totalPrice = $unitPrice * $item['quantity'];
                $itemsTotal += $totalPrice;

                // خصم الكمية من المخزون
                $product->decrement('stock', $item['quantity']);

                $orderItemsData[] = [
                    'product_id'  => $product->id,
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $unitPrice,
                    'total_price' => $totalPrice,
                ];
            }

            // 4. جلب رسوم التوصيل الخاصة بمنطقة العنوان
            $deliveryFee = $address->region->delivery_cost;
            $grandTotal = $itemsTotal + $deliveryFee;

            // 5. إنشاء الطلب الرئيسي
            $order = Order::create([
                'user_id'        => $user->id,
                'store_id'       => $store->id,
                'address_id'     => $address->id,
                'status'         => 'pending',
                'items_total'    => $itemsTotal,
                'delivery_fee'   => $deliveryFee,
                'grand_total'    => $grandTotal,
                'payment_method' => 'cash_on_delivery',
            ]);

            // 6. ربط المنتجات بالطلب
            $order->items()->createMany($orderItemsData);

            return response()->json([
                'message' => 'تم إنشاء طلبك بنجاح',
                'order'   => new OrderResource($order->load(['store', 'address.region', 'items.product']))
            ], 201);
        });
    }
}
