import React, { useState, useEffect, useRef } from 'react';
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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const tableRef = useRef(null);

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

  const handleOpenDetails = (application) => {
    setSelectedApplication(application);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedApplication(null);
  };

  const exportToExcel = () => {
    try {
      const data = applications.map((app) => ({
        Name: app.full_name,
        Email: app.email,
        Phone: app.phone || '',
        Occupation: app.occupation || '',
        Availability: app.availability || '',
        Skills: app.skills || '',
        Interest: app.interest || '',
        Experience: app.experience || '',
        Motivation: app.motivation || '',
        Status: app.status || 'Pending',
        Submitted: formatDate(app.created_at),
      }));

      import(/* @vite-ignore */ 'xlsx')
        .then((mod) => {
          const XLSX = mod.default ?? mod;
          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Applications');
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([wbout], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `volunteer-applications-${new Date().toISOString().slice(0, 10)}.xlsx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          addToast('Exported Excel successfully.', 'success');
        })
        .catch((err) => {
          console.error('xlsx import failed', err);
          addToast('Install dependencies (npm install) to enable Excel export.', 'error');
        });
    } catch (error) {
      console.error('Export Excel failed', error);
      addToast('Failed to export Excel.', 'error');
    }
  };

  const exportToPDF = async () => {
    try {
      const element = tableRef.current || document.body;
      const [html2canvasMod, jspdfMod] = await Promise.all([
        import(/* @vite-ignore */ 'html2canvas').catch((e) => ({ error: e })),
        import(/* @vite-ignore */ 'jspdf').catch((e) => ({ error: e })),
      ]);
      if (html2canvasMod.error || jspdfMod.error) {
        console.error('pdf import failed', html2canvasMod.error || jspdfMod.error);
        addToast('Install dependencies (npm install) to enable PDF export.', 'error');
        return;
      }
      const html2canvas = html2canvasMod.default ?? html2canvasMod;
      const jsPDF = jspdfMod.default ?? jspdfMod;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`volunteer-applications-${new Date().toISOString().slice(0, 10)}.pdf`);
      addToast('Exported PDF successfully.', 'success');
    } catch (error) {
      console.error('Export PDF failed', error);
      addToast('Failed to export PDF.', 'error');
    }
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

      <div className="flex justify-end gap-3">
        <button
          onClick={exportToExcel}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Export Excel
        </button>
        <button
          onClick={exportToPDF}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Export PDF
        </button>
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
          <div ref={tableRef} className="overflow-x-auto">
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
                          onClick={() => handleOpenDetails(application)}
                          className="rounded-full bg-slate-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-500"
                        >
                          Details
                        </button>
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

      <Modal
        isOpen={detailsModalOpen}
        onClose={handleCloseDetails}
        title="Volunteer Application Details"
        size="lg"
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm font-semibold text-white">Applicant</p>
            <p className="text-gray-300">{selectedApplication?.full_name}</p>
            <p className="text-gray-300">{selectedApplication?.email}</p>
            {selectedApplication?.phone && (
              <p className="text-gray-300">{selectedApplication.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <p className="text-sm font-semibold text-white">Occupation</p>
              <p className="text-gray-300">{selectedApplication?.occupation || '—'}</p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <p className="text-sm font-semibold text-white">Availability</p>
              <p className="text-gray-300">{selectedApplication?.availability || '—'}</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm font-semibold text-white">Skills & Interests</p>
            <p className="text-gray-300 whitespace-pre-wrap">{(selectedApplication?.skills || '') + '\n' + (selectedApplication?.interest || '')}</p>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm font-semibold text-white">Additional Information</p>
            <p className="text-gray-300 whitespace-pre-wrap">{(selectedApplication?.experience || '') + '\n' + (selectedApplication?.motivation || '')}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">Submitted: {formatDate(selectedApplication?.created_at)}</div>
            <div className="flex gap-3">
              <button
                onClick={handleCloseDetails}
                className="rounded-full border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
