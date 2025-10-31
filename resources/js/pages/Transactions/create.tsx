import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast, Toaster } from 'sonner';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Transactions', href: '/transactions' },
    { title: 'Create a new transaction', href: '/transactions/create' },
];

interface Product {
    id: number;
    nama_barang: string;
}

export default function CreateTransactions() {
    const { data, setData, processing, errors } = useForm({
        barang_id: '',
        jenis_transaksi: '',
        jumlah: '',
        tanggal_transaksi: '',
        keterangan: '',
    });

    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Fetch products for dropdown
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(route('products.dropdown', {}, false));
                if (!res.ok) throw new Error('Failed to fetch products');
                const json = await res.json();

                setProducts(json.data || []); // adjust if API returns differently
            } catch (err: unknown) {
                console.error(err);
                toast.error(err instanceof Error ? err.message : 'Failed to load products');
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const apiUrl = route('transactions.apiStore', {}, false); // API POST route

        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || 'Failed to create transaction');
            }

            const result = await res.json();
            toast.success(result.message || 'Transaction created successfully!');

            setTimeout(() => {
                window.location.href = route('transactions.index', {}, false);
            }, 1500);

        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error('Failed to create transaction');
            }
            console.error(err);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create a new transaction" />
            <Toaster position="top-right" />

            <div className="w-8/12 p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="barang_id">Barang</Label>
                        <select
                            id="barang_id"
                            className="w-full border rounded p-2"
                            value={data.barang_id}
                            onChange={(e) => setData('barang_id', e.target.value)}
                            disabled={loadingProducts}
                        >
                            <option value="">Select Barang</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.nama_barang}
                                </option>
                            ))}
                        </select>
                        {errors.barang_id && <div className="text-red-500 text-sm">{errors.barang_id}</div>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="jenis_transaksi">Jenis Transaksi</Label>
                        <select
                            id="jenis_transaksi"
                            className="w-full border rounded p-2"
                            value={data.jenis_transaksi}
                            onChange={(e) => setData('jenis_transaksi', e.target.value)}
                        >
                            <option value="">Select Jenis Transaksi</option>
                            <option value="masuk">Masuk</option>
                            <option value="keluar">Keluar</option>
                        </select>
                        {errors.jenis_transaksi && (
                            <div className="text-red-500 text-sm">{errors.jenis_transaksi}</div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="jumlah">Jumlah</Label>
                        <Input
                            id="jumlah"
                            placeholder="Jumlah"
                            type="number"
                            value={data.jumlah}
                            onChange={(e) => setData('jumlah', e.target.value)}
                        />
                        {errors.jumlah && <div className="text-red-500 text-sm">{errors.jumlah}</div>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tanggal_transaksi">Tanggal Transaksi</Label>
                        <Input
                            id="tanggal_transaksi"
                            type="date"
                            placeholder="Tanggal Transaksi"
                            value={data.tanggal_transaksi}
                            onChange={(e) => setData('tanggal_transaksi', e.target.value)}
                        />
                        {errors.tanggal_transaksi && (
                            <div className="text-red-500 text-sm">{errors.tanggal_transaksi}</div>
                        )}
                    </div>


                    <div className="space-y-1.5">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <Input
                            id="keterangan"
                            placeholder="Keterangan"
                            value={data.keterangan}
                            onChange={(e) => setData('keterangan', e.target.value)}
                        />
                        {errors.keterangan && <div className="text-red-500 text-sm">{errors.keterangan}</div>}
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Adding...' : 'Add Product'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
