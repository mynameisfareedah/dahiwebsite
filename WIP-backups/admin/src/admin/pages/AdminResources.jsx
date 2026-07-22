import React, { useEffect, useState } from 'react';
import { FileText, Image as ImageIcon, Edit2, Trash2 } from 'lucide-react';
import { PageHeader, EmptyState, LoadingSpinner, StatusBadge, Modal } from '../components';
import { FormInput, FormSelect, FormTextarea } from '../components/FormField';
import { resourceService } from '../services/resourceService';

const EMPTY_FORM_VALUES = {
  title: '',
  description: '',
  author: '',
  coverImage: '',
  category: 'general',
  resourceType: 'ebook',
  price: '',
  currency: '',
  platform: '',
  externalUrl: '',
  buttonText: '',
  featured: 'false',
  status: 'draft',
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
};

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadResources = async () => {
      setIsLoading(true);
      setError('');

      try {
        const result = await resourceService.getResources();
        if (!isMounted) return;

        if (result.success) {
          setResources(result.data || []);
        } else {
          setError(result.error?.message || 'Failed to load resources.');
          setResources([]);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load resources.');
        setResources([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadResources();

    return () => {
      isMounted = false;
    };
  }, []);

  const revokeCoverImagePreview = (previewUrl) => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const resetCoverImageState = (nextPreview = '') => {
    revokeCoverImagePreview(coverImagePreview);
    setCoverImagePreview(nextPreview);
    setCoverImageFile(null);
  };

  const openCreateForm = () => {
    resetCoverImageState('');
    setEditingResource(null);
    setFormValues(EMPTY_FORM_VALUES);
    setShowForm(true);
  };

  const openEditForm = (resource) => {
    resetCoverImageState(resource.coverImage || resource.cover_image || '');
    setEditingResource(resource);
    setFormValues({
      title: resource.title || '',
      description: resource.description || '',
      author: resource.author || '',
      coverImage: resource.coverImage || '',
      category: resource.category || 'general',
      resourceType: resource.resourceType || resource.type || 'ebook',
      price: resource.price != null ? String(resource.price) : '',
      currency: resource.currency || '',
      platform: resource.platform || '',
      externalUrl: resource.externalUrl || '',
      buttonText: resource.buttonText || '',
      featured: resource.featured ? 'true' : 'false',
      status: resource.status || 'draft',
    });
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const closeForm = () => {
    revokeCoverImagePreview(coverImagePreview);
    setShowForm(false);
    setEditingResource(null);
    setFormValues(EMPTY_FORM_VALUES);
    setCoverImagePreview('');
    setCoverImageFile(null);
  };

  const handleCoverImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setCoverImageFile(null);
      setCoverImagePreview(formValues.coverImage || '');
      return;
    }

    revokeCoverImagePreview(coverImagePreview);
    const previewUrl = URL.createObjectURL(file);
    setCoverImageFile(file);
    setCoverImagePreview(previewUrl);
    setFormValues((current) => ({ ...current, coverImage: '' }));
  };

  const handleRemoveCoverImage = () => {
    revokeCoverImagePreview(coverImagePreview);
    setCoverImageFile(null);
    setCoverImagePreview('');
    setFormValues((current) => ({ ...current, coverImage: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formValues,
        coverImageFile,
        featured: formValues.featured === 'true',
      };

      const result = editingResource
        ? await resourceService.updateResource(editingResource.id, payload)
        : await resourceService.createResource(payload);

      if (!result.success) {
        setError(result.error?.message || 'Failed to save resource.');
        return;
      }

      if (editingResource) {
        setResources((current) => current.map((item) => (item.id === editingResource.id ? result.data || item : item)));
      } else {
        setResources((current) => [result.data, ...current]);
      }

      closeForm();
    } catch (err) {
      setError(err?.message || 'Failed to save resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Delete "${resource.title}"?`)) {
      return;
    }

    try {
      const result = await resourceService.deleteResource(resource.id);
      if (!result.success) {
        setError(result.error?.message || 'Failed to delete resource.');
        return;
      }

      setResources((current) => current.filter((item) => item.id !== resource.id));
    } catch (err) {
      setError(err?.message || 'Failed to delete resource.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources Management"
        subtitle="Manage external resource links and metadata"
        action={openCreateForm}
        actionLabel="Create Resource"
      />

      {isLoading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading resources..." />
        </div>
      ) : error ? (
        <div className="bg-red-950 border border-red-800 rounded-lg p-6 text-red-200">
          <p className="font-medium">Unable to load resources.</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resources yet"
          description="Create your first external resource link to get started"
          action={openCreateForm}
          actionLabel="Create Resource"
        />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-300">Cover</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-300">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-300">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-300">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-300">Featured</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-300">Downloads</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-300">Created At</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-800 transition">
                    <td className="px-4 py-4">
                      {resource.coverImage ? (
                        <img src={resource.coverImage} alt={resource.title} className="h-12 w-16 object-cover rounded border border-gray-700" />
                      ) : (
                        <div className="h-12 w-16 rounded border border-gray-700 bg-gray-800 flex items-center justify-center text-gray-500">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{resource.title}</div>
                      <div className="text-sm text-gray-400">{resource.author || '—'}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-300">{resource.category || 'general'}</td>
                    <td className="px-4 py-4 text-gray-300">{resource.resourceType || resource.type || 'general'}</td>
                    <td className="px-4 py-4"><StatusBadge status={resource.status || 'draft'} /></td>
                    <td className="px-4 py-4 text-gray-300">{resource.featured ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-4 text-gray-300">{resource.downloads ?? 0}</td>
                    <td className="px-4 py-4 text-gray-300">{formatDate(resource.createdAt || resource.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(resource)}
                          className="p-2 rounded text-amber-400 hover:bg-gray-800"
                          aria-label={`Edit ${resource.title}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(resource)}
                          className="p-2 rounded text-red-400 hover:bg-gray-800"
                          aria-label={`Delete ${resource.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showForm} onClose={closeForm} title={editingResource ? 'Edit Resource' : 'Create Resource'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Title" name="title" value={formValues.title} onChange={handleChange} required />
          <FormTextarea label="Description" name="description" value={formValues.description} onChange={handleChange} rows="3" />
          <div className="rounded-lg border border-gray-700 bg-gray-800/60 p-4">
            <label className="block text-sm font-medium text-gray-200" htmlFor="resource-cover-image">Cover Image</label>
            <p className="mt-1 text-sm text-gray-400">Upload a PNG, JPG, or WEBP image up to 5MB.</p>
            <input
              id="resource-cover-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleCoverImageSelect}
              className="mt-3 block w-full text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
            />
            {(coverImagePreview || formValues.coverImage) && (
              <div className="mt-4 space-y-3">
                <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
                  <img src={coverImagePreview || formValues.coverImage} alt="Cover preview" className="h-40 w-full object-cover" />
                </div>
                <button type="button" onClick={handleRemoveCoverImage} className="text-sm font-medium text-red-400 hover:text-red-300">
                  Remove image
                </button>
              </div>
            )}
          </div>
          <FormInput label="Author" name="author" value={formValues.author} onChange={handleChange} placeholder="Author or creator" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormSelect label="Category" name="category" value={formValues.category} onChange={handleChange}>
              <option value="general">General</option>
              <option value="womens-health">Women's Health</option>
              <option value="menstrual-health">Menstrual Health</option>
              <option value="fertility">Fertility</option>
              <option value="education">Education</option>
            </FormSelect>

            <FormSelect label="Resource Type" name="resourceType" value={formValues.resourceType} onChange={handleChange}>
              <option value="ebook">eBook</option>
              <option value="guide">Guide</option>
              <option value="course">Course</option>
              <option value="webinar">Webinar</option>
              <option value="toolkit">Toolkit</option>
              <option value="article">Article</option>
              <option value="other">Other</option>
            </FormSelect>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormInput label="Price" name="price" type="number" min="0" step="0.01" value={formValues.price} onChange={handleChange} placeholder="0" />
            <FormInput label="Currency" name="currency" value={formValues.currency} onChange={handleChange} placeholder="NGN" />
            <FormInput label="Platform" name="platform" value={formValues.platform} onChange={handleChange} placeholder="Selar, Gumroad, etc." />
          </div>

          <FormInput label="External URL" name="externalUrl" type="url" value={formValues.externalUrl} onChange={handleChange} placeholder="https://example.com" required />
          <FormInput label="Button Text" name="buttonText" value={formValues.buttonText} onChange={handleChange} placeholder="Get Resource" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormSelect label="Featured" name="featured" value={formValues.featured} onChange={handleChange}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </FormSelect>

            <FormSelect label="Status" name="status" value={formValues.status} onChange={handleChange}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </FormSelect>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button type="button" onClick={closeForm} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50">
              {isSubmitting ? 'Saving...' : editingResource ? 'Save Changes' : 'Create Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
