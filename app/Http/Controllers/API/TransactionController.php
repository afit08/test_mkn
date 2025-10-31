<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function list(Request $request)
    {
        try {
            // 🔹 Read query parameters
            $search = $request->input('search');             // keyword search
            $sortBy = $request->input('sort_by', 'transactions.id'); // default sort column
            $sortOrder = $request->input('sort_order', 'asc');       // default sort order
            $perPage = $request->input('per_page', 10);      // default 10 per page

            // 🔹 Base query
            $query = DB::table('transactions')
                ->leftJoin('products', 'products.id', '=', 'transactions.barang_id')
                ->select(
                    'transactions.id',
                    'transactions.barang_id',
                    'transactions.jenis_transaksi',
                    'transactions.jumlah',
                    'transactions.tanggal_transaksi',
                    'transactions.keterangan',
                    'transactions.created_at as transaksi_created_at',
                    'transactions.updated_at as transaksi_updated_at',
                    'products.nama_barang',
                    'products.sku',
                    'products.stok',
                    'products.lokasi_rak'
                );

            // 🔹 Search filter (by product name, SKU, or transaction type)
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('products.nama_barang', 'like', "%{$search}%")
                        ->orWhere('products.sku', 'like', "%{$search}%")
                        ->orWhere('transactions.jenis_transaksi', 'like', "%{$search}%")
                        ->orWhere('transactions.keterangan', 'like', "%{$search}%");
                });
            }

            // 🔹 Validate allowed sort columns
            $allowedSorts = [
                'transactions.id',
                'transactions.jenis_transaksi',
                'transactions.jumlah',
                'transactions.tanggal_transaksi',
                'products.nama_barang',
                'products.sku',
                'products.lokasi_rak',
            ];

            if (!in_array($sortBy, $allowedSorts)) {
                $sortBy = 'transactions.id'; // fallback default
            }

            // 🔹 Apply sorting
            $query->orderBy($sortBy, $sortOrder);

            // 🔹 Apply pagination
            $result = $query->paginate($perPage);

            // 🔹 Return paginated response
            return response()->json([
                "message" => "List data transactions",
                "status" => true,
                "data" => $result,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Internal server error",
                "status" => false,
                "data" => $th->getMessage(),
            ], 500);
        }
    }


    public function store(Request $request)
    {
        $request->validate([
            'barang_id' => 'required|string',
            'jenis_transaksi' => 'required|string',
            'jumlah' => 'required|integer',
            'tanggal_transaksi' => 'required|string',
        ]);

        try {
            $result = DB::table('transactions')->insert([
                'barang_id' => $request->input('barang_id'),
                'jenis_transaksi' => $request->input('jenis_transaksi'),
                'jumlah' => $request->input('jumlah'),
                'tanggal_transaksi' => $request->input('tanggal_transaksi'),
                'keterangan' => $request->input('keterangan'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Create transactions successfully!',
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
            $result = DB::table('transactions')->where('id', $id)->first();

            return response()->json([
                "message" => "detail transactions successfully!",
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
            $result = DB::table('transactions')
                ->where('id', $id)
                ->update([
                    'barang_id' => $request->input('barang_id'),
                    'jenis_transaksi' => $request->input('jenis_transaksi'),
                    'jumlah' => $request->input('jumlah'),
                    'tanggal_transaksi' => $request->input('tanggal_transaksi'),
                    'keterangan' => $request->input('keterangan'),
                ]);

            return response()->json([
                'message' => 'Edit transactions successfully!',
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
            $result = DB::table('transactions')->where('id', $id)->delete();

            return response()->json([
                'message' => 'Edit transactions successfully!',
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

    public function chartData()
    {
        // Aggregate jumlah by tanggal_transaksi and jenis_transaksi
        $data = DB::table('transactions')
            ->select('tanggal_transaksi', 'jenis_transaksi', DB::raw('SUM(jumlah) as total'))
            ->groupBy('tanggal_transaksi', 'jenis_transaksi')
            ->orderBy('tanggal_transaksi')
            ->get();

        // Transform data into chart-friendly format
        $dates = $data->pluck('tanggal_transaksi')->unique()->values();
        $masukData = $dates->map(function ($date) use ($data) {
            return $data->where('tanggal_transaksi', $date)
                ->where('jenis_transaksi', 'masuk')
                ->sum('total');
        });
        $keluarData = $dates->map(function ($date) use ($data) {
            return $data->where('tanggal_transaksi', $date)
                ->where('jenis_transaksi', 'keluar')
                ->sum('total');
        });

        return response()->json([
            'labels' => $dates,
            'datasets' => [
                [
                    'label' => 'Masuk',
                    'data' => $masukData,
                    'backgroundColor' => '#4f46e5',
                ],
                [
                    'label' => 'Keluar',
                    'data' => $keluarData,
                    'backgroundColor' => '#f43f5e',
                ],
            ],
        ]);
    }
}
