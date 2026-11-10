<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Region;
use App\Http\Requests\V1\Admin\StoreRegionRequest;
use App\Http\Resources\V1\RegionResource;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    public function index()
    {
        $regions = Region::latest()->get();
        return RegionResource::collection($regions);
    }

    public function store(StoreRegionRequest $request)
    {
        $region = Region::create($request->validated());

        return response()->json([
            'message' => 'تم إضافة المنطقة بنجاح',
            'region'  => new RegionResource($region)
        ], 201);
    }

    // دالة تعديل المنطقة
    public function update(Request $request, Region $region)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'delivery_cost' => 'sometimes|required|numeric|min:0',
        ]);

        $region->update($validated);

        return response()->json([
            'message' => 'تم تحديث المنطقة بنجاح',
            'region'  => new RegionResource($region)
        ]);
    }

    // دالة حذف المنطقة
    public function destroy(Region $region)
    {
        $region->delete();

        return response()->json([
            'message' => 'تم حذف المنطقة بنجاح'
        ]);
    }
}
