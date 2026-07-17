import React, { useState } from 'react';
import { Users, Mail } from 'lucide-react';
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
  FormInput,
  FormSelect,
  FormTextarea,
} from '../components/FormField';
import { validators, validateForm } from '../utils/validation';

const mockTeam = [
  {
    id: 1,
    name: 'Dr. Fatima Ahmed',
    email: 'fatima@dahi.org',
    role: 'Executive Director',
    department: 'Leadership',
    status: 'active',
    joinDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Aisha Khan',
    email: 'aisha@dahi.org',
    role: 'Program Manager',
    department: 'Programs',
    status: 'active',
    joinDate: '2023-06-20',
  },
  {
    id: 3,
    name: 'Zainab Hassan',
    email: 'zainab@dahi.org',
    role: 'Health Educator',
    department: 'Education',
    status: 'active',
    joinDate: '2024-03-10',
  },
  {
    id: 4,
    name: 'Noor Ibrahim',
    email: 'noor@dahi.org',
    role: 'Communications Lead',
    department: 'Communications',
    status: 'active',
    joinDate: '2024-05-01',
  },
];

export default function AdminTeam() {
  const [team, setTeam] = useState(mockTeam);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();
  const { searchQuery, setSearchQuery, filtered: searchedTeam } = useSearch(
    team,
    ['name', 'email', 'role', 'department']
  );
  const { sorted: sortedTeam } = useSorting(searchedTeam);
  const { currentItems, currentPage, totalPages, goToPage } = usePagination(
    sortedTeam,
    10
  );

  const formRules = {
    name: [
      (val) => validators.required(val, 'Team member name'),
      (val) => validators.minLength(val, 2, 'Name'),
    ],
    email: [(val) => validators.email(val)],
    role: [(val) => validators.required(val, 'Role')],
    department: [(val) => validators.required(val, 'Department')],
  };

  const initialFormValues = editingId
    ? team.find((m) => m.id === editingId)
    : {
        name: '',
        email: '',
        role: '',
        department: 'Leadership',
        status: 'active',
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
      setTeam(
        team.map((m) => (m.id === editingId ? { ...m, ...formValues } : m))
      );
      addToast('Team member updated successfully', 'success');
    } else {
      const newMember = {
        ...formValues,
        id: Math.max(...team.map((m) => m.id), 0) + 1,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setTeam([...team, newMember]);
      addToast('Team member added successfully', 'success');
    }

    setShowForm(false);
    setEditingId(null);
    resetForm();
    setIsLoading(false);
  }, (values) => validateForm(values, formRules));

  const handleEdit = (member) => {
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleDelete = (member) => {
    setDeleteConfirm({ id: member.id, name: member.name });
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setTeam(team.filter((m) => m.id !== deleteConfirm.id));
    addToast('Team member removed successfully', 'success');
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
        title="Team Management"
        subtitle="Manage team members and staff"
        action={() => setShowForm(true)}
        actionLabel="Add Team Member"
      />

      <SearchBar
        placeholder="Search team members by name, email, role..."
        value={searchQuery}
        onSearch={setSearchQuery}
      />

      {currentItems.length === 0 && searchQuery === '' ? (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Add your first team member to get started"
          action={() => setShowForm(true)}
          actionLabel="Add Team Member"
        />
      ) : currentItems.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members found"
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
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Department
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
                  {currentItems.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-800 transition"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{member.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Mail size={16} />
                          {member.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {member.role}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-900 text-purple-100 rounded-full text-sm">
                          {member.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={member.status} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(member)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(member)}
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
              totalItems={sortedTeam.length}
            />
          </div>
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingId ? 'Edit Team Member' : 'Add Team Member'}
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
            label="Role"
            name="role"
            value={values.role}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.role ? errors.role : null}
            required
          />

          <FormSelect
            label="Department"
            name="department"
            value={values.department}
            onChange={handleChange}
            required
          >
            <option value="Leadership">Leadership</option>
            <option value="Programs">Programs</option>
            <option value="Education">Education</option>
            <option value="Communications">Communications</option>
            <option value="Finance">Finance</option>
          </FormSelect>

          <FormSelect
            label="Status"
            name="status"
            value={values.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
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
              {editingId ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        title="Remove Team Member"
        message={`Are you sure you want to remove "${deleteConfirm?.name}" from the team? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={isLoading}
      />
    </div>
  );
}
