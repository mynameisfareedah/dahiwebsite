import { useEffect, useState } from 'react';
import { Edit2, Image as ImageIcon, Plus, Trash2, Users } from 'lucide-react';
import { EmptyState, LoadingSpinner, Modal, PageHeader, StatusBadge, ConfirmDeleteModal } from '../components';
import { useToast } from '../contexts/ToastContext';
import { teamMemberService } from '../services/teamMemberService';
import TeamMemberForm, { EMPTY_TEAM_MEMBER } from './TeamMemberForm';

function getMemberName(member) {
  return member.full_name || member.name || 'Unnamed team member';
}

function getMemberImage(member) {
  return member.profile_image || member.photo_url || '';
}

function normalizeValues(member) {
  return {
    ...EMPTY_TEAM_MEMBER,
    full_name: getMemberName(member) === 'Unnamed team member' ? '' : getMemberName(member),
    role: member.role || '',
    bio: member.bio || '',
    profile_image: getMemberImage(member),
    email: member.email || '',
    linkedin_url: member.linkedin_url || '',
    display_order: member.display_order ?? 0,
    featured: Boolean(member.featured),
    active: member.active !== false,
  };
}

export default function TeamMembersPage() {
  const { addToast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_TEAM_MEMBER);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingMember, setDeletingMember] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    const result = await teamMemberService.getTeamMembers();
    if (result.success) {
      setMembers(result.data || []);
    } else {
      addToast(result.error?.message || 'Unable to load team members.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const openCreate = () => {
    setEditingMember(null);
    setFormValues(EMPTY_TEAM_MEMBER);
    setProfileImageFile(null);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (member) => {
    setEditingMember(member);
    setFormValues(normalizeValues(member));
    setProfileImageFile(null);
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditingMember(null);
    setProfileImageFile(null);
    setFormError('');
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      let profileImage = formValues.profile_image || null;
      if (profileImageFile) {
        const uploadResult = await teamMemberService.uploadProfileImage(profileImageFile);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error?.message || 'Unable to upload profile image.');
        }
        profileImage = uploadResult.data.publicUrl;
      }

      const payload = {
        full_name: formValues.full_name.trim(),
        role: formValues.role.trim(),
        bio: formValues.bio.trim() || null,
        profile_image: profileImage,
        email: formValues.email.trim() || null,
        linkedin_url: formValues.linkedin_url.trim() || null,
        display_order: Number(formValues.display_order) || 0,
        featured: Boolean(formValues.featured),
        active: Boolean(formValues.active),
      };

      if (!payload.full_name || !payload.role) {
        throw new Error('Full name and role are required.');
      }

      const result = editingMember
        ? await teamMemberService.updateTeamMember(editingMember.id, payload)
        : await teamMemberService.createTeamMember(payload);

      if (!result.success) {
        throw new Error(result.error?.message || 'Unable to save team member.');
      }

      addToast(editingMember ? 'Team member updated.' : 'Team member added.');
      setFormOpen(false);
      await loadMembers();
    } catch (error) {
      setFormError(error.message || 'Unable to save team member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (member) => {
    const result = await teamMemberService.updateTeamMember(member.id, { active: member.active === false });
    if (!result.success) {
      addToast(result.error?.message || 'Unable to update member status.', 'error');
      return;
    }
    setMembers((current) => current.map((item) => (item.id === member.id ? result.data : item)));
    addToast(result.data.active ? 'Team member activated.' : 'Team member hidden.');
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    setDeleting(true);
    const result = await teamMemberService.deleteTeamMember(deletingMember.id);
    if (!result.success) {
      addToast(result.error?.message || 'Unable to delete team member.', 'error');
    } else {
      setMembers((current) => current.filter((member) => member.id !== deletingMember.id));
      addToast('Team member deleted.');
    }
    setDeleting(false);
    setDeletingMember(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Team Members" subtitle="Manage the people shown in the public DAHI team sections." action={openCreate} actionLabel="Add Team Member" />

      {loading ? (
        <div className="flex justify-center rounded-lg border border-gray-800 bg-gray-900 p-12"><LoadingSpinner size="lg" text="Loading team members..." /></div>
      ) : members.length === 0 ? (
        <EmptyState icon={Users} title="No team members yet" description="Add your first team member to get started." action={openCreate} actionLabel="Add Team Member" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-gray-700 bg-gray-800">
                <tr>
                  {['Photo', 'Name', 'Role', 'Status', 'Display Order', 'Actions'].map((heading) => <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">{heading}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {members.map((member) => {
                  const name = getMemberName(member);
                  const image = getMemberImage(member);
                  return (
                    <tr key={member.id} className="transition hover:bg-gray-800">
                      <td className="px-6 py-4">
                        {image ? <img src={image} alt="" className="h-11 w-11 rounded-full object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-900 text-blue-200"><ImageIcon size={18} /></div>}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{name}</td>
                      <td className="px-6 py-4 text-gray-300">{member.role || '—'}</td>
                      <td className="px-6 py-4"><button type="button" onClick={() => handleToggleActive(member)} title="Toggle public visibility"><StatusBadge status={member.active === false ? 'inactive' : 'active'} /></button></td>
                      <td className="px-6 py-4 text-gray-300">{member.display_order ?? 0}</td>
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><button type="button" onClick={() => openEdit(member)} className="text-amber-400 transition hover:text-amber-300" aria-label={`Edit ${name}`}><Edit2 size={17} /></button><button type="button" onClick={() => setDeletingMember(member)} className="text-red-400 transition hover:text-red-300" aria-label={`Delete ${name}`}><Trash2 size={17} /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={formOpen} onClose={closeForm} title={editingMember ? 'Edit Team Member' : 'Add Team Member'} size="lg">
        <TeamMemberForm values={formValues} onChange={handleChange} onImageChange={setProfileImageFile} onImageError={setFormError} onSubmit={handleSubmit} onCancel={closeForm} isEditing={Boolean(editingMember)} isSubmitting={submitting} error={formError} />
      </Modal>

      <ConfirmDeleteModal isOpen={Boolean(deletingMember)} title="Delete Team Member" message={`Are you sure you want to delete ${deletingMember ? getMemberName(deletingMember) : 'this team member'}?`} onConfirm={handleDelete} onCancel={() => setDeletingMember(null)} isLoading={deleting} />
    </div>
  );
}
