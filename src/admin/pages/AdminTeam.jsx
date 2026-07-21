import React, { useEffect, useState } from 'react';
import { Users, Mail } from 'lucide-react';
import { PageHeader, StatusBadge, Modal, EmptyState, LoadingSpinner } from '../components';
import { FormInput, FormSelect, FormTextarea } from '../components/FormField';
import { teamMemberService } from '../services/teamMemberService';
import { TEAM_MEMBER_STATUS } from '../../constants/status';

const EMPTY_FORM_VALUES = {
  name: '',
  role: '',
  department: 'Leadership',
  bio: '',
  email: '',
  linkedin_url: '',
  display_order: 0,
  active: true,
  status: TEAM_MEMBER_STATUS.ACTIVE,
};

function normalizeFormValues(values) {
  return {
    ...values,
    display_order: Number(values.display_order || 0),
    active: true,
  };
}

export default function AdminTeam() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_FORM_VALUES);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTeamMembers = async () => {
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
    };

    loadTeamMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  const openCreateForm = () => {
    setEditingMember(null);
    setFormValues(EMPTY_FORM_VALUES);
    setShowForm(true);
  };

  const openEditForm = (member) => {
    setEditingMember(member);
    setFormValues({
      name: member.name || '',
      role: member.role || '',
      department: member.department || 'Leadership',
      bio: member.bio || '',
      email: member.email || '',
      linkedin_url: member.linkedin_url || '',
      display_order: member.display_order ?? 0,
      active: true,
      status: member.status || TEAM_MEMBER_STATUS.ACTIVE,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMember(null);
    setFormValues(EMPTY_FORM_VALUES);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = normalizeFormValues(formValues);
      const result = editingMember
        ? await teamMemberService.updateTeamMember(editingMember.id, payload)
        : await teamMemberService.createTeamMember(payload);

      if (!result.success) {
        setError(result.error?.message || 'Failed to save team member.');
        return;
      }

      if (editingMember) {
        setTeamMembers((current) => current.map((member) => (member.id === editingMember.id ? result.data : member)));
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

  const handleDelete = async (member) => {
    if (!window.confirm(`Delete ${member.name}?`)) {
      return;
    }

    try {
      const result = await teamMemberService.deleteTeamMember(member.id);
      if (!result.success) {
        setError(result.error?.message || 'Failed to delete team member.');
        return;
      }

      setTeamMembers((current) => current.filter((item) => item.id !== member.id));
    } catch (err) {
      setError(err?.message || 'Failed to delete team member.');
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await teamMemberService.getTeamMembers();
      if (result.success) {
        setTeamMembers(result.data || []);
      } else {
        setError(result.error?.message || 'Failed to refresh team members.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to refresh team members.');
    } finally {
      setLoading(false);
    }
  };

  const renderedMembers = teamMembers;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Management"
        subtitle="Manage team members and staff"
        action={openCreateForm}
        actionLabel="Add Team Member"
      />

      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded transition"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading team members..." />
        </div>
      ) : error ? (
        <div className="bg-red-950 border border-red-800 rounded-lg p-6 text-red-200">
          <p className="font-medium">Unable to load team members.</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : renderedMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Add your first team member to get started"
          action={openCreateForm}
          actionLabel="Add Team Member"
        />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {renderedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-800 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{member.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail size={16} />
                        {member.email || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{member.role}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-900 text-purple-100 rounded-full text-sm">
                        {member.department || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={member.status || TEAM_MEMBER_STATUS.ACTIVE} /></td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => openEditForm(member)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition">Edit</button>
                        <button onClick={() => handleDelete(member)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showForm} onClose={closeForm} title={editingMember ? 'Edit Team Member' : 'Add Team Member'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Full Name" name="name" value={formValues.name} onChange={handleChange} required />
          <FormInput label="Email" type="email" name="email" value={formValues.email} onChange={handleChange} required />
          <FormInput label="Role" name="role" value={formValues.role} onChange={handleChange} required />
          <FormSelect label="Department" name="department" value={formValues.department} onChange={handleChange}>
            <option value="Leadership">Leadership</option>
            <option value="Programs">Programs</option>
            <option value="Education">Education</option>
            <option value="Operations">Operations</option>
            <option value="Communications">Communications</option>
            <option value="Finance">Finance</option>
          </FormSelect>
          <FormTextarea label="Bio" name="bio" value={formValues.bio} onChange={handleChange} rows="3" />
          <FormInput label="LinkedIn URL" name="linkedin_url" value={formValues.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
          <FormInput label="Display Order" name="display_order" type="number" value={formValues.display_order} onChange={handleChange} />
          <FormSelect label="Status" name="status" value={formValues.status} onChange={handleChange}>
            <option value={TEAM_MEMBER_STATUS.ACTIVE}>Active</option>
            <option value={TEAM_MEMBER_STATUS.INACTIVE}>Inactive</option>
            <option value="archived">Archived</option>
          </FormSelect>
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button type="button" onClick={closeForm} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50">
              {submitting ? 'Saving...' : editingMember ? 'Save Changes' : 'Create Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
