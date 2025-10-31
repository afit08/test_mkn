import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast, Toaster } from 'sonner';

interface Product {
  id: number;
  nama_barang: string;
  sku: string;
  stok: number;
  lokasi_rak: string;
}

export default function EditProduct() {
  const { props } = usePage();
  // Get productId from props or fallback to URL parsing
  const productId =
    props.id ?? Number(window.location.pathname.split('/').pop() || 0);

  if (!productId) {
    toast.error('Invalid product ID');
  }

  const apiUrl = route('products.apiEdit', { id: productId }, false);
  const urlDetail = route('products.apiDetail', { id: productId }, false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: '/products' },
    { title: 'Edit Product', href: `/products/edit/${productId}` },
  ];

  const { data, setData, processing } = useForm<Product>({
    id: 0,
    nama_barang: '',
    sku: '',
    stok: 0,
    lokasi_rak: '',
  });

    // Fetch existing product data
    useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
        try {
        const res = await fetch(urlDetail);
        if (!res.ok) throw new Error('Failed to load product');
        const result = await res.json();

        // Update the form data directly
        setData({
            id: result.data.id,
            nama_barang: result.data.nama_barang,
            sku: result.data.sku,
            stok: result.data.stok,
            lokasi_rak: result.data.lokasi_rak,
        });
        } catch (err) {
        console.error(err);
        toast.error('Failed to load product data');
        }
    };

    fetchProduct();
    }, [productId, urlDetail, setData]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN':
            document.querySelector('meta[name="csrf-token"]')?.getAttribute(
              'content'
            ) || '',
        },
        body: JSON.stringify({
          nama_barang: data.nama_barang,
          sku: data.sku,
          stok: data.stok,
          lokasi_rak: data.lokasi_rak,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to update product');
      }

      const result = await res.json();
      toast.success(result.message || 'Product updated successfully!');

      // Redirect back after 1.5s
      setTimeout(() => {
        window.location.href = route('products.index', {}, false);
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to update product');
      }
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Product" />
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              placeholder="SKU"
              value={data.sku}
              onChange={(e) => setData('sku', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stok">Stock</Label>
            <Input
              id="stok"
              placeholder="Stock"
              type="number"
              value={data.stok}
              onChange={(e) => setData('stok', Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lokasi_rak">Rack Location</Label>
            <Input
              id="lokasi_rak"
              placeholder="Rack Location"
              value={data.lokasi_rak}
              onChange={(e) => setData('lokasi_rak', e.target.value)}
            />
          </div>

          <Button type="submit" disabled={processing}>
            {processing ? 'Updating...' : 'Update Product'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
