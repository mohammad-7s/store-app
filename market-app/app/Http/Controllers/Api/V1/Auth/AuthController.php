<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\V1\Auth\RegisterRequest;
use App\Http\Requests\V1\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // 1. تسجيل مستخدم جديد (زبون)
    public function register(RegisterRequest $request)
    {

        $user = User::create([
            'name'     => $request->name,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
            'role'     => $request->role, // التسجيل المفتوح للزبائن فقط
        ]);

        if ($request->role === 'store_manager') {
    \App\Models\Store::create([
        'user_id' => $user->id,
        'name' => 'متجر ' . $user->name,
        'region_id' => 1, // أو المنطقة الافتراضية
        'is_active' => true,
    ]);
}
        // إصدار التوكن
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'تم إنشاء الحساب بنجاح',
            'user'    => $user,
            'token'   => $token
        ], 201);
    }

    // 2. تسجيل الدخول
    public function login(LoginRequest $request)
    {
        $user = User::where('phone', $request->phone)->first();

        // التحقق من وجود المستخدم وصحة كلمة المرور
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'رقم الهاتف أو كلمة المرور غير صحيحة'
            ], 401);
        }

        // حذف التوكنات القديمة (اختياري، يفضل لتسجيل الخروج من الأجهزة الأخرى)
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح',
            'user'    => $user,
            'token'   => $token
        ], 200);
    }

    // 3. تسجيل الخروج
    public function logout(Request $request)
    {
        // إبطال التوكن الحالي المستخدم في الطلب
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'تم تسجيل الخروج بنجاح'
        ], 200);
    }
}
