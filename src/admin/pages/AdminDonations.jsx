import React, { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import {
  PageHeader,
  ConfirmDeleteModal,
  EmptyState,
  SearchBar,
  Pagination,
} from '../components';
import {
  usePagination,
  useSearch,
  useSorting,
  useToast,
  useForm,
} from '../hooks/useDataManagement';
import { donationService } from '../services/donationService';

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();
  const { searchQuery, setSearchQuery, filtered: searched } = useSearch(donations, ['title', 'description']);
  const { sorted: sortedDonations } = useSorting(searched);
  const { currentItems, currentPage, totalPages, goToPage } = usePagination(sortedDonations, 10);

  const isMountedRef = React.useRef(true);
  React.useEffect(() => () => { isMountedRef.current = false; }, []);

  useEffect(() => {
    const load = async () => {
      setIsFetching(true);
      setFetchError(null);
      try {
        const result = await donationService.getDonations();
        if (!isMountedRef.current) return;
        if (result.success) setDonations(result.data || []);
        else { setFetchError(result.error?.message || 'Failed to load donations'); setDonations([]); }
      } catch (err) {
        if (isMountedRef.current) { setFetchError(err.message || 'Error loading donations'); setDonations([]); }
      } finally { if (isMountedRef.current) setIsFetching(false); }
    };
    load();
  }, []);

  const formRules = {
    title: [(val) => (val ? null : 'Title is required')],
    slug: [],
  };

  const initialFormValues = editingId
    ? donations.find((d) => d.id === editingId)
    : { title: '', slug: '', description: '', image_url: '', goal_amount: 0, amount_raised: 0, currency: 'NGN', start_date: '', end_date: '', featured: false, active: true, display_order: 0 };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useForm(initialFormValues, async (formValues) => {
    setIsLoading(true);
    try {
      if (editingId) {
        const res = await donationService.updateDonation(editingId, formValues);
        if (res.success) {
          setDonations(donations.map((d) => (d.id === editingId ? res.data : d)));
          addToast('Donation updated successfully', 'success');
        } else addToast(res.error?.message || 'Failed to update', 'error');
      } else {
        const res = await donationService.createDonation(formValues);
        if (res.success) {
          setDonations([res.data, ...donations]);
          addToast('Donation created', 'success');
        } else addToast(res.error?.message || 'Failed to create', 'error');
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } finally { setIsLoading(false); }
  }, (vals) => {
    const errs = {};
    if (!vals.title) errs.title = 'Title is required';
    return errs;
  });

  const handleEdit = (donation) => { setEditingId(donation.id); setShowForm(true); };
  const handleDelete = (donation) => setDeleteConfirm({ id: donation.id, title: donation.title });

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const res = await donationService.deleteDonation(deleteConfirm.id);
      if (res.success) { setDonations(donations.filter((d) => d.id !== deleteConfirm.id)); addToast('Donation removed', 'success'); }
      else addToast(res.error?.message || 'Failed to remove', 'error');
    } catch (err) { addToast(err.message || 'Error removing', 'error'); }
    finally { setDeleteConfirm(null); setIsLoading(false); }
  };

  const toggleActive = async (donation) => {
    setIsLoading(true);
    try {
      const res = await donationService.updateDonation(donation.id, { active: !donation.active });
      if (res.success) setDonations(donations.map((d) => (d.id === donation.id ? res.data : d)));
    } catch (err) { addToast(err.message || 'Error toggling', 'error'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Donations" subtitle="Manage donation campaigns" action={() => { setShowForm(true); resetForm(); }} actionLabel="Add Donation" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Campaigns</p>
          <p className="text-2xl font-bold text-white mt-2">{donations.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-400 mt-2">{donations.filter((d) => d.active).length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Featured</p>
          <p className="text-2xl font-bold text-white mt-2">{donations.filter((d) => d.featured).length}</p>
        </div>
      </div>

      <SearchBar placeholder="Search donations..." value={searchQuery} onSearch={setSearchQuery} />

      {currentItems.length === 0 && searchQuery === '' ? (
        <EmptyState icon={Gift} title="No donation campaigns" description="Add your first donation campaign to get started" action={() => { setShowForm(true); resetForm(); }} actionLabel="Add Donation" />
      ) : currentItems.length === 0 ? (
        <EmptyState icon={Gift} title="No campaigns found" description="Try adjusting your search" />
      ) : (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Goal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Raised</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentItems.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-800 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{d.title}</p>
                        <p className="text-xs text-gray-400">{d.slug}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-green-400">{d.goal_amount ? `${d.currency || 'NGN'} ${Number(d.goal_amount).toLocaleString()}` : '-'}</td>
                      <td className="px-6 py-4 font-medium text-white">{d.amount_raised ? `${d.currency || 'NGN'} ${Number(d.amount_raised).toLocaleString()}` : '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${d.active ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'}`}>{d.active ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(d)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">Edit</button>
                          <button onClick={() => handleDelete(d)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
                          <button onClick={() => toggleActive(d)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded">Toggle</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} itemsPerPage={10} totalItems={sortedDonations.length} />
          </div>
        </>
      )}

      <ConfirmDeleteModal isOpen={!!deleteConfirm} title="Remove Donation" message={`Are you sure you want to remove "${deleteConfirm?.title}"? This action cannot be undone.`} onConfirm={confirmDelete} onCancel={() => setDeleteConfirm(null)} isLoading={isLoading} />

      {/* Modal form inline to avoid adding many new components; reuse existing useForm handlers */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-2xl w-full rounded-lg bg-white p-6">
            <h3 className="text-xl font-bold">{editingId ? 'Edit Donation' : 'Add Donation'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <label className="block">
                <div className="text-sm font-medium">Title</div>
                <input name="title" value={values.title || ''} onChange={handleChange} onBlur={handleBlur} className="w-full rounded-full border px-4 py-2" required />
              </label>
              <label className="block">
                <div className="text-sm font-medium">Slug</div>
                <input name="slug" value={values.slug || ''} onChange={handleChange} onBlur={handleBlur} className="w-full rounded-full border px-4 py-2" />
              </label>
              <label className="block">
                <div className="text-sm font-medium">Description</div>
                <textarea name="description" value={values.description || ''} onChange={handleChange} onBlur={handleBlur} className="w-full rounded-[1rem] border px-4 py-2" rows="4" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm font-medium">Goal Amount</div>
                  <input type="number" name="goal_amount" value={values.goal_amount ?? 0} onChange={handleChange} onBlur={handleBlur} className="w-full rounded-full border px-4 py-2" />
                </label>
                <label className="block">
                  <div className="text-sm font-medium">Amount Raised</div>
                  <input type="number" name="amount_raised" value={values.amount_raised ?? 0} onChange={handleChange} onBlur={handleBlur} className="w-full rounded-full border px-4 py-2" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm font-medium">Currency</div>
                  <input name="currency" value={values.currency || 'NGN'} onChange={handleChange} className="w-full rounded-full border px-4 py-2" />
                </label>
                <label className="block">
                  <div className="text-sm font-medium">Display Order</div>
                  <input type="number" name="display_order" value={values.display_order ?? 0} onChange={handleChange} className="w-full rounded-full border px-4 py-2" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm font-medium">Start Date</div>
                  <input type="date" name="start_date" value={values.start_date || ''} onChange={handleChange} className="w-full rounded-full border px-4 py-2" />
                </label>
                <label className="block">
                  <div className="text-sm font-medium">End Date</div>
                  <input type="date" name="end_date" value={values.end_date || ''} onChange={handleChange} className="w-full rounded-full border px-4 py-2" />
                </label>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" name="featured" checked={!!values.featured} onChange={handleChange} /> Featured</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="active" checked={!!values.active} onChange={handleChange} /> Active</label>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">{isSubmitting ? 'Saving...' : editingId ? 'Update Donation' : 'Add Donation'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
