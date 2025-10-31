<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function list(Request $request)
    {
        try {
            // Get query parameters
            $search = $request->input('search');
            $sortBy = $request->input('sort_by', 'p.id'); // default sort by id
            $sortOrder = strtolower($request->input('sort_order', 'asc')) === 'desc' ? 'desc' : 'asc'; // default asc
            $perPage = (int) $request->input('per_page', 10); // default 10 items per page

            // Base query
            $query = DB::table('products as p')
                ->leftJoin('transactions as t', 't.barang_id', '=', 'p.id')
                ->select(
                    'p.id',
                    'p.nama_barang',
                    'p.sku',
                    'p.lokasi_rak',
                    'p.stok'
                )
                ->groupBy('p.id', 'p.nama_barang', 'p.sku', 'p.lokasi_rak', 'p.stok');

            // Apply search filter (by name, sku, or location)
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('p.nama_barang', 'like', "%{$search}%")
                        ->orWhere('p.sku', 'like', "%{$search}%")
                        ->orWhere('p.lokasi_rak', 'like', "%{$search}%");
                });
            }

            // Apply sorting (validate allowed fields to prevent SQL injection)
            $allowedSorts = ['p.id', 'p.nama_barang', 'p.sku', 'p.lokasi_rak', 'p.stok'];
            if (!in_array($sortBy, $allowedSorts)) {
                $sortBy = 'p.id'; // fallback
            }
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $result = $query->paginate($perPage);

            return response()->json([
                "message" => "List data products",
                "status" => true,
                "data" => $result
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Internal server error",
                "status" => false,
                "data" => $th->getMessage()
            ], 500);
        }
    }

    public function create(Request $request)
    {
        $request->validate([
            'nama_barang' => 'required|string',
            'sku' => 'required|string',
            'stok' => 'required|integer',
            'lokasi_rak' => 'required|string',
        ]);

        try {
            $result = DB::table('products')->insert([
                'nama_barang' => $request->input('nama_barang'),
                'sku' => $request->input('sku'),
                'stok' => $request->input('stok'),
                'lokasi_rak' => $request->input('lokasi_rak'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Create product successfully!',
                'status' => true,
                'data' => $result // returns true/false
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Internal server error',
                'status' => false,
                'data' => $th->getMessage()
            ], 500);
        }
    }

    public function detail($id)
    {
        try {
            $result = DB::table('products')->where('id', $id)->first();

            return response()->json([
                "message" => "detail product successfully!",
                "status" => true,
                "data" => $result
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Internal server error",
                "status" => false,
                "data" => $th->getMessage()
            ], 500);
        }
    }

    public function edit($id, Request $request)
    {
        try {
            $result = DB::table('products')
                ->where('id', $id)
                ->update([
                    'nama_barang' => $request->input('nama_barang'),
                    'sku' => $request->input('sku'),
                    'stok' => $request->input('stok'),
                    'lokasi_rak' => $request->input('lokasi_rak'),
                ]);

            return response()->json([
                'message' => 'Edit product successfully!',
                'status' => true,
                'data' => $result
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Internal server error',
                'status' => false,
                'data' => $th->getMessage()
            ], 500);
        }
    }

    public function delete($id)
    {
        try {
            $result = DB::table('products')->where('id', $id)->delete();

            return response()->json([
                'message' => 'Edit product successfully!',
                'status' => true,
                'data' => $result
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Internal server error',
                'status' => false,
                'data' => $th->getMessage()
            ], 500);
        }
    }

    public function dropdown()
    {
        try {
            $result = DB::table('products')->get();

            return response()->json([
                'message' => 'Data product successfully!',
                'status' => true,
                'data' => $result
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Internal server error',
                'status' => false,
                'data' => $th->getMessage()
            ], 500);
        }
    }
}
