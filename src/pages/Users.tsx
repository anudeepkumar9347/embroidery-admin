import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

function useUsers(page = 1, limit = 50) {
  return useQuery(['admin-users', page, limit], async () => {
    const resp = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return resp.data;
  });
}

export default function UsersPage() {
  const { data } = useUsers();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Users</h1>

      <div className="card">
        {data?.users?.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="p-2">Email</th>
                <th className="p-2">Name</th>
                <th className="p-2">Role</th>
                <th className="p-2">Active</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u: any) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.display_name || '-'}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.is_active ? 'Yes' : 'No'}</td>
                  <td className="p-2">{new Date(u.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-sm text-gray-500 p-4">No users found</div>
        )}
      </div>
    </div>
  );
}
