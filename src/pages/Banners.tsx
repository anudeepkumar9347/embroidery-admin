import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Plus, Edit, Trash2, Star, Image as ImageIcon } from 'lucide-react';

export default function Banners() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await api.get('/admin/banners');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/banners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (banner: any) => {
      if (banner.id) {
        return api.put(`/admin/banners/${banner.id}`, banner);
      }
      return api.post('/admin/banners', banner);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setShowForm(false);
      setSelectedBanner(null);
    },
  });

  const handleEdit = (banner: any) => {
    setSelectedBanner(banner);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedBanner(null);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const banner = {
      id: selectedBanner?.id,
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      description: formData.get('description'),
      imageKey: formData.get('imageKey'),
      linkType: formData.get('linkType'),
      linkId: formData.get('linkId') || null,
      externalUrl: formData.get('externalUrl') || null,
      displayOrder: parseInt(formData.get('displayOrder') as string) || 0,
      isActive: formData.get('isActive') === 'true',
    };

    saveMutation.mutate(banner);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-600 mt-1">Manage hero banners and promotional content</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Banner
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedBanner ? 'Edit Banner' : 'Create New Banner'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={selectedBanner?.title}
                  className="input w-full"
                  placeholder="Featured Collection"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  name="subtitle"
                  defaultValue={selectedBanner?.subtitle}
                  className="input w-full"
                  placeholder="New Arrivals"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                defaultValue={selectedBanner?.description}
                className="input w-full"
                placeholder="Discover our latest embroidery designs..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  name="imageKey"
                  required
                  defaultValue={selectedBanner?.image_key}
                  className="input w-full"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Type *
                </label>
                <select
                  name="linkType"
                  required
                  defaultValue={selectedBanner?.link_type || 'collection'}
                  className="input w-full"
                >
                  <option value="collection">Collection</option>
                  <option value="design">Design</option>
                  <option value="category">Category</option>
                  <option value="external">External URL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link ID (UUID)
                </label>
                <input
                  type="text"
                  name="linkId"
                  defaultValue={selectedBanner?.link_id}
                  className="input w-full"
                  placeholder="UUID for collection/design/category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External URL
                </label>
                <input
                  type="url"
                  name="externalUrl"
                  defaultValue={selectedBanner?.external_url}
                  className="input w-full"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  defaultValue={selectedBanner?.display_order || 0}
                  className="input w-full"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked={selectedBanner?.is_active !== false}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Banner'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedBanner(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-4">
            {data?.banners?.length > 0 ? (
              data.banners.map((banner: any) => (
                <div
                  key={banner.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {banner.image_key ? (
                      <img
                        src={banner.image_key}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                      {banner.is_active && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          Active
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        Order: {banner.display_order}
                      </span>
                    </div>
                    {banner.subtitle && (
                      <p className="text-sm text-gray-600">{banner.subtitle}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Type: {banner.link_type}</span>
                      {banner.link_id && <span>ID: {banner.link_id.slice(0, 8)}...</span>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this banner?')) {
                          deleteMutation.mutate(banner.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No banners yet. Create your first banner to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
