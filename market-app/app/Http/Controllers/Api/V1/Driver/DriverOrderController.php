<?php

namespace App\Http\Controllers\Api\V1\Driver;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\RegionResource;
use App\Models\Order;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DriverOrderController extends Controller
{
    // 1. جلب الطلبات المتاحة (التي ليس لها سائق بعد وتكون جاهزة أو قيد الانتظار)
    public function availableOrders(Request $request)
{
    $driver = Auth::user();

    // جلب منطقة العمل من العنوان الافتراضي أو أول عنوان مسجل للسائق
    $driverRegionId = $driver->addresses()
    ->where('is_default', true)->value('region_id')
                    ?? $driver->addresses()->value('region_id');

    if (!$driverRegionId) {
        return response()->json([
            'success' => true,
            'message' => 'لم يتم تحديد عنوان أو منطقة عمل لحسابك في النظام.',
            'data' => []
        ]);
    }

    // جلب الطلبات التي تقع في نفس منطقة السائق وتكون بحالة معلقة أو قيد المعالجة
    $orders = Order::whereNull('driver_id')
        ->whereIn('status', ['processing'])
        ->whereHas('address', function ($query) use ($driverRegionId) {
            $query->where('region_id', $driverRegionId);
        })
        ->with(['store', 'address.region', 'user', 'items.product'])
        ->latest()
        ->get();

    return response()->json([
        'success' => true,
        'data' => $orders
    ]);
}
public function index()
    {
        $regions = Region::latest()->get();
        return RegionResource::collection($regions);
    }
public function setDriverRegion(Request $request)
{
    $request->validate([
        'region_id' => 'required|exists:regions,id'
    ]);

    $driver = Auth::user();

    // جلب اسم المنطقة لحفظه فوصف العنوان
    $region = Region::findOrFail($request->region_id);

    // تحديث أو إنشاء عنوان افتراضي للسائق يحمل المنطقة المحددة واسمها
    $driver->addresses()->updateOrCreate(
        ['is_default' => true],
        [
            'region_id' => $request->region_id,
            'street_details' => $region->name
        ]
    );

    return response()->json([
        'success' => true,
        'message' => 'تم تحديث منطقة العمل بنجاح.'
    ]);
}

    // 2. قبول الطلب من قبل السائق
    public function acceptOrder(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        // التحقق مما إذا كان الطلب قد تم قبوله مسبقاً من سائق آخر
        if ($order->driver_id !== null) {
            return response()->json([
                'success' => false,
                'message' => 'عذراً، هذا الطلب تم قبوله من قبل سائق آخر.'
            ], 422);
        }

        // إسناد الطلب للسائق الحالي وتغيير الحالة إلى "out_for_delivery" (خرج للتوصيل)
        $order->update([
            'driver_id' => Auth::id(),
            'status' => 'out_for_delivery'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم قبول الطلب بنجاح، توجه إلى المتجر للاستلام.',
            'data' => $order->load(['store', 'address.region', 'user', 'items.product'])
        ]);
    }

    // 3. جلب طلبات السائق الحالية (التي قبلها ويعمل على توصيلها)
    public function myOrders(Request $request)
    {
        $orders = Order::where('driver_id', Auth::id())
            ->with(['store', 'address.region', 'user', 'items.product'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
    // 4. تأكيد تسليم الطلب وإكماله من قبل السائق
public function completeOrder(Request $request, $id)
{
    $driverId = Auth::id();

    // البحث عن الطلب للتأكد من وجوده وتبعيته للسائق قبل التحديث
    $order = Order::where('id', $id)
        ->where('driver_id', $driverId)
        ->first();

    if (!$order) {
        return response()->json([
            'success' => false,
            'message' => 'الطلب غير موجود أو غير مسجل تحت إدارتك.'
        ], 404);
    }

    // تحديث حالة الطلب إلى مكتمل
    $order->update([
        'status' => 'delivered'
    ]);

    return response()->json([
        'success' => true,
        'message' => 'تم تسليم الطلب وإكماله بنجاح.',
        'data' => $order
    ]);
}
}
