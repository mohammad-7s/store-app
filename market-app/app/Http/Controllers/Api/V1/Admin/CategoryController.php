<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Requests\V1\Admin\StoreCategoryRequest;
use App\Http\Resources\V1\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::latest()->get();
        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('categories', 'public');
        }

        $validated['is_active'] = $request->input('is_active', true);

        $category = Category::create($validated);

        return response()->json([
            'message'  => 'تم إضافة القسم بنجاح',
            'category' => new CategoryResource($category)
        ], 201);
    }

    // دالة التعديل وتحديث البيانات
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            // حذف الصورة القديمة إن وجدت
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $validated['image'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($validated);

        return response()->json([
            'message'  => 'تم تحديث القسم بنجاح',
            'category' => new CategoryResource($category)
        ]);
    }

    // دالة الحذف
    public function destroy(Category $category)
    {
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return response()->json([
            'message' => 'تم حذف القسم بنجاح'
        ]);
    }
}
