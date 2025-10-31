<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function list(Request $request)
    {
        try {
            $query = DB::table('users');

            // Search by name or email
            if ($request->has('search') && $request->search != '') {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sortBy', 'id'); // default sort column
            $sortDesc = filter_var($request->get('sortDesc', false), FILTER_VALIDATE_BOOLEAN);
            $query->orderBy($sortBy, $sortDesc ? 'desc' : 'asc');

            // Pagination
            $perPage = (int) $request->get('perPage', 10);
            $page = (int) $request->get('page', 1);

            $total = $query->count();
            $results = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

            return response()->json([
                "message" => "List data users",
                "status" => true,
                "data" => $results,
                "pagination" => [
                    "total" => $total,
                    "perPage" => $perPage,
                    "currentPage" => $page,
                    "lastPage" => ceil($total / $perPage),
                ],
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "Internal server error",
                "status" => false,
                "data" => $th->getMessage(),
            ], 500);
        }
    }

    public function create(Request $request)
    {
        try {
            // Validate input
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'role' => 'required|in:admin,staff',
            ]);

            // Create user using Eloquent
            $user = User::create([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'password' => Hash::make($request->input('password')), // hash password
                'role' => $request->input('role'),
            ]);

            return response()->json([
                'message' => 'Create user successfully!',
                'status' => true,
                'data' => $user, // returns created user
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Internal server error',
                'status' => false,
                'data' => $th->getMessage(),
            ], 500);
        }
    }

    public function detail($id)
    {
        try {
            $result = DB::table('users')->where('id', $id)->first();

            return response()->json([
                'message' => 'Detail user successfully!',
                'status' => true,
                'data' => $result,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Internal server error',
                'status' => false,
                'data' => $th->getMessage(),
            ], 500);
        }
    }

    public function edit(Request $request, $id)
    {
        try {
            $result = DB::table('users')->where('id', $id)->update([
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'role' => $request->input('role'),
            ]);

            return response()->json([
                'message' => 'Detail user successfully!',
                'status' => true,
                'data' => $result,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Internal server error',
                'status' => false,
                'data' => $th->getMessage(),
            ], 500);
        }
    }

    public function delete($id)
    {
        try {
            $result = DB::table('users')->where('id', $id)->delete();

            return response()->json([
                'message' => 'Create user successfully!',
                'status' => true,
                'data' => $result, // returns created user
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Internal server error',
                'status' => false,
                'data' => $th->getMessage(),
            ], 500);
        }
    }
}
