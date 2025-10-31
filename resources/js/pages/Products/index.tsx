import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast, Toaster } from 'sonner';

interface Product {
  id: number;
  nama_barang: string;
  sku: string;
  lokasi_rak: string;
  stok: number;
}

interface PaginatedResponse {
  current_page: number;
  data: Product[];
  last_page: number;
  per_page: number;
  total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Products', href: '/products' },
];

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('p.id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [total, setTotal] = useState(0);

  const apiUrl = route('products.apiList', {}, false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = `${apiUrl}?page=${page}&search=${encodeURIComponent(
        search
      )}&sort_by=${sortBy}&sort_order=${sortOrder}`;
      const res = await fetch(url);
      const data = await res.json();

      const paginated: PaginatedResponse = data.data;
      setProducts(paginated.data || []);
      setPage(paginated.current_page);
      setLastPage(paginated.last_page);
      setTotal(paginated.total);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, sortBy, sortOrder]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(route('products.apiDelete', { id }, false), {
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
        throw new Error(errData?.message || 'Failed to delete product');
      }

      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) toast.error(err.message);
      else toast.error('Failed to delete product');
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
      <Head title="Products" />
      <Toaster position="top-right" />

      <div className="mt-4 ml-4 flex items-center space-x-3">
        <Link href={route('products.create', {}, false)}>
          <Button>Create Product</Button>
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
          <p>Loading products...</p>
        ) : (
          <>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">No</th>
                  <th
                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                    onClick={() => handleSort('p.nama_barang')}
                  >
                    Nama Barang {sortBy === 'p.nama_barang' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                    onClick={() => handleSort('p.sku')}
                  >
                    SKU {sortBy === 'p.sku' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                    onClick={() => handleSort('p.lokasi_rak')}
                  >
                    Lokasi Rak {sortBy === 'p.lokasi_rak' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                    onClick={() => handleSort('p.stok')}
                  >
                    Stok {sortBy === 'p.stok' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product.id}>
                      <td className="border border-gray-300 px-4 py-2">
                        {(page - 1) * 10 + (index + 1)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{product.nama_barang}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.sku}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.lokasi_rak}</td>
                      <td className="border border-gray-300 px-4 py-2">{product.stok}</td>
                      <td className="border border-gray-300 px-4 py-2 space-x-2">
                        <Link href={route('products.edit', product.id)}>
                          <Button>Edit</Button>
                        </Link>
                        <Button variant="destructive" onClick={() => handleDelete(product.id)}>
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
                <Button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  disabled={page === lastPage}
                  onClick={() => setPage((prev) => Math.min(lastPage, prev + 1))}
                >
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
