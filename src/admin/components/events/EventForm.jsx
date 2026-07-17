import React from 'react';
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from '../FormField';

export function EventForm({
  values,
  errors,
  touched,
  onChange,
  onBlur,
  onSubmit,
  categories,
  statuses,
  isSubmitting,
  submitLabel = 'Save Event',
  children,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <FormInput
          label="Event Title"
          name="title"
          value={values.title}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.title && errors.title}
          required
          placeholder="Community Health Seminar"
        />
        <FormSelect
          label="Category"
          name="category"
          value={values.category}
          onChange={onChange}
          onBlur={onBlur}
          options={categories}
        />
      </div>

      <FormTextarea
        label="Description"
        name="description"
        rows={4}
        value={values.description}
        onChange={onChange}
        onBlur={onBlur}
        error={touched.description && errors.description}
        placeholder="Describe the event..."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <FormInput
          label="Date"
          name="date"
          type="date"
          value={values.date}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.date && errors.date}
          required
        />
        <FormInput
          label="Time"
          name="time"
          type="time"
          value={values.time}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.time && errors.time}
          required
        />
        <FormInput
          label="Capacity"
          name="capacity"
          type="number"
          min="0"
          value={values.capacity}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.capacity && errors.capacity}
          required
        />
      </div>

      <FormInput
        label="Location"
        name="location"
        value={values.location}
        onChange={onChange}
        onBlur={onBlur}
        error={touched.location && errors.location}
        required
        placeholder="Main Community Center - Hall B"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <FormSelect
          label="Status"
          name="status"
          value={values.status}
          onChange={onChange}
          onBlur={onBlur}
          options={statuses}
        />
        <FormCheckbox
          label="Featured Event"
          name="featured"
          checked={values.featured}
          onChange={onChange}
          onBlur={onBlur}
          help="Enable this to highlight the event on the public site."
        />
      </div>

      {children}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-700 px-5 py-3 text-sm text-gray-200 transition hover:border-gray-500 hover:text-white"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
