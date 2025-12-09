import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function Designs() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['designs', page],
    queryFn: async () => {
      const response = await api.get(`/admin/designs?page=${page}&limit=20`);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/designs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Designs</h1>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Design
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Image</th>
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.designs?.length > 0 ? (
                  data.designs.map((design: any) => (
                    <tr key={design.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                      </td>
                      <td className="py-3 px-4 font-medium">{design.title}</td>
                      <td className="py-3 px-4">{design.category?.name || 'N/A'}</td>
                      <td className="py-3 px-4">${(design.price_cents / 100).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            design.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {design.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(design.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No designs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
