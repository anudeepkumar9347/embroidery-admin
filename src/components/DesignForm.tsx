import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import api from '../lib/api';

interface DesignFormProps {
  design?: any;
  onClose: () => void;
}

interface FormState {
  title: string;
  slug: string;
  description: string;
  priceCents: string | number;
  categoryId: string;
  collectionId: string;
  stitches: string;
  colors: string;
  width_mm: string;
  height_mm: string;
  tags: string;
  licenseType: string;
  is_active: boolean;
  is_featured: boolean;
}

export default function DesignForm({ design, onClose }: DesignFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!design;

  const [formData, setFormData] = useState<FormState>({
    title: design?.title || '',
    slug: design?.slug || '',
    description: design?.description || '',
    priceCents: design?.price_cents ? design.price_cents / 100 : '',
    categoryId: design?.category_id || '',
    collectionId: design?.collection_id || '',
    stitches: design?.stitches || '',
    colors: design?.colors || '',
    width_mm: design?.width_mm || '',
    height_mm: design?.height_mm || '',
    tags: design?.tags?.join(', ') || '',
    licenseType: design?.license_type || 'single-use',
    is_active: design?.is_active ?? true,
    is_featured: design?.is_featured ?? false,
  });

  const [designFile, setDesignFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ asset?: number; thumbnail?: number }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadProgress({});

    if (!designFile || !thumbnailFile) {
      setUploadError('Please select both a design file and a thumbnail image.');
      return;
    }

    const priceValue = parseFloat(String(formData.priceCents));
    const tagsArray = formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);

    const form = new FormData();
    form.append('title', formData.title);
    form.append('slug', formData.slug);
    form.append('description', formData.description);
    form.append('priceCents', String(Number.isFinite(priceValue) ? Math.round(priceValue * 100) : 0));
    if (formData.categoryId) form.append('categoryId', formData.categoryId);
    if (formData.collectionId) form.append('collectionId', formData.collectionId);
    form.append('licenseType', formData.licenseType);
    tagsArray.forEach((tag: string) => form.append('tags', tag));
    form.append('designFile', designFile);
    form.append('thumbnailFile', thumbnailFile);

    try {
      await api.post('/admin/designs', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            setUploadProgress({ asset: Math.round((progressEvent.loaded / progressEvent.total) * 100) });
          }
        },
      });
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      onClose();
    } catch (err: any) {
      setUploadError(err?.response?.data?.error || 'Failed to upload design.');
    }
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
          {/* File Uploads */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Design Files</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Design File (.zip) *</label>
              <input
                type="file"
                accept=".zip"
                required
                className="input"
                onChange={e => setDesignFile(e.target.files?.[0] || null)}
              />
              {uploadProgress.asset !== undefined && (
                <div className="text-xs text-gray-500 mt-1">Upload: {uploadProgress.asset}%</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image (JPG/PNG) *</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                required
                className="input"
                onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
              />
              {uploadProgress.thumbnail !== undefined && (
                <div className="text-xs text-gray-500 mt-1">Upload: {uploadProgress.thumbnail}%</div>
              )}
            </div>
          </div>

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
                Slug *
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
                  value={formData.priceCents}
                  onChange={(e) => setFormData({ ...formData, priceCents: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  className="input"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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
                  value={formData.collectionId}
                  onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
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

          {/* Upload/Error Feedback */}
          {uploadError && (
            <div className="text-red-600 text-sm font-medium">{uploadError}</div>
          )}

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
