import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  FilterBar,
  EmptyState,
  Pagination,
  StatusBadge,
  Modal,
  LoadingSpinner,
} from '../components';
import { usePagination, useSearch, useSorting, useToast } from '../hooks/useDataManagement';
import { volunteerService } from '../services/volunteerService';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function AdminVolunteerApplications() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const { addToast } = useToast();
  const { searchQuery, setSearchQuery, filtered: searchedApplications } = useSearch(
    applications,
    ['full_name', 'email', 'occupation', 'interest', 'skills']
  );

  const filteredApplications = searchedApplications.filter((application) => {
    if (!statusFilter) return true;
    return application.status === statusFilter;
  });

  const { sorted: sortedApplications } = useSorting(filteredApplications);
  const { currentItems, currentPage, totalPages, goToPage } = usePagination(
    sortedApplications,
    10
  );

  const totalApplications = applications.length;
  const pendingCount = applications.filter((app) => app.status === 'Pending').length;
  const approvedCount = applications.filter((app) => app.status === 'Approved').length;
  const rejectedCount = applications.filter((app) => app.status === 'Rejected').length;

  useEffect(() => {
    const loadApplications = async () => {
      setIsFetching(true);
      setFetchError(null);

      try {
        const result = await volunteerService.getVolunteerApplications();
        if (result.success) {
          setApplications(result.data || []);
        } else {
          setFetchError(result.error?.message || 'Failed to load volunteer applications.');
          setApplications([]);
        }
      } catch (error) {
        setFetchError(error.message || 'Failed to load volunteer applications.');
        setApplications([]);
      } finally {
        setIsFetching(false);
      }
    };

    loadApplications();
  }, []);

  const updateApplicationStatus = (id, status) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
  };

  const handleApprove = async (application) => {
    setIsSubmitting(true);
    try {
      const result = await volunteerService.approveVolunteerApplication(application);
      if (result.success) {
        updateApplicationStatus(application.id, 'Approved');
        addToast('Application approved and volunteer record created.', 'success');
      } else {
        addToast(result.error?.message || 'Failed to approve application.', 'error');
      }
    } catch (error) {
      addToast(error.message || 'Failed to approve application.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRejectModal = (application) => {
    setSelectedApplication(application);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedApplication) return;

    setIsSubmitting(true);
    try {
      const result = await volunteerService.rejectVolunteerApplication(selectedApplication.id);
      if (result.success) {
        updateApplicationStatus(selectedApplication.id, 'Rejected');
        addToast('Application rejected successfully.', 'success');
        setRejectModalOpen(false);
        setSelectedApplication(null);
      } else {
        addToast(result.error?.message || 'Failed to reject application.', 'error');
      }
    } catch (error) {
      addToast(error.message || 'Failed to reject application.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === 'status') {
      setStatusFilter(value);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Applications"
        subtitle="Review public volunteer applications, then approve or reject applicants."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">Total Applications</p>
          <p className="mt-3 text-3xl font-semibold text-white">{totalApplications}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">Pending</p>
          <p className="mt-3 text-3xl font-semibold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">Approved</p>
          <p className="mt-3 text-3xl font-semibold text-green-400">{approvedCount}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">Rejected</p>
          <p className="mt-3 text-3xl font-semibold text-red-400">{rejectedCount}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <SearchBar
          placeholder="Search applicants by name, email, occupation..."
          value={searchQuery}
          onSearch={setSearchQuery}
        />
        <FilterBar
          filters={[
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              value: statusFilter,
              options: STATUS_OPTIONS,
            },
          ]}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {isFetching ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <LoadingSpinner text="Loading volunteer applications..." />
        </div>
      ) : fetchError ? (
        <div className="rounded-lg border border-red-700 bg-red-900 p-6">
          <p className="text-red-200">{fetchError}</p>
        </div>
      ) : currentItems.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No volunteer applications"
          description="No applications match the current search or filter."
        />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Occupation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Availability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentItems.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-800 transition">
                    <td className="px-6 py-4 text-sm text-white">{application.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{application.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{application.occupation || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{application.availability || '—'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={(application.status || 'Pending').toLowerCase()} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatDate(application.created_at)}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleApprove(application)}
                          disabled={isSubmitting || application.status !== 'Pending'}
                          className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(application)}
                          disabled={application.status !== 'Pending'}
                          className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                        >
                          Reject
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
            totalItems={sortedApplications.length}
          />
        </div>
      )}

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Volunteer Application"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Are you sure you want to reject this volunteer application? This action will update the application status to Rejected.
          </p>
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm font-semibold text-white">Applicant</p>
            <p className="text-gray-300">{selectedApplication?.full_name}</p>
            <p className="text-gray-300">{selectedApplication?.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="flex-1 rounded-full border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Rejecting...' : 'Reject Application'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
