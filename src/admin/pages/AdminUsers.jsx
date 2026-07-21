import { useEffect, useMemo, useState } from 'react';
import { Eye, Edit3, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { PageHeader, FilterBar, Modal, EmptyState, LoadingSpinner, StatusBadge } from '../components';
import { FormInput } from '../components/FormField';
import { adminUserService } from '../services/adminUserService';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useToast } from '../contexts/ToastContext';

const PAGE_SIZE = 10;
const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'Super Admin', label: 'Super Admin' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Editor', label: 'Editor' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

export default function AdminUsers() {
  const { profile } = useAdminAuth();
  const { addToast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewAdmin, setViewAdmin] = useState(null);
  const [editAdmin, setEditAdmin] = useState(null);
  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isSuperAdmin = profile?.role === 'Super Admin';

  const loadAdmins = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await adminUserService.getAdmins();
      if (result.success) {
        setAdmins(result.data || []);
      } else {
        setError(result.error?.message || 'Unable to load administrators.');
        setAdmins([]);
      }
    } catch (err) {
      setError(err?.message || 'Unable to load administrators.');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const filteredAdmins = useMemo(() => {
    let list = admins;

    if (search.trim()) {
      const normalized = search.trim().toLowerCase();
      list = list.filter((item) =>
        [item.first_name, item.last_name, item.email, item.department]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalized))
      );
    }

    if (roleFilter) {
      list = list.filter((item) => item.role === roleFilter);
    }

    if (statusFilter) {
      list = list.filter((item) => item.status === statusFilter);
    }

    return list;
  }, [admins, search, roleFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredAdmins.length / PAGE_SIZE));
  const pagedAdmins = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAdmins.slice(start, start + PAGE_SIZE);
  }, [filteredAdmins, page]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  const handleFilterChange = (key, value) => {
    if (key === 'search') setSearch(value);
    if (key === 'role') setRoleFilter(value);
    if (key === 'status') setStatusFilter(value);
  };

  const openViewModal = (admin) => setViewAdmin(admin);
  const closeViewModal = () => setViewAdmin(null);

  const openEditModal = (admin) => {
    setEditAdmin(admin);
    setEditValues({
      first_name: admin.first_name || '',
      last_name: admin.last_name || '',
      phone: admin.phone || '',
      department: admin.department || '',
      job_title: admin.job_title || '',
      role: admin.role || '',
      active: Boolean(admin.active),
    });
  };

  const closeEditModal = () => {
    setEditAdmin(null);
    setEditValues({});
  };

  const openDeleteModal = (admin) => setDeleteAdmin(admin);
  const closeDeleteModal = () => setDeleteAdmin(null);

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveAdmin = async (event) => {
    event.preventDefault();
    if (!editAdmin) return;

    setSaving(true);
    try {
      const result = await adminUserService.updateAdmin(editAdmin.id, {
        first_name: editValues.first_name,
        last_name: editValues.last_name,
        phone: editValues.phone,
        department: editValues.department,
        job_title: editValues.job_title,
        role: editValues.role,
        active: editValues.active,
      });

      if (!result.success) {
        addToast(result.error?.message || 'Unable to update administrator.', 'error');
        return;
      }

      setAdmins((current) => current.map((item) => (item.id === editAdmin.id ? result.data : item)));
      addToast('Administrator updated successfully.', 'success');
      closeEditModal();
    } catch (err) {
      addToast(err?.message || 'Unable to update administrator.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (admin) => {
    setRefreshing(true);
    try {
      const result = await adminUserService.activateAdmin(admin.id);
      if (!result.success) {
        addToast(result.error?.message || 'Unable to activate administrator.', 'error');
        return;
      }
      setAdmins((current) => current.map((item) => (item.id === admin.id ? result.data : item)));
      addToast('Administrator activated.', 'success');
    } catch (err) {
      addToast(err?.message || 'Unable to activate administrator.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeactivate = async (admin) => {
    setRefreshing(true);
    try {
      const result = await adminUserService.deactivateAdmin(admin.id);
      if (!result.success) {
        addToast(result.error?.message || 'Unable to deactivate administrator.', 'error');
        return;
      }
      setAdmins((current) => current.map((item) => (item.id === admin.id ? result.data : item)));
      addToast('Administrator deactivated.', 'success');
    } catch (err) {
      addToast(err?.message || 'Unable to deactivate administrator.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteAdmin) return;
    setDeleting(true);

    try {
      const result = await adminUserService.deleteAdmin(deleteAdmin.id);
      if (!result.success) {
        addToast(result.error?.message || 'Unable to delete administrator.', 'error');
        return;
      }
      setAdmins((current) => current.filter((item) => item.id !== deleteAdmin.id));
      addToast('Administrator deleted successfully.', 'success');
      closeDeleteModal();
    } catch (err) {
      addToast(err?.message || 'Unable to delete administrator.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filterDefinitions = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      value: search,
      placeholder: 'Search name, email, department',
    },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      value: roleFilter,
      options: ROLE_OPTIONS,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: statusFilter,
      options: STATUS_OPTIONS,
    },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <PageHeader title="Admin Users" subtitle="Manage user access and admin accounts." />

      <FilterBar filters={filterDefinitions} onFilterChange={handleFilterChange} onReset={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); }} />

      {loading ? (
        <div className="rounded-3xl border border-gray-700 bg-gray-900 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading administrators..." />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-700 bg-red-950 p-6 text-red-200">
          <p className="font-semibold">Unable to load administrators</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No administrators found"
          description="Try adjusting your search or filters to find administrators."
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-gray-700 bg-gray-900 shadow-sm">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Photo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">First Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Last Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Created At</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {pagedAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-800 transition">
                  <td className="px-4 py-4">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-700">
                      {admin.profile_photo ? (
                        <img src={admin.profile_photo} alt={`${admin.first_name} avatar`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-300">{(admin.first_name || '?').slice(0, 1)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-100">{admin.first_name || '—'}</td>
                  <td className="px-4 py-4 text-sm text-gray-100">{admin.last_name || '—'}</td>
                  <td className="px-4 py-4 text-sm text-gray-300 break-words max-w-[12rem]">{admin.email || '—'}</td>
                  <td className="px-4 py-4 text-sm text-gray-100">{admin.role || '—'}</td>
                  <td className="px-4 py-4 text-sm text-gray-100">{admin.department || '—'}</td>
                  <td className="px-4 py-4"><StatusBadge status={(admin.status || 'Inactive').toLowerCase()} /></td>
                  <td className="px-4 py-4 text-sm text-gray-300">{formatDate(admin.last_login)}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{formatDate(admin.created_at)}</td>
                  <td className="px-4 py-4 text-sm text-gray-300 space-y-2">
                    <button onClick={() => openViewModal(admin)} className="flex items-center gap-2 w-full rounded-lg border border-blue-600 px-3 py-2 text-blue-200 hover:bg-blue-700/10 transition">
                      <Eye size={16} /> View
                    </button>
                    {isSuperAdmin ? (
                      <>
                        <button onClick={() => openEditModal(admin)} className="flex items-center gap-2 w-full rounded-lg border border-amber-600 px-3 py-2 text-amber-200 hover:bg-amber-700/10 transition">
                          <Edit3 size={16} /> Edit
                        </button>
                        {admin.active ? (
                          <button onClick={() => handleDeactivate(admin)} className="flex items-center gap-2 w-full rounded-lg border border-yellow-600 px-3 py-2 text-yellow-200 hover:bg-yellow-700/10 transition">
                            <XCircle2 size={16} /> Deactivate
                          </button>
                        ) : (
                          <button onClick={() => handleActivate(admin)} className="flex items-center gap-2 w-full rounded-lg border border-green-600 px-3 py-2 text-green-200 hover:bg-green-700/10 transition">
                            <CheckCircle2 size={16} /> Activate
                          </button>
                        )}
                        <button onClick={() => openDeleteModal(admin)} className="flex items-center gap-2 w-full rounded-lg border border-red-600 px-3 py-2 text-red-200 hover:bg-red-700/10 transition">
                          <Trash2 size={16} /> Delete
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-400">Showing {pagedAdmins.length} of {filteredAdmins.length} administrators</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">Page {page} of {pageCount}</span>
          <button
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            disabled={page === pageCount}
            className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <Modal isOpen={Boolean(viewAdmin)} onClose={closeViewModal} title="View Administrator" size="lg">
        {viewAdmin && (
          <div className="space-y-4 text-sm text-gray-200">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-gray-300">First Name</p>
                <p>{viewAdmin.first_name || '—'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-300">Last Name</p>
                <p>{viewAdmin.last_name || '—'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-300">Email</p>
                <p>{viewAdmin.email || '—'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-300">Role</p>
                <p>{viewAdmin.role || '—'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-300">Department</p>
                <p>{viewAdmin.department || '—'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-300">Job Title</p>
                <p>{viewAdmin.job_title || '—'}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-300">Status</p>
                <StatusBadge status={(viewAdmin.status || 'Inactive').toLowerCase()} />
              </div>
              <div>
                <p className="font-semibold text-gray-300">Active</p>
                <p>{viewAdmin.active ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-gray-300">Last Login</p>
                <p>{formatDate(viewAdmin.last_login)}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-300">Created At</p>
                <p>{formatDate(viewAdmin.created_at)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={Boolean(editAdmin)} onClose={closeEditModal} title="Edit Administrator" size="lg">
        {editAdmin && (
          <form onSubmit={handleSaveAdmin} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput label="First Name" name="first_name" value={editValues.first_name} onChange={handleEditChange} required />
              <FormInput label="Last Name" name="last_name" value={editValues.last_name} onChange={handleEditChange} required />
              <FormInput label="Phone" name="phone" value={editValues.phone} onChange={handleEditChange} />
              <FormInput label="Department" name="department" value={editValues.department} onChange={handleEditChange} />
              <FormInput label="Job Title" name="job_title" value={editValues.job_title} onChange={handleEditChange} />
              <FormInput label="Role" name="role" value={editValues.role} onChange={handleEditChange} />
            </div>
            <label className="flex items-center gap-3 text-sm text-gray-200">
              <input type="checkbox" name="active" checked={editValues.active} onChange={handleEditChange} className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-600" />
              Active
            </label>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={closeEditModal} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 transition">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={Boolean(deleteAdmin)} onClose={closeDeleteModal} title="Delete Administrator" size="md">
        {deleteAdmin && (
          <div className="space-y-4 text-sm text-gray-200">
            <p>Are you sure you want to delete <strong>{deleteAdmin.first_name} {deleteAdmin.last_name}</strong>?</p>
            <p className="text-gray-400">This will remove the administrator from the admin users table only.</p>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={closeDeleteModal} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 transition">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteAdmin} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
