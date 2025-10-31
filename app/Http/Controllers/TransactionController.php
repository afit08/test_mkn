<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        return Inertia::render('Transactions/index', []);
    }

    public function create()
    {
        return Inertia::render('Transactions/create');
    }

    public function edit($id)
    {
        // Fetch the product by ID
        $product = DB::table('transactions')->where('id', $id)->first();

        return Inertia::render('Transactions/edit', [
            'product' => $product, // pass full product data
            'id' => $product->id,  // optional if you just need the ID
        ]);
    }
}
