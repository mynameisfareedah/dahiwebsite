import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import {
  PageHeader,
  ConfirmDeleteModal,
  EmptyState,
  LoadingSpinner,
  Modal,
} from '../components';
import {
  FormCheckbox,
  FormInput,
  FormSelect,
  FormTextarea,
  FormField,
} from '../components/FormField';
import { teamMemberService } from '../services/teamMemberService';

const INITIAL_FORM_VALUES = {
  full_name: '',
  role: '',
  department: 'Leadership',
  email: '',
  linkedin_url: '',
  display_order: 0,
  profile_image: '',
  bio: '',
  featured: false,
  active: true,
};

export default function AdminTeam() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTeamMembers() {
      setLoading(true);
      setError('');

      try {
        const result = await teamMemberService.getTeamMembers();
        if (!isMounted) return;

        if (result.success) {
          setTeamMembers(result.data || []);
        } else {
          setError(result.error?.message || 'Failed to load team members.');
          setTeamMembers([]);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load team members.');
        setTeamMembers([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTeamMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateForm = () => {
    setEditingMember(null);
    setFormValues(INITIAL_FORM_VALUES);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (member) => {
    setEditingMember(member);
    setFormValues({
      full_name: member.full_name || '',
      role: member.role || '',
      department: member.department || 'Leadership',
      email: member.email || '',
      linkedin_url: member.linkedin_url || '',
      display_order: member.display_order ?? 0,
      profile_image: member.profile_image || '',
      bio: member.bio || '',
      featured: Boolean(member.featured),
      active: member.active !== false,
    });
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMember(null);
    setFormValues(INITIAL_FORM_VALUES);
    setError('');
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const uploadResult = await teamMemberService.uploadProfileImage(file);
      setFormValues((current) => ({
        ...current,
        profile_image: uploadResult.publicUrl,
      }));
    } catch (err) {
      setError(err?.message || 'Failed to upload profile image.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      full_name: formValues.full_name.trim(),
      role: formValues.role.trim(),
      department: formValues.department,
      email: formValues.email.trim(),
      linkedin_url: formValues.linkedin_url.trim(),
      display_order: Number(formValues.display_order || 0),
      profile_image: formValues.profile_image || null,
      bio: formValues.bio.trim(),
      featured: Boolean(formValues.featured),
      active: formValues.active !== false,
    };

    try {
      const result = editingMember
        ? await teamMemberService.updateTeamMember(editingMember.id, payload)
        : await teamMemberService.createTeamMember(payload);

      if (!result.success) {
        setError(result.error?.message || 'Failed to save team member.');
        return;
      }

      if (editingMember) {
        setTeamMembers((current) =>
          current.map((member) => (member.id === editingMember.id ? result.data : member))
        );
      } else {
        setTeamMembers((current) => [result.data, ...current]);
      }

      closeForm();
    } catch (err) {
      setError(err?.message || 'Failed to save team member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (member) => {
    setDeleteConfirm(member);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await teamMemberService.deleteTeamMember(deleteConfirm.id);
      if (!result.success) {
        setError(result.error?.message || 'Failed to delete team member.');
        return;
      }

      setTeamMembers((current) => current.filter((member) => member.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err?.message || 'Failed to delete team member.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        subtitle="Manage the team members shown on the public site."
        action={openCreateForm}
        actionLabel="Add Team Member"
      />

      {loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading team members..." />
        </div>
      ) : teamMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Add a team member to show on the public website."
          action={openCreateForm}
          actionLabel="Add Team Member"
        />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {error ? (
            <div className="bg-red-950 border border-red-800 p-4 text-red-200">
              {error}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Display Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-800 transition">
                    <td className="px-6 py-4">
                      {member.profile_image ? (
                        <img
                          src={member.profile_image}
                          alt={member.full_name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-blue-200">
                          {member.full_name?.slice(0, 2).toUpperCase() || 'TM'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{member.full_name}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{member.role}</td>
                    <td className="px-6 py-4 text-gray-300">{member.featured ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 text-gray-300">{member.active ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 text-gray-300">{member.display_order ?? 0}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(member)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
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
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            name="full_name"
            value={formValues.full_name}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Role"
            name="role"
            value={formValues.role}
            onChange={handleChange}
            required
          />

          <FormSelect
            label="Department"
            name="department"
            value={formValues.department}
            onChange={handleChange}
          >
            <option value="Leadership">Leadership</option>
            <option value="Programs">Programs</option>
            <option value="Education">Education</option>
            <option value="Operations">Operations</option>
            <option value="Communications">Communications</option>
            <option value="Finance">Finance</option>
          </FormSelect>

          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
          />

          <FormInput
            label="LinkedIn URL"
            type="url"
            name="linkedin_url"
            value={formValues.linkedin_url}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/..."
          />

          <FormInput
            label="Display Order"
            name="display_order"
            type="number"
            value={formValues.display_order}
            onChange={handleChange}
          />

          <FormField label="Profile Image" help="Upload a profile image for the team member.">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </FormField>

          {formValues.profile_image ? (
            <div className="rounded-lg overflow-hidden border border-gray-700">
              <img
                src={formValues.profile_image}
                alt="Profile preview"
                className="w-full max-h-60 object-cover"
              />
            </div>
          ) : null}

          <FormTextarea
            label="Bio"
            name="bio"
            value={formValues.bio}
            onChange={handleChange}
            rows="4"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormCheckbox
              label="Featured team member"
              name="featured"
              checked={formValues.featured}
              onChange={handleChange}
            />
            <FormCheckbox
              label="Visible on the public website"
              name="active"
              checked={formValues.active}
              onChange={handleChange}
            />
          </div>

          {error ? (
            <div className="bg-red-950 border border-red-800 rounded-lg p-4 text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-4 border-t border-gray-700 sm:flex-row">
            <button
              type="button"
              onClick={closeForm}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingMember ? 'Save Changes' : 'Create Member'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={Boolean(deleteConfirm)}
        title="Delete Team Member"
        message={`Are you sure you want to delete ${deleteConfirm?.full_name || 'this team member'}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={submitting}
      />
    </div>
  );
}
