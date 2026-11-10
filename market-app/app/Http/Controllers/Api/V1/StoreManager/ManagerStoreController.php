<?php

namespace App\Http\Controllers\Api\V1\StoreManager;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;

class ManagerStoreController extends Controller
{
    public function getStoreInfo(Request $request)
{
    $store = Store::where('user_id', $request->user()->id)->with('region')->first();

    return response()->json([
        'success' => true,
        'data' => $store
    ]);
}

public function updateStoreRegion(Request $request)
{
    $request->validate([
        'region_id' => 'required|exists:regions,id',
        'name' => 'sometimes|string|max:255',
    ]);

    $store = Store::where('user_id', $request->user()->id)->firstOrFail();

    $store->update([
        'region_id' => $request->region_id,
        'name' => $request->input('name', $store->name),
    ]);

    return response()->json([
        'success' => true,
        'message' => 'تم تحديث معلومات المتجر والمنطقة بنجاح',
        'data' => $store->load('region')
    ]);
}
}
