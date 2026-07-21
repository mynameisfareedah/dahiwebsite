import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useToast } from '../../hooks/useDataManagement';
import { eventService, getEventImageUrl } from '../../services/eventService';
import { EVENT_STATUS } from '../../../constants/status';
export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const actionsRef = useRef(null);

  const loadEvent = async () => {
    setLoading(true);
    const response = await eventService.getEventById(id);
    if (!response.success || !response.data) {
      setError(response.error?.message || 'Event not found');
      setLoading(false);
      return;
    }
    setEvent(response.data);
    setLoading(false);
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleTogglePublish = async () => {
    setActionLoading(true);
    const response = await eventService.togglePublish(id);
    if (!response.success) {
      addToast(response.error?.message || 'Unable to update publish state', 'error');
    } else {
      addToast(`Event ${response.data.status === EVENT_STATUS.PUBLISHED ? EVENT_STATUS.PUBLISHED : 'unpublished'}`, 'success');
      setEvent(response.data);
    }
    setActionLoading(false);
  };

  const handleToggleFeatured = async () => {
    setActionLoading(true);
    const response = await eventService.toggleFeatured(id);
    if (!response.success) {
      addToast(response.error?.message || 'Unable to update featured state', 'error');
    } else {
      addToast(response.data.featured ? 'Event featured' : 'Event unfeatured', 'success');
      setEvent(response.data);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this event? This action cannot be undone.');
    if (!confirmed) return;
    setActionLoading(true);
    const response = await eventService.deleteEvent(id);
    if (!response.success) {
      addToast(response.error?.message || 'Unable to delete event', 'error');
      setActionLoading(false);
      return;
    }
    addToast('Event deleted successfully', 'success');
    navigate('/admin/events');
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setIsActionsOpen(false);
      }
    };

    if (isActionsOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isActionsOpen]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-gray-800 bg-slate-950 p-8 text-white">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="rounded-3xl border border-red-700 bg-red-950/80 p-8 text-white">
        <h1 className="text-2xl font-semibold">Unable to load event</h1>
        <p className="mt-3 text-gray-300">{error || 'Event not found.'}</p>
        <Link
          to="/admin/events"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  const posterUrl = getEventImageUrl(event.poster_url);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">{event.title}</h1>
          <p className="mt-2 text-sm text-gray-400">Review event details and manage its state.</p>
        </div>
        <div className="relative" ref={actionsRef}>
        <button
          type="button"
          onClick={() => setIsActionsOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-600"
        >
          Actions
          <ChevronDown className={`w-4 h-4 transition ${isActionsOpen ? 'rotate-180' : ''}`} />
        </button>

        {isActionsOpen && (
          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-3xl border border-gray-700 bg-slate-950 shadow-xl">
            <Link
              to={`/admin/events/edit/${id}`}
              onClick={() => setIsActionsOpen(false)}
              className="block w-full px-4 py-3 text-left text-sm text-gray-100 hover:bg-slate-900"
            >
              Edit Event
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsActionsOpen(false);
                handleTogglePublish();
              }}
              disabled={actionLoading}
              className="w-full px-4 py-3 text-left text-sm text-gray-100 hover:bg-slate-900 disabled:opacity-60"
            >
              {event.status === EVENT_STATUS.PUBLISHED ? 'Unpublish Event' : 'Publish Event'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsActionsOpen(false);
                handleToggleFeatured();
              }}
              disabled={actionLoading}
              className="w-full px-4 py-3 text-left text-sm text-gray-100 hover:bg-slate-900 disabled:opacity-60"
            >
              {event.featured ? 'Remove Featured' : 'Mark as Featured'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsActionsOpen(false);
                handleDelete();
              }}
              disabled={actionLoading}
              className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-slate-900 disabled:opacity-60"
            >
              Delete Event
            </button>
          </div>
        )}
      </div>
      </div>

      {posterUrl && (
        <div className="overflow-hidden rounded-3xl border border-gray-700 bg-slate-950 shadow-sm">
          <img src={posterUrl} alt={event.title} className="h-96 w-full object-cover" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-gray-800 bg-slate-950 p-8">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white">Overview</h2>
            <p className="text-gray-300">{event.description || 'No description available.'}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-800 bg-slate-900 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Category</p>
              <p className="mt-2 text-lg font-semibold text-white">{event.category || 'N/A'}</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-slate-900 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Slug</p>
              <p className="mt-2 text-lg font-semibold text-white">{event.slug || 'N/A'}</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-slate-900 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Location</p>
              <p className="mt-2 text-lg font-semibold text-white">{event.location || 'N/A'}</p>
            </div>
            <div className="rounded-3xl border border-gray-800 bg-slate-900 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Capacity</p>
              <p className="mt-2 text-lg font-semibold text-white">{event.capacity ?? '0'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-gray-800 bg-slate-950 p-8">
          <div className="space-y-3 rounded-3xl border border-gray-800 bg-slate-900 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Status</p>
            <p className="mt-2 text-lg font-semibold text-white">{event.status || 'N/A'}</p>
          </div>
          <div className="space-y-3 rounded-3xl border border-gray-800 bg-slate-900 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Featured</p>
            <p className="mt-2 text-lg font-semibold text-white">{event.featured ? 'Yes' : 'No'}</p>
          </div>
          <div className="space-y-3 rounded-3xl border border-gray-800 bg-slate-900 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Date & Time</p>
            <p className="mt-2 text-lg font-semibold text-white">{event.date || 'TBD'} {event.time || ''}</p>
          </div>
          {(event.registrationUrl || event.registration_url) && (
            <div className="space-y-3 rounded-3xl border border-gray-800 bg-slate-900 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Registration</p>
              <a
                href={event.registrationUrl || event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {event.registrationUrl || event.registration_url}
              </a>
              <p className="text-sm text-gray-400">
                Button text: {event.registrationButtonText || event.registration_button_text || 'Register'}
              </p>
            </div>
          )}
          <div className="space-y-3 rounded-3xl border border-gray-800 bg-slate-900 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Created</p>
            <p className="mt-2 text-lg font-semibold text-white">{event.created_at ? new Date(event.created_at).toLocaleString() : 'N/A'}</p>
          </div>
          <div className="space-y-3 rounded-3xl border border-gray-800 bg-slate-900 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Last updated</p>
            <p className="mt-2 text-lg font-semibold text-white">{event.updated_at ? new Date(event.updated_at).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Link
          to="/admin/events"
          className="rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-600"
        >
          Back to Events
        </Link>
      </div>
    </div>
  );
}
