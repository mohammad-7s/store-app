<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Http\Requests\V1\Customer\StoreAddressRequest;
use App\Http\Resources\V1\Customer\AddressResource;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $addresses = Address::where('user_id', $request->user()->id)->with('region')->get();
        return AddressResource::collection($addresses);
    }

    public function store(StoreAddressRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;

        // إذا كان هذا العنوان هو الأول، نجعه افتراضياً تلقائياً
        $hasDefault = Address::where('user_id', $request->user()->id)->exists();
        if (!$hasDefault) {
            $validated['is_default'] = true;
        } elseif (!empty($validated['is_default']) && $validated['is_default']) {
            // إذا طلب جعله افتراضياً، نقوم بإلغاء الافتراضي عن باقي عناوين الزبون
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address = Address::create($validated);

        return response()->json([
            'message' => 'تم حفظ العنوان بنجاح',
            'address' => new AddressResource($address->load('region'))
        ], 201);
    }

    public function destroy(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'غير مصرح لك بحذف هذا العنوان'], 403);
        }

        $address->delete();
        return response()->json(['message' => 'تم حذف العنوان بنجاح'], 200);
    }
}
