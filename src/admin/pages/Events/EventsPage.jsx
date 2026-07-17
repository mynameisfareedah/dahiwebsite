import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, Eye, Edit, Trash2, Feather, Star, EyeOff } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { PageHeader, StatusBadge } from '../../components';
import { LoadingState } from '../../components/events/LoadingState';
import { EmptyState } from '../../components/events/EmptyState';
import { getEventImageUrl } from '../../services/eventService';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'cancelled', label: 'Cancelled' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'health', label: 'Health' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'education', label: 'Education' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
];

function EventActionDropdown({ event, onDelete, onTogglePublish, onToggleFeatured }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (eventClick) => {
      if (menuRef.current && !menuRef.current.contains(eventClick.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-blue-500 hover:text-white transition"
      >
        Actions
        <ChevronDown className={`w-3.5 h-3.5 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-xl">
          <Link
            to={`/admin/events/${event.id}`}
            onClick={() => setIsOpen(false)}
            className="block w-full px-4 py-3 text-left text-sm text-slate-100 hover:bg-slate-900"
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View
            </div>
          </Link>
          <Link
            to={`/admin/events/edit/${event.id}`}
            onClick={() => setIsOpen(false)}
            className="block w-full px-4 py-3 text-left text-sm text-slate-100 hover:bg-slate-900"
          >
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </div>
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onTogglePublish(event.id);
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-100 hover:bg-slate-900"
          >
            <EyeOff className="h-4 w-4" />
            {event.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onToggleFeatured(event.id);
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-100 hover:bg-slate-900"
          >
            <Star className="h-4 w-4" />
            {event.featured ? 'Unfeature' : 'Feature'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDelete(event.id);
            }}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-400 hover:bg-slate-900"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    events,
    count,
    loading,
    error,
    filters,
    setFilters,
    page,
    setPage,
    totalPages,
    refresh,
    deleteEvent,
    togglePublish,
    toggleFeatured,
    setSearch,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
  } = useEvents({
    initialPage: 1,
    initialPageSize: 10,
    initialSortBy: 'event_date',
    initialSortOrder: 'desc',
    initialSearch: '',
  });

  const stats = useMemo(() => {
    const published = events.filter((event) => event.status === 'published').length;
    const draft = events.filter((event) => event.status === 'draft').length;
    const upcoming = events.filter((event) => new Date(event.date) >= new Date()).length;
    return {
      total: count,
      published,
      draft,
      upcoming,
    };
  }, [events, count]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setFilters((current) => ({ ...current, status: value }));
    setPage(1);
  };

  const handleCategoryChange = (value) => {
    setFilters((current) => ({ ...current, category: value }));
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 inline-block" /> : <ChevronDown className="w-4 h-4 inline-block" />;
  };

  if (loading) {
    return <LoadingState message="Loading events..." />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border border-red-600 bg-red-950/70 p-8 text-white">
          <h2 className="text-2xl font-semibold">Unable to load events</h2>
          <p className="mt-2 text-gray-300">There was an error fetching event data. Please try again.</p>
          <button
            onClick={refresh}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-gray-100 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <PageHeader
          title="Events"
          subtitle="Manage your published and draft events in one place."
        />
        <Link
          to="/admin/events/create"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Feather className="w-4 h-4" />
          Create Event
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-white">
          <p className="text-sm uppercase text-slate-400">Total Events</p>
          <p className="mt-3 text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-white">
          <p className="text-sm uppercase text-slate-400">Published</p>
          <p className="mt-3 text-3xl font-bold">{stats.published}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-white">
          <p className="text-sm uppercase text-slate-400">Draft</p>
          <p className="mt-3 text-3xl font-bold">{stats.draft}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-white">
          <p className="text-sm uppercase text-slate-400">Upcoming</p>
          <p className="mt-3 text-3xl font-bold">{stats.upcoming}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search by title or slug"
              className="w-full rounded-3xl border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={filters.status}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="w-full rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="w-full rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No events found"
          description="Create your first event or adjust the search and filters."
          actionLabel="Clear filters"
          onAction={() => {
            setSearchTerm('');
            setSearch('');
            setFilters({ status: 'all', category: 'all', featured: 'all' });
            setPage(1);
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-5 py-4">Event</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4 cursor-pointer" onClick={() => handleSort('event_date')}>
                    Date {sortIcon('event_date')}
                  </th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Featured</th>
                  <th className="px-5 py-4 cursor-pointer" onClick={() => handleSort('created_at')}>
                    Created At {sortIcon('created_at')}
                  </th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-t border-slate-800 hover:bg-slate-900/80">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-20 overflow-hidden rounded-2xl bg-slate-800">
                          {event.poster_url ? (
                            <img src={getEventImageUrl(event.poster_url)} alt={event.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs uppercase text-slate-500">No image</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{event.title}</p>
                          <p className="text-xs text-slate-500">{event.slug || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{event.category || '—'}</td>
                    <td className="px-5 py-4 text-slate-300">{event.date || 'TBD'}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={event.status || 'draft'} />
                    </td>
                    <td className="px-5 py-4 text-slate-300">{event.featured ? 'Yes' : 'No'}</td>
                    <td className="px-5 py-4 text-slate-300">{new Date(event.created_at || event.event_date || Date.now()).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <EventActionDropdown
                        event={event}
                        onDelete={deleteEvent}
                        onTogglePublish={togglePublish}
                        onToggleFeatured={toggleFeatured}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">Showing {events.length} of {count} events</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={`rounded-full px-4 py-2 text-sm ${page === index + 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
