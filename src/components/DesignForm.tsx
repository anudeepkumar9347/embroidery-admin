import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../lib/api';

interface DesignFormProps {
  design?: any;
  onClose: () => void;
}

export default function DesignForm({ design, onClose }: DesignFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!design;

  const [formData, setFormData] = useState({
    title: design?.title || '',
    description: design?.description || '',
    price_cents: design?.price_cents ? design.price_cents / 100 : '',
    category_id: design?.category_id || '',
    collection_id: design?.collection_id || '',
    stitches: design?.stitches || '',
    colors: design?.colors || '',
    width_mm: design?.width_mm || '',
    height_mm: design?.height_mm || '',
    tags: design?.tags?.join(', ') || '',
    is_active: design?.is_active ?? true,
    is_featured: design?.is_featured ?? false,
  });

  // Fetch categories and collections
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.categories;
    },
  });

  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await api.get('/collections');
      return response.data.collections;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        return api.put(`/admin/designs/${design.id}`, data);
      }
      return api.post('/admin/designs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseFloat(String(formData.price_cents));

    const payload = {
      ...formData,
      price_cents: Number.isFinite(priceValue) ? Math.round(priceValue * 100) : 0,
      stitches: parseInt(formData.stitches) || null,
      colors: parseInt(formData.colors) || null,
      width_mm: parseFloat(formData.width_mm) || null,
      height_mm: parseFloat(formData.height_mm) || null,
      tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Design' : 'Add New Design'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                className="input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (INR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input"
                  value={formData.price_cents}
                  onChange={(e) => setFormData({ ...formData, price_cents: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  className="input"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection (Optional)
              </label>
              <select
                className="input"
                value={formData.collection_id}
                onChange={(e) => setFormData({ ...formData, collection_id: e.target.value })}
              >
                <option value="">No collection</option>
                {collections?.map((col: any) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. floral, wedding, vintage"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate tags with commas for better searchability
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold text-lg">Technical Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stitches
                </label>
                <input
                  type="number"
                  className="input"
                  value={formData.stitches}
                  onChange={(e) => setFormData({ ...formData, stitches: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colors
                </label>
                <input
                  type="number"
                  className="input"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (mm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={formData.width_mm}
                  onChange={(e) => setFormData({ ...formData, width_mm: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (mm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={formData.height_mm}
                  onChange={(e) => setFormData({ ...formData, height_mm: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold text-lg">Status</h3>
            
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Active (visible to customers)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Featured</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="btn btn-primary"
            >
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Design' : 'Create Design'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
