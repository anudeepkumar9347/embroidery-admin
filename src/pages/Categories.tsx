import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Plus, Edit, Trash2, Image as ImageIcon, Upload } from 'lucide-react';

export default function Categories() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageKey, setImageKey] = useState('');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/admin/categories');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowModal(false);
      setName('');
      setDescription('');
      setImageKey('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.put(`/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowModal(false);
      setName('');
      setDescription('');
      setImageKey('');
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.categories?.length > 0 ? (
              data.categories.map((category: any) => (
                <div
                  key={category.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  {category.image_key && (
                    <div className="mb-3 w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={category.image_key}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!category.image_key && (
                    <div className="mb-3 w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {category.designs_count || 0} designs
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setName(category.name || '');
                          setDescription(category.description || '');
                          setImageKey(category.image_key || '');
                          setShowModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(category.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No categories found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                
                let finalImageKey = imageKey;
                
                // Upload file if selected
                if (selectedFile) {
                  setUploading(true);
                  try {
                    const formData = new FormData();
                    formData.append('image', selectedFile);
                    formData.append('folder', 'categories');
                    
                    const uploadResponse = await api.post('/admin/upload-image', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    
                    finalImageKey = uploadResponse.data.url;
                  } catch (error) {
                    console.error('Upload failed:', error);
                    alert('Failed to upload image');
                    setUploading(false);
                    return;
                  }
                  setUploading(false);
                }
                
                if (editingCategory) {
                  updateMutation.mutate({ 
                    id: editingCategory.id, 
                    data: { name, description, imageKey: finalImageKey } 
                  });
                } else {
                  createMutation.mutate({ name, description, imageKey: finalImageKey });
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input resize-none"
                  rows={3}
                  placeholder="Brief description of the category"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                
                {/* Image Preview */}
                {(previewUrl || imageKey) && (
                  <div className="mb-3 relative">
                    <img
                      src={previewUrl || imageKey}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl('');
                        setImageKey('');
                        setSelectedFile(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                {/* File Upload Button */}
                <div className="mb-3">
                  <label className="btn btn-secondary w-full cursor-pointer">
                    <Upload size={16} className="inline mr-2" />
                    {selectedFile ? selectedFile.name : 'Choose Image File'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          setPreviewUrl(URL.createObjectURL(file));
                          setImageKey(''); // Clear URL input when file is selected
                        }
                      }}
                    />
                  </label>
                </div>

                {/* URL Input Alternative */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-xs text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                  <input
                    type="text"
                    value={imageKey}
                    onChange={(e) => {
                      setImageKey(e.target.value);
                      setSelectedFile(null); // Clear file when URL is entered
                      setPreviewUrl('');
                    }}
                    className="input"
                    placeholder="https://example.com/image.jpg"
                    disabled={!!selectedFile}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste an image URL
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setName('');
                    setDescription('');
                    setImageKey('');
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading || createMutation.isPending || updateMutation.isPending}>
                  {uploading ? 'Uploading...' : editingCategory ? (updateMutation.isPending ? 'Saving...' : 'Save') : (createMutation.isPending ? 'Creating...' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
