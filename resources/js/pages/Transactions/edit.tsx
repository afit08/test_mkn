import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast, Toaster } from 'sonner';

interface Transaction {
    id: number;
    barang_id: number;
    jenis_transaksi: string;
    jumlah: number;
    tanggal_transaksi: string;
    keterangan: string;
}

interface Product {
    id: number;
    nama_barang: string;
}

export default function EditTransaction() {
    const { props } = usePage();
    const transactionId = props.id ?? Number(window.location.pathname.split('/').pop() || 0);

    if (!transactionId) {
        toast.error('Invalid transaction ID');
    }

    const apiUrl = route('transactions.apiEdit', { id: transactionId }, false);
    const urlDetail = route('transactions.apiDetail', { id: transactionId }, false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Transactions', href: '/transactions' },
        { title: 'Edit Transaction', href: `/transactions/edit/${transactionId}` },
    ];

    const { data, setData, processing } = useForm<Transaction>({
        id: 0,
        barang_id: 0,
        jenis_transaksi: '',
        jumlah: 0,
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
                setProducts(json.data || []);
            } catch (err) {
                console.error(err);
                toast.error(err instanceof Error ? err.message : 'Failed to load products');
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    // Fetch existing transaction
    useEffect(() => {
        if (!transactionId) return;

        const fetchTransaction = async () => {
            try {
                const res = await fetch(urlDetail);
                if (!res.ok) throw new Error('Failed to load transaction');
                const result = await res.json();

                setData({
                    id: result.data.id,
                    barang_id: result.data.barang_id,
                    jenis_transaksi: result.data.jenis_transaksi,
                    jumlah: result.data.jumlah,
                    tanggal_transaksi: result.data.tanggal_transaksi,
                    keterangan: result.data.keterangan,
                });
            } catch (err) {
                console.error(err);
                toast.error('Failed to load transaction data');
            }
        };

        fetchTransaction();
    }, [transactionId, urlDetail, setData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
                throw new Error(errData?.message || 'Failed to update transaction');
            }

            const result = await res.json();
            toast.success(result.message || 'Transaction updated successfully!');

            setTimeout(() => {
                window.location.href = route('transactions.index', {}, false);
            }, 1500);
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error('Failed to update transaction');
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Transaction" />
            <Toaster position="top-right" />

            <div className="w-8/12 p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product dropdown */}
                    <div className="space-y-1.5">
                        <Label htmlFor="barang_id">Product</Label>
                        <select
                            id="barang_id"
                            className="w-full border rounded p-2"
                            value={data.barang_id}
                            onChange={(e) => setData('barang_id', Number(e.target.value))}
                            disabled={loadingProducts}
                        >
                            <option value={0}>Select Product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.nama_barang}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Jenis Transaksi dropdown */}
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
                    </div>

                    {/* Jumlah */}
                    <div className="space-y-1.5">
                        <Label htmlFor="jumlah">Jumlah</Label>
                        <Input
                            id="jumlah"
                            type="number"
                            value={data.jumlah}
                            onChange={(e) => setData('jumlah', Number(e.target.value))}
                        />
                    </div>

                    {/* Tanggal Transaksi */}
                    <div className="space-y-1.5">
                        <Label htmlFor="tanggal_transaksi">Tanggal Transaksi</Label>
                        <Input
                            id="tanggal_transaksi"
                            type="date"
                            value={data.tanggal_transaksi}
                            onChange={(e) => setData('tanggal_transaksi', e.target.value)}
                        />
                    </div>

                    {/* Keterangan */}
                    <div className="space-y-1.5">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <Input
                            id="keterangan"
                            value={data.keterangan}
                            onChange={(e) => setData('keterangan', e.target.value)}
                        />
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Updating...' : 'Update Transaction'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
