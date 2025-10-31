<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Products/index', []);
    }

    public function create()
    {
        return Inertia::render('Products/create');
    }

    public function edit($id)
    {
        // Fetch the product by ID
        $product = DB::table('products')->where('id', $id)->first();

        return Inertia::render('Products/edit', [
            'product' => $product, // pass full product data
            'id' => $product->id,  // optional if you just need the ID
        ]);
    }
}
