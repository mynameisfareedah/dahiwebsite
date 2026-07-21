import React, { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
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
import { FormInput, FormSelect } from '../components/FormField';
import { validators, validateForm } from '../utils/validation';
import { GENERAL_STATUS } from '../../constants/status';
import { sponsorService } from '../services/sponsorService';

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();
  const { searchQuery, setSearchQuery, filtered: searchedSponsors } = useSearch(
    sponsors,
    ['name', 'contact', 'type']
  );
  const { sorted: sortedSponsors } = useSorting(searchedSponsors);
  const { currentItems, currentPage, totalPages, goToPage } = usePagination(
    sortedSponsors,
    10
  );

  const totalFunding = sponsors.reduce((sum, s) => sum + (s.amount || 0), 0);
  const activeSponsors = sponsors.filter((s) => s.status === 'active').length;

  const formRules = {
    name: [
      (val) => validators.required(val, 'Sponsor name'),
      (val) => validators.minLength(val, 2, 'Name'),
    ],
    amount: [(val) => validators.required(val, 'Amount')],
    type: [(val) => validators.required(val, 'Sponsor type')],
    contact: [(val) => validators.email(val)],
  };

  const initialFormValues = editingId
    ? sponsors.find((s) => s.id === editingId)
    : {
        name: '',
        amount: '',
        type: 'Grant',
        contact: '',
        status: GENERAL_STATUS.PENDING,
      };

  const isMountedRef = React.useRef(true);
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load sponsors from Supabase
  useEffect(() => {
    const loadSponsors = async () => {
      setIsFetching(true);
      setFetchError(null);
      try {
        const result = await sponsorService.getSponsors();
        if (!isMountedRef.current) return;
        
        if (result.success) {
          setSponsors(result.data || []);
        } else {
          setFetchError(result.error?.message || 'Failed to load sponsors');
          setSponsors([]);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setFetchError(err.message || 'An error occurred while loading sponsors');
          setSponsors([]);
        }
      } finally {
        if (isMountedRef.current) {
          setIsFetching(false);
        }
      }
    };

    loadSponsors();
  }, []);

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

    if (!isMountedRef.current) return;

    if (editingId) {
      setSponsors(
        sponsors.map((s) => (s.id === editingId ? { ...s, ...formValues } : s))
      );
      addToast('Sponsor updated successfully', 'success');
    } else {
      const newSponsor = {
        ...formValues,
        amount: Number(formValues.amount),
        id: Math.max(...sponsors.map((s) => s.id), 0) + 1,
        date: new Date().toISOString().split('T')[0],
      };
      setSponsors([...sponsors, newSponsor]);
      addToast('Sponsor added successfully', 'success');
    }

    setShowForm(false);
    setEditingId(null);
    resetForm();
    setIsLoading(false);
  }, (values) => validateForm(values, formRules));

  const handleEdit = (sponsor) => {
    setEditingId(sponsor.id);
    setShowForm(true);
  };

  const handleDelete = (sponsor) => {
    setDeleteConfirm({ id: sponsor.id, name: sponsor.name });
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const result = await sponsorService.deleteSponsor(deleteConfirm.id);
      if (!isMountedRef.current) return;
      
      if (result.success) {
        setSponsors(sponsors.filter((s) => s.id !== deleteConfirm.id));
        addToast('Sponsor removed successfully', 'success');
      } else {
        addToast(`Error removing sponsor: ${result.error?.message || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      if (isMountedRef.current) {
        addToast(`Error removing sponsor: ${err.message || 'Unknown error'}`, 'error');
      }
    } finally {
      if (isMountedRef.current) {
        setDeleteConfirm(null);
        setIsLoading(false);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sponsors & Funding"
        subtitle="Manage sponsor relationships and funding"
        action={() => setShowForm(true)}
        actionLabel="Add Sponsor"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Sponsors</p>
          <p className="text-2xl font-bold text-white mt-2">{sponsors.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {activeSponsors}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Funding</p>
          <p className="text-2xl font-bold text-blue-400 mt-2">
            ${(totalFunding / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      <SearchBar
        placeholder="Search sponsors by name, type..."
        value={searchQuery}
        onSearch={setSearchQuery}
      />

      {currentItems.length === 0 && searchQuery === '' ? (
        <EmptyState
          icon={Gift}
          title="No sponsors yet"
          description="Add your first sponsor to get started"
          action={() => setShowForm(true)}
          actionLabel="Add Sponsor"
        />
      ) : currentItems.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No sponsors found"
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
                      Sponsor Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                      Amount
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
                  {currentItems.map((sponsor) => (
                    <tr
                      key={sponsor.id}
                      className="hover:bg-gray-800 transition"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{sponsor.name}</p>
                        <p className="text-xs text-gray-400">
                          {sponsor.contact}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-indigo-900 text-indigo-100 rounded-full text-sm">
                          {sponsor.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-green-400">
                        ${sponsor.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sponsor.status} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(sponsor)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(sponsor)}
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
              totalItems={sortedSponsors.length}
            />
          </div>
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingId ? 'Edit Sponsor' : 'Add Sponsor'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <FormInput
            label="Sponsor Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : null}
            required
          />

          <FormInput
            label="Contact Email"
            type="email"
            name="contact"
            value={values.contact}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.contact ? errors.contact : null}
            required
          />

          <FormSelect
            label="Sponsor Type"
            name="type"
            value={values.type}
            onChange={handleChange}
            required
          >
            <option value="Grant">Grant</option>
            <option value="Donation">Donation</option>
            <option value="Sponsorship">Sponsorship</option>
          </FormSelect>

          <FormInput
            label="Amount ($)"
            type="number"
            name="amount"
            value={values.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.amount ? errors.amount : null}
            required
          />

          <FormSelect
            label="Status"
            name="status"
            value={values.status}
            onChange={handleChange}
          >
            <option value={GENERAL_STATUS.PENDING}>Pending</option>
            <option value={GENERAL_STATUS.ACTIVE}>Active</option>
            <option value={GENERAL_STATUS.INACTIVE}>Inactive</option>
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
              {editingId ? 'Update Sponsor' : 'Add Sponsor'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        title="Remove Sponsor"
        message={`Are you sure you want to remove "${deleteConfirm?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={isLoading}
      />
    </div>
  );
}
