import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import {
  PageHeader,
  StatusBadge,
  Modal,
  SearchBar,
  Pagination,
  ConfirmDeleteModal,
  EmptyState,
} from '../components';
import {
  usePagination,
  useSearch,
  useSorting,
  useForm,
  useToast,
} from '../hooks/useDataManagement';
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from '../components/FormField';
import { FileUploader } from '../components/FileUploader';
import { validators, validateForm } from '../utils/validation';

const mockResources = [
  {
    id: 1,
    title: 'Menstrual Health Guide',
    description: 'Comprehensive guide to menstrual health',
    type: 'PDF',
    downloads: 1245,
    author: 'Dr. Fatima',
    status: 'published',
    uploadDate: '2026-06-15',
    fileSize: '2.4 MB',
  },
  {
    id: 2,
    title: 'Reproductive Health Video Series',
    description: 'Video tutorials on reproductive health',
    type: 'Video',
    downloads: 892,
    author: 'Health Team',
    status: 'published',
    uploadDate: '2026-06-10',
    fileSize: '145 MB',
  },
  {
    id: 3,
    title: 'Mental Wellness Workbook',
    description: 'Interactive workbook for mental wellness',
    type: 'PDF',
    downloads: 567,
    author: 'Dr. Aisha',
    status: 'published',
    uploadDate: '2026-06-05',
    fileSize: '3.2 MB',
  },
  {
    id: 4,
    title: 'Nutrition Guide for Women',
    description: 'Nutrition guide tailored for women',
    type: 'PDF',
    downloads: 0,
    author: 'Nutritionist',
    status: 'draft',
    uploadDate: '2026-07-01',
    fileSize: '1.8 MB',
  },
];

export default function AdminResources() {
  const [resources, setResources] = useState(mockResources);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const { addToast } = useToast();
  const { searchQuery, setSearchQuery, filtered: searchedResources } = useSearch(
    resources,
    ['title', 'author', 'type']
  );
  const { sorted: sortedResources } = useSorting(searchedResources);
  const { currentItems, currentPage, totalPages, goToPage } = usePagination(
    sortedResources,
    10
  );

  const formRules = {
    title: [
      (val) => validators.required(val, 'Resource title'),
      (val) => validators.minLength(val, 3, 'Resource title'),
    ],
    type: [(val) => validators.required(val, 'Resource type')],
    author: [(val) => validators.required(val, 'Author name')],
  };

  const initialFormValues = editingId
    ? resources.find((r) => r.id === editingId)
    : {
        title: '',
        description: '',
        type: 'PDF',
        author: '',
        status: 'draft',
      };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: handleFormSubmit,
    resetForm,
  } = useForm(initialFormValues, async (formValues) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (editingId) {
      setResources(
        resources.map((r) =>
          r.id === editingId ? { ...r, ...formValues } : r
        )
      );
      addToast('Resource updated successfully', 'success');
    } else {
      const newResource = {
        ...formValues,
        id: Math.max(...resources.map((r) => r.id), 0) + 1,
        downloads: 0,
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: uploadedFiles[0]?.size || '0 KB',
      };
      setResources([...resources, newResource]);
      addToast('Resource created successfully', 'success');
    }

    setShowForm(false);
    setEditingId(null);
    setUploadedFiles([]);
    resetForm();
    setIsLoading(false);
  }, (values) => validateForm(values, formRules));

  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setShowForm(true);
  };

  const handleDelete = async (resource) => {
    setDeleteConfirm({ id: resource.id, title: resource.title });
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setResources(resources.filter((r) => r.id !== deleteConfirm.id));
    addToast('Resource deleted successfully', 'success');
    setDeleteConfirm(null);
    setIsLoading(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setUploadedFiles([]);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources Management"
        subtitle="Upload and manage educational resources"
        action={() => setShowForm(true)}
        actionLabel="Upload Resource"
      />

      <SearchBar
        placeholder="Search resources by title, author..."
        value={searchQuery}
        onSearch={setSearchQuery}
      />

      {currentItems.length === 0 && searchQuery === '' ? (
        <EmptyState
          icon={FileText}
          title="No resources yet"
          description="Upload your first resource to get started"
          action={() => setShowForm(true)}
          actionLabel="Upload Resource"
        />
      ) : currentItems.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resources found"
          description="Try adjusting your search query"
        />
      ) : (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Downloads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentItems.map((resource) => (
                    <tr
                      key={resource.id}
                      className="hover:bg-gray-800 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {resource.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            {resource.fileSize}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-900 text-blue-100 rounded-full text-sm">
                          {resource.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {resource.author}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Download size={16} />
                          {resource.downloads}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={resource.status} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(resource)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(resource)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              itemsPerPage={10}
              totalItems={sortedResources.length}
            />
          </div>
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingId ? 'Edit Resource' : 'Upload Resource'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <FormInput
            label="Resource Title"
            name="title"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.title ? errors.title : null}
            required
          />

          <FormTextarea
            label="Description"
            name="description"
            value={values.description}
            onChange={handleChange}
            rows="3"
          />

          <FileUploader
            accept="application/pdf,video/*,image/*"
            maxSize={104857600}
            onChange={setUploadedFiles}
            multiple={false}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Resource Type"
              name="type"
              value={values.type}
              onChange={handleChange}
              required
            >
              <option value="PDF">PDF</option>
              <option value="Video">Video</option>
              <option value="Image">Image</option>
              <option value="Document">Document</option>
            </FormSelect>

            <FormInput
              label="Author"
              name="author"
              value={values.author}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.author ? errors.author : null}
              required
            />
          </div>

          <FormSelect
            label="Status"
            name="status"
            value={values.status}
            onChange={handleChange}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </FormSelect>

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleCloseForm}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {editingId ? 'Update Resource' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        title="Delete Resource"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={isLoading}
      />
    </div>
  );
}
