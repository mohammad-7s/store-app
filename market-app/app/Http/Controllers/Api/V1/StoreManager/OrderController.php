<?php

namespace App\Http\Controllers\Api\V1\StoreManager;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Requests\V1\StoreManager\UpdateOrderStatusRequest;
use App\Http\Resources\V1\OrderResource;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * استعراض الطلبات الواردة لمتجر المدير حصراً (مع إمكانية الفلترة بالحالة)
     */
    public function index(Request $request)
    {
        $storeId = $request->user()->store->id;

        $query = Order::where('store_id', $storeId)
            ->with(['customer', 'address.region', 'items.product']);

        // إمكانية فلترة الطلبات حسب الحالة (مثلاً: ?status=pending)
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(15);

        return OrderResource::collection($orders);
    }

    /**
     * عرض تفاصيل طلب معين للمتجر
     */
    public function show(Request $request, Order $order)
    {
        if ($order->store_id !== $request->user()->store->id) {
            return response()->json(['message' => 'غير مصرح لك بالوصول لهذا الطلب'], 403);
        }

        return new OrderResource($order->load(['customer', 'address.region', 'items.product']));
    }

    /**
     * تحديث حالة الطلب (قيد التجهيز، في الطريق، إلخ)
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        if($request->status === 'delivered' || $request->status === 'out_for_delivery') {
            return response()->json(['message' => 'لا يمكن للمدير تحديث حالة الطلب إلى "تم التوصيل" أو "في الطريق". هذه الحالات مخصصة للسائق فقط.'], 403);
        }
        else{
        $order->update([
            'status' => $request->status
        ]);
        }
        return response()->json([
            'message' => 'تم تحديث حالة الطلب بنجاح',
            'order'   => new OrderResource($order->load(['customer', 'address.region', 'items.product']))
        ], 200);
    }
}
