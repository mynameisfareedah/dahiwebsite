import { useEffect, useMemo, useState } from 'react';
import { FileText, Search, Download, Eye } from 'lucide-react';
import { PageHeader, Modal } from '../components';
import { auditTrailService } from '../services/auditTrailService';

const PAGE_SIZE = 10;

function formatJson(value) {
  if (value == null) return 'null';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function toCsv(rows) {
  const headers = ['Date & Time', 'User', 'Action', 'Module', 'Description'];
  const values = rows.map((row) => [
    row.createdAt ? new Date(row.createdAt).toLocaleString() : '',
    row.userName || '',
    row.action || '',
    row.module || '',
    row.description || '',
  ]);

  const escape = (value) => String(value).replace(/"/g, '""');
  const lines = [headers.join(',')].concat(values.map((row) => row.map((value) => `"${escape(value)}"`).join(',')));
  return lines.join('\n');
}

export default function AdminAuditTrail() {
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [user, setUser] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const loadEntries = async (nextPage = page) => {
    setLoading(true);
    setError('');

    try {
      const result = await auditTrailService.getAuditEntries({
        page: nextPage,
        pageSize: PAGE_SIZE,
        search,
        dateFrom,
        dateTo,
        user,
        module,
        action,
      });

      if (!result.success) {
        setEntries([]);
        setTotalCount(0);
        setError(result.error?.message || 'Failed to load audit trail.');
        return;
      }

      setEntries(result.data?.items || []);
      setTotalCount(result.data?.count || 0);
    } catch (err) {
      setEntries([]);
      setTotalCount(0);
      setError(err?.message || 'Failed to load audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries(1);
    setPage(1);
  }, [search, dateFrom, dateTo, user, module, action]);

  const handleExport = () => {
    const blob = new Blob([toCsv(entries)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admin-audit-trail.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filters = useMemo(() => ({
    search,
    dateFrom,
    dateTo,
    user,
    module,
    action,
  }), [search, dateFrom, dateTo, user, module, action]);

  useEffect(() => {
    if (Object.values(filters).every((value) => !value)) {
      loadEntries(1);
    }
  }, [filters]);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          title="Audit Trail"
          subtitle="Track admin activity from the live Supabase audit log"
        />
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm text-gray-600">
            <span className="mb-1 block">Search</span>
            <div className="flex items-center rounded-lg border border-gray-300 px-3 py-2">
              <Search size={16} className="mr-2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="User, action, module..."
              />
            </div>
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-1 block">Date from</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-1 block">Date to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-1 block">User</span>
            <input
              value={user}
              onChange={(event) => setUser(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Filter by user"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-1 block">Module</span>
            <input
              value={module}
              onChange={(event) => setModule(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Filter by module"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-1 block">Action</span>
            <input
              value={action}
              onChange={(event) => setAction(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Filter by action"
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-600">Loading audit entries...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-600">No audit entries found.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Module</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedEntry(entry);
                      setShowDetail(true);
                    }}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.userName || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.action}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.module}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <div className="text-sm text-gray-600">Showing {entries.length} of {totalCount} records</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextPage = Math.max(1, page - 1);
                  setPage(nextPage);
                  loadEntries(nextPage);
                }}
                disabled={page === 1}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button
                onClick={() => {
                  const nextPage = Math.min(totalPages, page + 1);
                  setPage(nextPage);
                  loadEntries(nextPage);
                }}
                disabled={page === totalPages}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Audit Details" size="2xl">
        {selectedEntry && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <p><span className="font-semibold">Date:</span> {selectedEntry.createdAt ? new Date(selectedEntry.createdAt).toLocaleString() : '—'}</p>
              <p><span className="font-semibold">User:</span> {selectedEntry.userName || 'Unknown'}</p>
              <p><span className="font-semibold">Action:</span> {selectedEntry.action}</p>
              <p><span className="font-semibold">Module:</span> {selectedEntry.module}</p>
              <p><span className="font-semibold">Description:</span> {selectedEntry.description}</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">Old Data</h3>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs text-gray-700">{formatJson(selectedEntry.oldData)}</pre>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">New Data</h3>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs text-gray-700">{formatJson(selectedEntry.newData)}</pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
