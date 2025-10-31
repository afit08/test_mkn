<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/index', []);
    }

    public function create()
    {
        return Inertia::render('Users/create');
    }

    public function edit($id)
    {
        // Fetch the product by ID
        $product = DB::table('users')->where('id', $id)->first();

        return Inertia::render('Users/edit', [
            'product' => $product, // pass full product data
            'id' => $product->id,  // optional if you just need the ID
        ]);
    }
}
