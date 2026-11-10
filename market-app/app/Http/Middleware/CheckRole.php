<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. هل المستخدم مسجل دخول والتوكن وصل؟
        if (! $request->user()) {
            return response()->json([
                'error_type' => 'Authentication Error',
                'message' => 'التوكن غير صالح، منتهي، أو لم يتم إرساله بشكل صحيح عبر Headers.'
            ], 401);
        }

        // 2. هل الدور مطابِق؟ (سنطبع القيمة الحالية لنراها)
        if ($request->user()->role !== $role) {
            return response()->json([
                'error_type' => 'Role Mismatch Error',
                'message' => 'الدور غير مطابِق!',
                'your_role_in_database' => $request->user()->role,
                'required_role_by_route' => $role
            ], 403);
        }

        return $next($request);
    }
}
