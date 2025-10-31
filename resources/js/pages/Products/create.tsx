import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast, Toaster } from 'sonner';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Products', href: '/products' },
  { title: 'Create a new product', href: '/products/create' },
];

export default function CreateProduct() {
  const { data, setData, processing, errors } = useForm({
    nama_barang: '',
    sku: '',
    stok: '',
    lokasi_rak: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const apiUrl = route('products.apiStore', {}, false); // API POST route

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Try to get error message from API response
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to create product');
      }

      const result = await res.json();
      toast.success(result.message || 'Product created successfully!');

      // Delay redirect so toast can show
      setTimeout(() => {
        window.location.href = route('products.index', {}, false);
      }, 1500); // 1.5 seconds

    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to create product');
      }
      console.error(err);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create a new product" />

      {/* Mount Toaster once per app or per page */}
      <Toaster position="top-right" />

      <div className="w-8/12 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nama_barang">Product Name</Label>
            <Input
              id="nama_barang"
              placeholder="Product Name"
              value={data.nama_barang}
              onChange={(e) => setData('nama_barang', e.target.value)}
            />
            {errors.nama_barang && <div className="text-red-500 text-sm">{errors.nama_barang}</div>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              placeholder="SKU"
              value={data.sku}
              onChange={(e) => setData('sku', e.target.value)}
            />
            {errors.sku && <div className="text-red-500 text-sm">{errors.sku}</div>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stok">Stock</Label>
            <Input
              id="stok"
              placeholder="Stock"
              type="number"
              value={data.stok}
              onChange={(e) => setData('stok', e.target.value)}
            />
            {errors.stok && <div className="text-red-500 text-sm">{errors.stok}</div>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lokasi_rak">Rack Location</Label>
            <Input
              id="lokasi_rak"
              placeholder="Rack Location"
              value={data.lokasi_rak}
              onChange={(e) => setData('lokasi_rak', e.target.value)}
            />
            {errors.lokasi_rak && <div className="text-red-500 text-sm">{errors.lokasi_rak}</div>}
          </div>

          <Button type="submit" disabled={processing}>
            {processing ? 'Adding...' : 'Add Product'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
