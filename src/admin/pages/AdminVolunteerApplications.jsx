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

  const VOLUNTEER_CREATED_EVENT = 'admin:volunteer:created';

  const { addToast } = useToast();
  const { searchQuery, setSearchQuery, filtered: searchedApplications } = useSearch(
    applications,
    ['full_name', 'email', 'occupation', 'interest', 'skills']
  );

  const filteredApplications = searchedApplications.filter((application) => {
    if (!statusFilter) return true;
    return (application.status || '').toLowerCase() === (statusFilter || '').toLowerCase();
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
        // notify other admin pages a volunteer was created so they can refresh
        try {
          const createdVolunteer = result.data?.volunteer;
          if (createdVolunteer) {
            window.dispatchEvent(
              new CustomEvent(VOLUNTEER_CREATED_EVENT, { detail: createdVolunteer })
            );
            try {
              window.localStorage.setItem(
                VOLUNTEER_CREATED_EVENT,
                JSON.stringify({ id: createdVolunteer.id, ts: Date.now() })
              );
              window.localStorage.removeItem(VOLUNTEER_CREATED_EVENT);
            } catch (storageError) {
              console.warn('Unable to set localStorage sync event', storageError);
            }
          }
        } catch (e) {
          // ignore
        }
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

  const dynamicImport = (specifier) => new Function('return import(specifier)')();

  const createPdfHeader = (titleText, metaText) => {
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '8px';

    const org = document.createElement('div');
    const orgTitle = document.createElement('strong');
    orgTitle.textContent = 'DAHI';
    org.appendChild(orgTitle);

    const orgSubtitle = document.createElement('div');
    orgSubtitle.textContent = titleText;
    orgSubtitle.style.fontSize = '12px';
    orgSubtitle.style.color = '#666';
    orgSubtitle.style.marginTop = '2px';
    org.appendChild(orgSubtitle);

    const meta = document.createElement('div');
    meta.style.textAlign = 'right';
    meta.style.fontSize = '12px';
    meta.style.color = '#444';
    meta.textContent = metaText;

    header.appendChild(org);
    header.appendChild(meta);
    return header;
  };

  const exportToCSV = () => {
    try {
      const headers = [
        'Name',
        'Email',
        'Phone',
        'Occupation',
        'Availability',
        'Skills',
        'Interest',
        'Experience',
        'Motivation',
        'Status',
        'Submitted',
      ];
      const rows = applications.map((app) => [
        app.full_name || '',
        app.email || '',
        app.phone || '',
        app.occupation || '',
        app.availability || '',
        app.skills || '',
        app.interest || '',
        app.experience || '',
        app.motivation || '',
        app.status || 'Pending',
        formatDate(app.created_at),
      ]);
      const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
      const csv = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `volunteer-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      addToast('Exported CSV successfully.', 'success');
    } catch (error) {
      console.error('Export CSV failed', error);
      addToast('Failed to export CSV.', 'error');
    }
  };


  const exportToPDF = async () => {
    try {
      if (!applications || applications.length === 0) {
        addToast('No applications to export.', 'info');
        return;
      }

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

      const pdf = new jsPDF('p', 'mm', 'a4');
      let firstPage = true;

      // Render each application as its own print-friendly card and add as a PDF page
      for (const app of applications) {
        const allKeys = Array.from(new Set(Object.keys(app)));
        const container = document.createElement('div');
        container.style.padding = '24px';
        container.style.background = '#ffffff';
        container.style.color = '#000000';
        container.style.fontFamily = 'Arial, Helvetica, sans-serif';
        container.style.fontSize = '13px';
        container.style.lineHeight = '1.4';
        container.style.maxWidth = '800px';
        container.style.margin = '0 auto 12px auto';
        container.style.border = '1px solid #e5e7eb';

        const header = createPdfHeader('Volunteer Application', formatDate(app.created_at));

        container.appendChild(header);

        const title = document.createElement('h2');
        title.textContent = `${app.full_name || app.name || ''}`;
        title.style.fontSize = '18px';
        title.style.margin = '0 0 8px 0';
        container.appendChild(title);

        const dl = document.createElement('dl');
        dl.style.display = 'block';
        dl.style.width = '100%';

        allKeys.forEach((k) => {
          const dt = document.createElement('dt');
          dt.textContent = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          dt.style.fontWeight = '700';
          dt.style.marginTop = '8px';
          dt.style.fontSize = '13px';
          const dd = document.createElement('dd');
          let v = app[k];
          if (Array.isArray(v)) v = v.join('; ');
          else if (v && typeof v === 'object') v = JSON.stringify(v);
          dd.textContent = v ?? '';
          dd.style.margin = '4px 0 6px 0';
          dd.style.fontSize = '13px';
          dd.style.color = '#111827';
          dl.appendChild(dt);
          dl.appendChild(dd);
        });

        container.appendChild(dl);

        document.body.appendChild(container);
        // render per-application card
        // eslint-disable-next-line no-await-in-loop
        const canvas = await html2canvas(container, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = Math.min(pageWidth / imgProps.width, (pdf.internal.pageSize.getHeight()) / imgProps.height);
        const imgWidth = imgProps.width * ratio;
        const imgHeight = imgProps.height * ratio;

        if (!firstPage) pdf.addPage();
        pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 10, imgWidth, imgHeight);
        firstPage = false;
        document.body.removeChild(container);
      }

      pdf.save(`volunteer-applications-${new Date().toISOString().slice(0, 10)}.pdf`);
      addToast('Exported PDF successfully.', 'success');
    } catch (error) {
      console.error('Export PDF failed', error);
      addToast('Failed to export PDF.', 'error');
    }
  };

  const exportApplicationToPDF = async (application) => {
    try {
      if (!application) {
        addToast('No application selected for export.', 'info');
        return;
      }

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

      const allKeys = Array.from(new Set(Object.keys(application)));
      const container = document.createElement('div');
      container.style.padding = '28px';
      container.style.background = '#ffffff';
      container.style.color = '#000000';
      container.style.fontFamily = 'Arial, Helvetica, sans-serif';
      container.style.fontSize = '13px';
      container.style.lineHeight = '1.4';
      container.style.maxWidth = '800px';
      container.style.margin = '0 auto';
      container.style.border = '1px solid #e5e7eb';
      container.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';

const header = createPdfHeader('Volunteer Application', new Date().toLocaleDateString());

      container.appendChild(header);

      const title = document.createElement('h1');
      title.textContent = `${application.full_name || application.name || ''}`;
      title.style.fontSize = '20px';
      title.style.margin = '0 0 10px 0';
      container.appendChild(title);

      const dl = document.createElement('dl');
      dl.style.display = 'block';
      dl.style.width = '100%';

      allKeys.forEach((k) => {
        const dt = document.createElement('dt');
        dt.textContent = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        dt.style.fontWeight = '700';
        dt.style.marginTop = '10px';
        dt.style.fontSize = '14px';
        const dd = document.createElement('dd');
        let v = application[k];
        if (Array.isArray(v)) v = v.join('; ');
        else if (v && typeof v === 'object') v = JSON.stringify(v);
        dd.textContent = v ?? '';
        dd.style.margin = '4px 0 8px 0';
        dd.style.fontSize = '13px';
        dd.style.color = '#111827';
        dl.appendChild(dt);
        dl.appendChild(dd);
      });

      container.appendChild(dl);
      document.body.appendChild(container);

      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = Math.min(pageWidth / imgProps.width, (pdf.internal.pageSize.getHeight()) / imgProps.height);
      const imgWidth = imgProps.width * ratio;
      const imgHeight = imgProps.height * ratio;
      pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 10, imgWidth, imgHeight);
      pdf.save(`application-${application.id || application.email || Date.now()}.pdf`);

      document.body.removeChild(container);
      addToast('Exported application PDF successfully.', 'success');
    } catch (err) {
      console.error('Export application PDF failed', err);
      addToast('Failed to export application PDF.', 'error');
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
          onClick={exportToCSV}
          className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
        >
          Export CSV
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
                onClick={() => exportApplicationToPDF(selectedApplication)}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Export PDF
              </button>
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
