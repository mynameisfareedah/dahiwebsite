import React, { useState } from 'react';
import { Users } from 'lucide-react';
import {
  PageHeader,
  Modal,
  SearchBar,
  Pagination,
  ConfirmDeleteModal,
  EmptyState,
  StatusBadge,
} from '../components';
import {
  usePagination,
  useSearch,
  useSorting,
  useForm,
  useToast,
} from '../hooks/useDataManagement';
import { FormInput, FormSelect, FormTextarea } from '../components/FormField';
import { validators, validateForm } from '../utils/validation';

const mockVolunteers = [
  {
    id: 1,
    name: 'Zainab Rashid',
    email: 'zainab@email.com',
    status: 'approved',
    hoursLogged: 48,
    joinDate: '2024-01-15',
    skills: 'Health Education',
  },
  {
    id: 2,
    name: 'Noor Samir',
    email: 'noor@email.com',
    status: 'approved',
    hoursLogged: 32,
    joinDate: '2024-02-20',
    skills: 'Community Outreach',
  },
  {
    id: 3,
    name: 'Hana Karim',
    email: 'hana@email.com',
    status: 'pending',
    hoursLogged: 0,
    joinDate: '2026-07-20',
    skills: 'Communications',
  },
  {
    id: 4,
    name: 'Dina Omar',
    email: 'dina@email.com',
    status: 'rejected',
    hoursLogged: 0,
    joinDate: '2026-07-10',
    skills: 'General Support',
  },
];

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState(mockVolunteers);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();
  const { searchQuery, setSearchQuery, filtered: searchedVolunteers } = useSearch(
    volunteers,
    ['name', 'email', 'skills']
  );
  const { sorted: sortedVolunteers } = useSorting(searchedVolunteers);
  const { currentItems, currentPage, totalPages, goToPage } = usePagination(
    sortedVolunteers,
    10
  );

  const approvedCount = volunteers.filter(
    (v) => v.status === 'approved'
  ).length;
  const pendingCount = volunteers.filter(
    (v) => v.status === 'pending'
  ).length;
  const totalHours = volunteers.reduce((sum, v) => sum + v.hoursLogged, 0);

  const formRules = {
    name: [
      (val) => validators.required(val, 'Volunteer name'),
      (val) => validators.minLength(val, 2, 'Name'),
    ],
    email: [(val) => validators.email(val)],
    skills: [(val) => validators.required(val, 'Skills')],
  };

  const initialFormValues = editingId
    ? volunteers.find((v) => v.id === editingId)
    : {
        name: '',
        email: '',
        skills: '',
        status: 'pending',
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
      setVolunteers(
        volunteers.map((v) => (v.id === editingId ? { ...v, ...formValues } : v))
      );
      addToast('Volunteer updated successfully', 'success');
    } else {
      const newVolunteer = {
        ...formValues,
        id: Math.max(...volunteers.map((v) => v.id), 0) + 1,
        hoursLogged: 0,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setVolunteers([...volunteers, newVolunteer]);
      addToast('Volunteer application received', 'success');
    }

    setShowForm(false);
    setEditingId(null);
    resetForm();
    setIsLoading(false);
  }, (values) => validateForm(values, formRules));

  const handleEdit = (volunteer) => {
    setEditingId(volunteer.id);
    setShowForm(true);
  };

  const handleDelete = (volunteer) => {
    setDeleteConfirm({ id: volunteer.id, name: volunteer.name });
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setVolunteers(volunteers.filter((v) => v.id !== deleteConfirm.id));
    addToast('Volunteer application removed', 'success');
    setDeleteConfirm(null);
    setIsLoading(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Management"
        subtitle="Review and manage volunteer applications"
        action={() => setShowForm(true)}
        actionLabel="Add Volunteer"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Applications</p>
          <p className="text-2xl font-bold text-white mt-2">{volunteers.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Approved</p>
          <p className="text-2xl font-bold text-green-400 mt-2">{approvedCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Hours Logged</p>
          <p className="text-2xl font-bold text-blue-400 mt-2">{totalHours}</p>
        </div>
      </div>

      <SearchBar
        placeholder="Search volunteers by name, email..."
        value={searchQuery}
        onSearch={setSearchQuery}
      />

      {currentItems.length === 0 && searchQuery === '' ? (
        <EmptyState
          icon={Users}
          title="No volunteers yet"
          description="Volunteer applications will appear here"
          action={() => setShowForm(true)}
          actionLabel="Add Volunteer"
        />
      ) : currentItems.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No volunteers found"
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Skills
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Hours
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
                  {currentItems.map((volunteer) => (
                    <tr
                      key={volunteer.id}
                      className="hover:bg-gray-800 transition"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{volunteer.name}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {volunteer.email}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {volunteer.skills}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {volunteer.hoursLogged}h
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={volunteer.status} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(volunteer)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(volunteer)}
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
              totalItems={sortedVolunteers.length}
            />
          </div>
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingId ? 'Edit Volunteer' : 'Add Volunteer'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : null}
            required
          />

          <FormInput
            label="Email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : null}
            required
          />

          <FormInput
            label="Skills/Experience"
            name="skills"
            value={values.skills}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.skills ? errors.skills : null}
            required
          />

          <FormSelect
            label="Status"
            name="status"
            value={values.status}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
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
              {editingId ? 'Update Volunteer' : 'Add Volunteer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        title="Remove Volunteer"
        message={`Are you sure you want to remove "${deleteConfirm?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={isLoading}
      />
    </div>
  );
}
