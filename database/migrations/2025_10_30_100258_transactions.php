<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('barang_id'); // Reference to products table
            $table->string('jenis_transaksi');
            $table->integer('jumlah'); // Changed from string to integer
            $table->date('tanggal_transaksi'); // Changed from string to date
            $table->string('keterangan')->nullable(); // Optional
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('barang_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
