<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminDriverController extends Controller
{
    /**
     * عرض جميع السائقين المسجلين في النظام
     */
    public function index()
    {
        $drivers = User::where('role', 'driver')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $drivers
        ]);
    }

    /**
     * إضافة سائق جديد بواسطة الأدمن
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users,phone|min:10',
            'password' => 'required|string|min:6',
        ]);

        $driver = User::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'driver',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء حساب السائق بنجاح',
            'data' => $driver
        ], 201);
    }

    /**
     * تعديل بيانات السائق
     */
    public function update(Request $request, User $driver)
    {
        // التحقق من أن المستخدم المعني هو سائق فعلاً
        if ($driver->role !== 'driver') {
            return response()->json([
                'success' => false,
                'message' => 'المستخدم المستهدف ليس سائقاً'
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            // استثناء رقم الهاتف الخاص بنفس السائق أثناء التحقق من التفرد
            'phone' => 'sometimes|required|string|unique:users,phone,' . $driver->id . '|min:10',
            'password' => 'nullable|string|min:6',
        ]);

        $updateData = [
            'name' => $request->input('name', $driver->name),
            'phone' => $request->input('phone', $driver->phone),
        ];

        // تحديث كلمة المرور فقط في حال تم إرسالها
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $driver->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات السائق بنجاح',
            'data' => $driver
        ]);
    }

    /**
     * حذف السائق
     */
    public function destroy(User $driver)
    {
        if ($driver->role !== 'driver') {
            return response()->json([
                'success' => false,
                'message' => 'المستخدم المستهدف ليس سائقاً'
            ], 403);
        }

        $driver->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف السائق بنجاح'
        ]);
    }
}
