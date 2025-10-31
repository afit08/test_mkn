import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast, Toaster } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface PaginatedResponse {
  current_page: number;
  data: User[];
  last_page: number;
  per_page: number;
  total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Users', href: '/users' },
];

export default function Index() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [total, setTotal] = useState(0);

  const apiUrl = route('users.apiList', {}, false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = `${apiUrl}?page=${page}&search=${encodeURIComponent(
        search
      )}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      const res = await fetch(url);
      const data = await res.json();


      const paginated: PaginatedResponse = data;
      console.log(paginated);
      setUsers(paginated?.data || []);
      setPage(paginated?.current_page || 1);
      setLastPage(paginated?.last_page || 1);
      setTotal(paginated?.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, sortBy, sortOrder]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(route('users.apiDelete', { id }, false), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN':
            (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
              ?.content || '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) toast.error(err.message);
      else toast.error('Failed to delete user');
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
      <Head title="Users" />
      <Toaster position="top-right" />

      <div className="mt-4 ml-4 flex items-center space-x-3">
        <Link href={route('users.create', {}, false)}>
          <Button>Create User</Button>
        </Link>
        <input
          type="text"
          placeholder="Search by name or email..."
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
          <p>Loading users...</p>
        ) : (
          <>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">No</th>
                  <th
                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    Email {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    Role {sortBy === 'role' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id}>
                      <td className="border border-gray-300 px-4 py-2">
                        {(page - 1) * 10 + (index + 1)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                      <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                      <td className="border border-gray-300 px-4 py-2 space-x-2">
                        <Link href={route('users.edit', user.id)}>
                          <Button>Edit</Button>
                        </Link>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

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
