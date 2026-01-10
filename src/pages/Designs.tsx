import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import DesignForm from '../components/DesignForm';

const formatInr = (cents: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    cents / 100
  );
};

export default function Designs() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['designs'],
    queryFn: async () => {
      const response = await api.get(`/admin/designs?page=1&limit=20`);
      return response.data;
    },
  });
  const [previewDesign, setPreviewDesign] = useState<any>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/designs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      api.patch(`/admin/designs/${id}/featured`, { isFeatured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
    },
  });

  const handleEdit = (design: any) => {
    setSelectedDesign(design);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedDesign(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedDesign(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Designs</h1>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
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
                  <th className="text-left py-3 px-4">Featured</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.designs?.length > 0 ? (
                  data.designs.map((design: any) => (
                    <tr key={design.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {design.thumbnail_key ? (
                            <img
                              src={design.thumbnail_key}
                              alt={design.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded"></div>
                          )}
                        </td>
                      <td className="py-3 px-4 font-medium">{design.title}</td>
                      <td className="py-3 px-4">{design.category?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{formatInr(design.price_cents)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleFeaturedMutation.mutate({
                            id: design.id,
                            isFeatured: !design.is_featured
                          })}
                          className={`p-2 rounded ${
                            design.is_featured
                              ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={design.is_featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <Star size={18} fill={design.is_featured ? 'currentColor' : 'none'} />
                        </button>
                      </td>
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
                          <button 
                            onClick={() => handleEdit(design)}
                            className="p-2 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setPreviewDesign(design)}
                            className="p-2 hover:bg-gray-100 rounded"
                            title="Preview"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>
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
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No designs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <DesignForm design={selectedDesign} onClose={handleCloseForm} />
      )}

      {previewDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{previewDesign.title}</h3>
              <button onClick={() => setPreviewDesign(null)} className="p-2">Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {previewDesign.thumbnail_key ? (
                  <img src={previewDesign.thumbnail_key} alt={previewDesign.title} className="w-full h-64 object-contain" />
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center">No preview</div>
                )}
              </div>
              <div>
                <p className="mb-2">Price: {formatInr(previewDesign.price_cents)}</p>
                <p className="mb-2">Category: {previewDesign.category_name || 'N/A'}</p>
                <p className="mb-4">Description: {previewDesign.description || '—'}</p>
                {previewDesign.asset_key && (
                  <a href={previewDesign.asset_key} target="_blank" rel="noreferrer" className="btn btn-primary inline-block">Download Asset</a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
