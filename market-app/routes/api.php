<?php
use App\Http\Controllers\Api\V1\Admin\AdminDriverController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Admin\RegionController;
use App\Http\Controllers\Api\V1\Admin\CategoryController;
use App\Http\Controllers\Api\V1\Admin\StoreController as AdminStoreController;
use App\Http\Controllers\Api\V1\StoreManager\ProductController as ManagerProductController;
use App\Http\Controllers\Api\V1\StoreManager\OrderController as ManagerOrderController;
use App\Http\Controllers\Api\V1\Customer\AddressController;
use App\Http\Controllers\Api\V1\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Api\V1\Driver\DriverOrderController;
use App\Http\Controllers\Api\V1\StoreManager\ManagerStoreController;

Route::prefix('v1')->group(function () {

    // 1. مسارات المصادقة العامة (Guest Routes)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // 2. المسارات المحمية (Authenticated Routes) - مجموعة واحدة فقط تغطي الجميع
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);

        // أ. مسارات تطبيق الزبون (Customer Routes)
        Route::prefix('customer')->middleware('role:customer')->group(function () {
            Route::get('/stores', [CustomerOrderController::class, 'stores']);
            Route::get('/stores/{store}/products', [CustomerOrderController::class, 'storeProducts']);
            Route::get('/addresses', [AddressController::class, 'index']);
            Route::post('/addresses', [AddressController::class, 'store']);
            Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
            Route::get('/regions', [RegionController::class, 'index']);
            Route::get('/orders', [CustomerOrderController::class, 'index']);
            Route::post('/orders', [CustomerOrderController::class, 'store']);
        });

        // ب. مسارات لوحة مدير المتجر (Store Manager Routes)
        Route::prefix('store-manager')->middleware('role:store_manager')->group(function () {
            Route::apiResource('/products', ManagerProductController::class);
            Route::get('/categories', [CategoryController::class, 'index']);
            Route::get('/orders', [ManagerOrderController::class, 'index']);
            Route::get('/orders/{order}', [ManagerOrderController::class, 'show']);
            Route::patch('/orders/{order}/status', [ManagerOrderController::class, 'updateStatus']);
            Route::get('/regions', [RegionController::class, 'index']);
    Route::get('/store-info', [ManagerStoreController::class, 'getStoreInfo']);
    Route::put('/store-info', [ManagerStoreController::class, 'updateStoreRegion']);

            });

        // ج. مسارات لوحة السائق (Driver Routes)
        Route::prefix('driver')->middleware('role:driver')->group(function () {
            Route::get('/regions', [RegionController::class, 'index']);

            Route::get('/available-orders', [DriverOrderController::class, 'availableOrders']);
            Route::post('/orders/{id}/accept', [DriverOrderController::class, 'acceptOrder']);
            Route::get('/my-orders', [DriverOrderController::class, 'myOrders']);
            Route::post('/set-region', [DriverOrderController::class, 'setDriverRegion']);
            Route::patch('/orders/{id}/complete', [DriverOrderController::class, 'completeOrder']);
        });

        // د. مسارات لوحة الإدارة العليا (Super Admin Routes)
        Route::prefix('admin')->middleware('role:super_admin')->group(function () {
            // المناطق
            Route::get('/regions', [RegionController::class, 'index']);
            Route::post('/regions', [RegionController::class, 'store']);
            Route::put('/regions/{region}', [RegionController::class, 'update']);
            Route::delete('/regions/{region}', [RegionController::class, 'destroy']);

            // الأقسام
            Route::get('/categories', [CategoryController::class, 'index']);
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::put('/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

            // المتاجر
            Route::get('/stores', [AdminStoreController::class, 'index']);
            Route::post('/stores', [AdminStoreController::class, 'store']);
            Route::put('/stores/{store}', [AdminStoreController::class, 'update']);
            Route::delete('/stores/{store}', [AdminStoreController::class, 'destroy']);

            // السائقين
            Route::get('/drivers', [AdminDriverController::class, 'index']);
            Route::post('/drivers', [AdminDriverController::class, 'store']);
            Route::put('/drivers/{driver}', [AdminDriverController::class, 'update']);
            Route::delete('/drivers/{driver}', [AdminDriverController::class, 'destroy']);
        });

    });

});
