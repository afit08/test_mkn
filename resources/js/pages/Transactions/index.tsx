import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast, Toaster } from 'sonner';

interface Transaction {
    id: number;
    barang_id: number;
    sku: string;
    nama_barang: string;
    jenis_transaksi: string;
    jumlah: number;
    tanggal_transaksi: string;
    keterangan: string;
}

interface PaginatedResponse {
    current_page: number;
    data: Transaction[];
    last_page: number;
    per_page: number;
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Transaction', href: '/transactions' },
];

export default function Index() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [total, setTotal] = useState(0);

    const apiUrl = route('transactions.apiList', {}, false);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const url = `${apiUrl}?page=${page}&search=${encodeURIComponent(
                search
            )}&sort_by=${sortBy}&sort_order=${sortOrder}`;
            const res = await fetch(url);
            const data = await res.json();
            const paginated: PaginatedResponse = data.data;
            setTransactions(paginated.data || []);
            setPage(paginated.current_page);
            setLastPage(paginated.last_page);
            setTotal(paginated.total);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, search, sortBy, sortOrder]);

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(route('transactions.apiDelete', { id }, false), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ||
                        '',
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || 'Failed to delete transaction');
            }

            toast.success('Transaction deleted successfully');
            fetchTransactions();
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) toast.error(err.message);
            else toast.error('Failed to delete transaction');
        }
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction" />
            <Toaster position="top-right" />

            <div className="mt-4 ml-4 flex items-center space-x-3">
                <Link href={route('transactions.create', {}, false)}>
                    <Button>Create Transaction</Button>
                </Link>
                <input
                    type="text"
                    placeholder="Search..."
                    className="border border-gray-300 px-3 py-2 rounded-md"
                    value={search}
                    onChange={(e) => {
                        setPage(1);
                        setSearch(e.target.value);
                    }}
                />
            </div>

            <div className="mt-6 mx-4">
                {loading ? (
                    <p>Loading transactions...</p>
                ) : (
                    <>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2">No</th>
                                    <th
                                        className="border border-gray-300 px-4 py-2 cursor-pointer"
                                        onClick={() => handleSort('sku')}
                                    >
                                        SKU {sortBy === 'sku' && (sortOrder === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th
                                        className="border border-gray-300 px-4 py-2 cursor-pointer"
                                        onClick={() => handleSort('nama_barang')}
                                    >
                                        Nama Barang {sortBy === 'nama_barang' && (sortOrder === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2">Jenis Transaksi</th>
                                    <th className="border border-gray-300 px-4 py-2">Jumlah</th>
                                    <th
                                        className="border border-gray-300 px-4 py-2 cursor-pointer"
                                        onClick={() => handleSort('tanggal_transaksi')}
                                    >
                                        Tanggal Transaksi {sortBy === 'tanggal_transaksi' && (sortOrder === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2">Keterangan</th>
                                    <th className="border border-gray-300 px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-4">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction, index) => (
                                        <tr key={transaction.id}>
                                            <td className="border border-gray-300 px-4 py-2">{(page - 1) * 10 + (index + 1)}</td>
                                            <td className="border border-gray-300 px-4 py-2">{transaction.sku}</td>
                                            <td className="border border-gray-300 px-4 py-2">{transaction.nama_barang}</td>
                                            <td className="border border-gray-300 px-4 py-2">{transaction.jenis_transaksi ?? '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2">{transaction.jumlah ?? '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2">{transaction.tanggal_transaksi ?? '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2">{transaction.keterangan ?? '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 space-x-2">
                                                <Link href={route('transactions.edit', transaction.id)}>
                                                    <Button>Edit</Button>
                                                </Link>
                                                <Button variant="destructive" onClick={() => handleDelete(transaction.id)}>
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-gray-600">
                                Showing page {page} of {lastPage} ({total} items)
                            </p>
                            <div className="space-x-2">
                                <Button disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                                    Previous
                                </Button>
                                <Button disabled={page === lastPage} onClick={() => setPage((prev) => Math.min(lastPage, prev + 1))}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
