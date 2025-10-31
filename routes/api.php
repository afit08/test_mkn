<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::group(['prefix' => 'products'], function () {
    Route::get('list', [ProductController::class, 'list'])->name('products.apiList');
    Route::post('store', [ProductController::class, 'create'])->name('products.apiStore');
    Route::get('detail/{id}', [ProductController::class, 'detail'])->name('products.apiDetail');
    Route::post('edit/{id}', [ProductController::class, 'edit'])->name('products.apiEdit');
    Route::delete('delete/{id}', [ProductController::class, 'delete'])->name('products.apiDelete');
    Route::get('dropdown', [ProductController::class, 'dropdown'])->name('products.dropdown');
});

Route::group(['prefix' => 'transactions'], function () {
    Route::get('list', [TransactionController::class, 'list'])->name('transactions.apiList');
    Route::post('store', [TransactionController::class, 'store'])->name('transactions.apiStore');
    Route::get('detail/{id}', [TransactionController::class, 'detail'])->name('transactions.apiDetail');
    Route::post('edit/{id}', [TransactionController::class, 'edit'])->name('transactions.apiEdit');
    Route::delete('delete/{id}', [TransactionController::class, 'delete'])->name('transactions.apiDelete');
});

Route::group(['prefix' => 'users'], function () {
    Route::get('list', [UserController::class, 'list'])->name('users.apiList');
    Route::post('store', [UserController::class, 'create'])->name('users.apiStore');
    Route::get('detail/{id}', [UserController::class, 'detail'])->name('users.apiDetail');
    Route::post('edit/{id}', [UserController::class, 'edit'])->name('users.apiEdit');
    Route::delete('delete/{id}', [UserController::class, 'delete'])->name('users.apiDelete');
});

Route::get('chartData', [TransactionController::class, 'chartData'])->name('chartData');
Route::get('/chart/stok-pie', [TransactionController::class, 'stokPieChart'])->name('stokPieChart');
