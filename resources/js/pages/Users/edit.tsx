import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast, Toaster } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function EditUser() {
  const { props } = usePage();
  const userId = props.id ?? Number(window.location.pathname.split('/').pop() || 0);

  if (!userId) {
    toast.error('Invalid user ID');
  }

  const apiUrl = route('users.apiEdit', { id: userId }, false);
  const urlDetail = route('users.apiDetail', { id: userId }, false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
    { title: 'Edit User', href: `/users/edit/${userId}` },
  ];

  const { data, setData, processing } = useForm<User>({
    id: 0,
    name: '',
    email: '',
    role: '',
  });

  // Fetch existing user data
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(urlDetail);
        if (!res.ok) throw new Error('Failed to load user');
        const result = await res.json();

        setData({
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          role: result.data.role,
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load user data');
      }
    };

    fetchUser();
  }, [userId, urlDetail, setData]);

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
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to update user');
      }

      const result = await res.json();
      toast.success(result.message || 'User updated successfully!');

      setTimeout(() => {
        window.location.href = route('users.index', {}, false);
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to update user');
      }
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit User" />
      <Toaster position="top-right" />

      <div className="w-8/12 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              placeholder="Role"
              value={data.role}
              onChange={(e) => setData('role', e.target.value)}
            />
          </div>

          <Button type="submit" disabled={processing}>
            {processing ? 'Updating...' : 'Update User'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
