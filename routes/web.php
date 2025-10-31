<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login'); // redirect to login route
})->name('home');

// Route::get('user_login', [LoginController::class, 'login'])->name('login');
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::group(['prefix' => 'products'], function () {
        Route::get('', [ProductController::class, 'index'])->name('products.index');
        Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
        Route::get('products/edit/{id}', [ProductController::class, 'edit'])->name('products.edit');
    });

    Route::group(['prefix' => 'transactions'], function () {
        Route::get('', [TransactionController::class, 'index'])->name('transactions.index');
        Route::get('transactions/create', [TransactionController::class, 'create'])->name('transactions.create');
        Route::get('transactions/edit/{id}', [TransactionController::class, 'edit'])->name('transactions.edit');
    });

    Route::group(['prefix' => 'users'], function () {
        Route::get('', [UserController::class, 'index'])->name('users.index');
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::get('users/edit/{id}', [UserController::class, 'edit'])->name('users.edit');
    });
});

require __DIR__ . '/settings.php';
