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
  { title: 'Users', href: '/users' },
  { title: 'Create a new user', href: '/users/create' },
];

export default function CreateUser() {
  const { data, setData, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const apiUrl = route('users.apiStore', {}, false); // API POST route

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
        throw new Error(errData?.message || 'Failed to create user');
      }

      const result = await res.json();
      toast.success(result.message || 'User created successfully!');

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = route('users.index', {}, false);
      }, 1500);

    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to create user');
      }
      console.error(err);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create a new user" />
      <Toaster position="top-right" />

      <div className="w-8/12 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Full Name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
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
            {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={data.role}
              onChange={(e) => setData('role', e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
            {errors.role && <div className="text-red-500 text-sm">{errors.role}</div>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
            />
            {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <Input
              id="password_confirmation"
              placeholder="Confirm Password"
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData('password_confirmation', e.target.value)}
            />
            {errors.password_confirmation && (
              <div className="text-red-500 text-sm">{errors.password_confirmation}</div>
            )}
          </div>

          <Button type="submit" disabled={processing}>
            {processing ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
