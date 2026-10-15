import React from 'react';
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from '../FormField';
import { formatEventDateRange } from '../../../utils/eventSchedule';

const REGISTRATION_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'coming_soon', label: 'Coming Soon' },
  { value: 'closed', label: 'Closed' },
];

const TIME_STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed time' },
  { value: 'tba', label: 'Time to Be Announced (TBA)' },
];

const SCHEDULE_MODE_OPTIONS = [
  { value: 'shared', label: 'One time for the whole event' },
  { value: 'sessions', label: 'Different times for individual sessions' },
];

export function EventForm({
  values,
  errors,
  touched,
  onChange,
  onBlur,
  onScheduleModeChange,
  onSharedTimeStatusChange,
  onScheduleChange,
  onAddSession,
  onRemoveSession,
  onSubmit,
  eventTypes = [],
  eventTypeError,
  eventTypeHelp,
  eventTypeRequired = true,
  statuses,
  isSubmitting,
  submitDisabled = false,
  schemaNotice,
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
          label="Event Type"
          name="eventType"
          value={values.eventType || ''}
          onChange={onChange}
          onBlur={onBlur}
          options={eventTypes}
          error={eventTypeError || (touched.eventType && errors.eventType)}
          required={eventTypeRequired}
          help={eventTypeHelp}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          label="Start Date"
          name="date"
          type="date"
          value={values.date}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.date && errors.date}
          required
        />
        <FormInput
          label="End Date"
          name="endDate"
          type="date"
          value={values.endDate}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.endDate}
          help="Optional. Leave blank for a single-day event."
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-800 bg-slate-900 p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <FormSelect
            label="Event Schedule"
            name="scheduleMode"
            value={values.scheduleMode}
            onChange={(event) => onScheduleModeChange(event.target.value)}
            options={SCHEDULE_MODE_OPTIONS}
            help="Use session times when different days or sessions have different schedules."
          />
          {values.scheduleMode === 'shared' ? (
            <FormSelect
              label="Event Time"
              name="timeStatus"
              value={values.timeStatus}
              onChange={(event) => onSharedTimeStatusChange(event.target.value)}
              options={TIME_STATUS_OPTIONS}
            />
          ) : null}
        </div>

        {values.scheduleMode === 'shared' && values.timeStatus === 'confirmed' ? (
          <FormInput
            label="Confirmed Time"
            name="time"
            type="time"
            value={values.time}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.time}
            required
          />
        ) : null}

        {values.scheduleMode === 'sessions' ? (
          <div className="space-y-4">
            <div className="space-y-4">
              {(values.sessions || []).map((session, index) => (
                <div key={`session-${index}`} className="grid gap-4 rounded-xl border border-gray-700 p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                  <FormInput
                    label={`Session ${index + 1} Date`}
                    name={`session-${index}-date`}
                    type="date"
                    value={session.date}
                    onChange={(event) => onScheduleChange(index, 'date', event.target.value)}
                    required
                  />
                  <FormSelect
                    label="Session Time"
                    name={`session-${index}-timeStatus`}
                    value={session.timeStatus}
                    onChange={(event) => onScheduleChange(index, 'timeStatus', event.target.value)}
                    options={TIME_STATUS_OPTIONS}
                  />
                  {session.timeStatus === 'confirmed' ? (
                    <FormInput
                      label="Confirmed Time"
                      name={`session-${index}-time`}
                      type="time"
                      value={session.time}
                      onChange={(event) => onScheduleChange(index, 'time', event.target.value)}
                      required
                    />
                  ) : (
                    <p className="pb-2 text-sm text-gray-400">Time will display as TBA.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveSession(index)}
                    disabled={(values.sessions || []).length < 2}
                    className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 transition hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Remove session ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {errors.schedule ? <p role="alert" className="text-sm text-red-400">{errors.schedule}</p> : null}
            <button
              type="button"
              onClick={onAddSession}
              className="rounded-lg border border-blue-500/60 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/10"
            >
              Add session
            </button>
          </div>
        ) : null}
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
        <FormInput
          label="Registration URL"
          name="registrationUrl"
          type="url"
          value={values.registrationUrl}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.registrationUrl && errors.registrationUrl}
          placeholder="https://example.com/register"
          help="Optional. Enter a valid http:// or https:// URL to enable direct registration."
        />
        <FormInput
          label="Registration Button Text"
          name="registrationButtonText"
          value={values.registrationButtonText}
          onChange={onChange}
          onBlur={onBlur}
          error={touched.registrationButtonText && errors.registrationButtonText}
          placeholder="Register Now"
          help="Optional label override. Defaults to Register Now."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormCheckbox
          label="Enable Registration"
          name="registrationEnabled"
          checked={values.registrationEnabled}
          onChange={onChange}
          onBlur={onBlur}
          help="If disabled, registration is closed regardless of URL or status."
        />
        <FormSelect
          label="Registration Status"
          name="registrationStatus"
          value={values.registrationStatus}
          onChange={onChange}
          onBlur={onBlur}
          options={REGISTRATION_STATUS_OPTIONS}
          help="Controls registration state when registration is enabled."
        />
      </div>

      <div className="rounded-2xl border border-gray-800 bg-slate-900 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">Preview</h3>
        <div className="mt-4 space-y-2 text-sm text-gray-200">
          <p><span className="font-semibold text-white">Event Title:</span> {values.title || 'Untitled Event'}</p>
          <p><span className="font-semibold text-white">Date:</span> {values.date ? formatEventDateRange(values.date, values.endDate) : 'TBD'}</p>
          <p><span className="font-semibold text-white">Time:</span> {values.scheduleMode === 'sessions'
            ? (values.sessions || []).map((session) => session.timeStatus === 'confirmed' ? session.time : 'TBA').join(' · ') || 'TBA'
            : values.timeStatus === 'confirmed' ? values.time || 'TBA' : 'TBA'}</p>
          <p><span className="font-semibold text-white">Registration Status:</span> {values.registrationEnabled ? values.registrationStatus : 'closed'}</p>
          <p><span className="font-semibold text-white">Button Text:</span> {values.registrationButtonText || 'Register Now'}</p>
          <p className="break-all"><span className="font-semibold text-white">Registration URL:</span> {values.registrationUrl || 'Not set'}</p>
        </div>
      </div>

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

      {schemaNotice ? (
        <p role="status" className="rounded-xl border border-amber-800 bg-amber-950/60 p-4 text-sm text-amber-100">
          {schemaNotice}
        </p>
      ) : null}

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
          disabled={isSubmitting || submitDisabled}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
