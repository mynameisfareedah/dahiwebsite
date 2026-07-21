/**
 * Admin Events Page
 * Manage events with Supabase backend
 */
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';
import {
  PageHeader,
  StatusBadge,
  Modal,
  SearchBar,
  Pagination,
  ConfirmDeleteModal,
  EmptyState,
  LoadingSpinner,
} from '../components';
import {
  useForm,
  useToast,
} from '../hooks/useDataManagement';
import { useEvents } from '../hooks/useEvents';
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from '../components/FormField';
import { validators, validateForm } from '../utils/validation';
import { EVENT_STATUS } from '../../constants/status';

export default function AdminEvents() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const {
    events,
    count,
    loading,
    error,
    search,
    setSearch,
    filters,
    setFilters,
    page,
    setPage,
    pageSize,
    totalPages,
    refresh,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  const { addToast } = useToast();
  const currentItems = events || [];

  useEffect(() => {
    if (error) {
      addToast(`Error loading events: ${error.message || 'Unable to load events'}`, 'error');
    }
  }, [error, addToast]);

  const formRules = {
    title: [
      (val) => validators.required(val, 'Event title'),
      (val) => validators.minLength(val, 3, 'Event title'),
    ],
    date: [(val) => validators.required(val, 'Date')],
    time: [(val) => validators.required(val, 'Time')],
    location: [(val) => validators.required(val, 'Location')],
    capacity: [
      (val) => validators.required(val, 'Capacity'),
      (val) => validators.number(val),
      (val) => validators.minValue(val, 1),
    ],
  };

  const initialFormValues = editingId
    ? events.find((e) => e.id === editingId) || {
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: 'health',
        capacity: '',
        status: EVENT_STATUS.DRAFT,
      }
    : {
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: 'health',
        capacity: '',
        status: EVENT_STATUS.DRAFT,
      };

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
    setFormLoading(true);
    try {
      if (editingId) {
        const response = await updateEvent(editingId, formValues);
        if (!response.success) {
          addToast(`Error updating event: ${response.error?.message || 'Unable to update event'}`, 'error');
        } else {
          addToast('Event updated successfully', 'success');
          await refresh();
          setShowForm(false);
          setEditingId(null);
          resetForm();
        }
      } else {
        const response = await createEvent(formValues);
        if (!response.success) {
          addToast(`Error creating event: ${response.error?.message || 'Unable to create event'}`, 'error');
        } else {
          addToast('Event created successfully', 'success');
          await refresh();
          setShowForm(false);
          setEditingId(null);
          resetForm();
        }
      }
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setFormLoading(false);
    }
  }, (values) => validateForm(values, formRules));

  const handleEdit = (event) => {
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = (event) => {
    setDeleteConfirm(event);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteEvent(deleteConfirm.id);
      if (!response.success) {
        addToast(`Error deleting event: ${response.error?.message || 'Unable to delete event'}`, 'error');
      } else {
        addToast('Event deleted successfully', 'success');
      }
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const categoryOptions = [
    { value: 'health', label: 'Health' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'education', label: 'Education' },
    { value: 'outreach', label: 'Outreach' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'webinar', label: 'Webinar' },
  ];

  const statusOptions = [
    { value: EVENT_STATUS.DRAFT, label: 'Draft' },
    { value: EVENT_STATUS.PUBLISHED, label: 'Published' },
  ];

  const filterStatusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: EVENT_STATUS.DRAFT, label: 'Draft' },
    { value: EVENT_STATUS.PUBLISHED, label: 'Published' },
  ];

  const statusColors = {
    [EVENT_STATUS.PUBLISHED]: 'bg-blue-900 text-blue-200',
    [EVENT_STATUS.DRAFT]: 'bg-gray-700 text-gray-200',
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner text="Loading events..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <PageHeader
            title="Event Management"
            subtitle="Organize and manage community events"
          />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <SearchBar
            placeholder="Search events by title, location..."
            value={search}
            onSearch={setSearch}
            clearable
          />
          <FormSelect
            label="Status"
            name="statusFilter"
            value={filters.status}
            onChange={(event) => {
              setFilters((current) => ({ ...current, status: event.target.value }));
              setPage(1);
            }}
            options={filterStatusOptions}
          />
        </div>
      </div>

      {/* Empty State */}
      {currentItems.length === 0 && search === '' && (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          description="Create your first event to get started"
          action={() => setShowForm(true)}
          actionLabel="Create Event"
        />
      )}

      {/* Empty Search State */}
      {currentItems.length === 0 && search !== '' && (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description={`No events match "${search}"`}
          action={() => setSearch('')}
          actionLabel="Clear search"
        />
      )}

      {/* Events Table */}
      {currentItems.length > 0 && (
        <>
          <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Event</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Attendees</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-white">{event.title}</p>
                        <p className="text-sm text-gray-400">{event.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-400" />
                        <div>
                          <p>{event.date}</p>
                          <p className="text-xs text-gray-400">{event.time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-red-400" />
                        {event.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-green-400" />
                        {event.attendees}/{event.capacity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={event.status}
                        colorClass={statusColors[event.status] || 'bg-gray-700 text-gray-200'}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event)}
                          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition"
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

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            itemsPerPage={pageSize}
            totalItems={count}
          />
        </>
      )}

      {/* Create/Edit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingId ? 'Edit Event' : 'Create Event'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Event Title"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title && errors.title}
              required
              placeholder="e.g., Community Health Seminar"
            />
            <FormSelect
              label="Category"
              name="category"
              value={values.category}
              onChange={handleChange}
              onBlur={handleBlur}
              options={categoryOptions}
              required
            />
          </div>

          <FormTextarea
            label="Description"
            name="description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Event description..."
            rows={3}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Date"
              name="date"
              type="date"
              value={values.date}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.date && errors.date}
              required
            />
            <FormInput
              label="Time"
              name="time"
              type="time"
              value={values.time}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.time && errors.time}
              required
            />
            <FormInput
              label="Capacity"
              name="capacity"
              type="number"
              value={values.capacity}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.capacity && errors.capacity}
              required
              placeholder="100"
            />
          </div>

          <FormInput
            label="Location"
            name="location"
            value={values.location}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.location && errors.location}
            required
            placeholder="e.g., Community Center"
          />

          <FormSelect
            label="Status"
            name="status"
            value={values.status}
            onChange={handleChange}
            onBlur={handleBlur}
            options={statusOptions}
            required
          />

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={handleCloseForm}
              className="px-6 py-2 border border-gray-600 hover:border-gray-500 text-gray-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition flex items-center gap-2"
            >
              {(isSubmitting || formLoading) && <LoadingSpinner size="sm" />}
              {editingId ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={false}
      />
    </div>
  );
}
