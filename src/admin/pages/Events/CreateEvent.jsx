import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useToast } from '../../hooks/useDataManagement';
import { EventForm } from '../../components/events/EventForm';
import { EventImageUploader } from '../../components/events/EventImageUploader';
import { validators, validateForm } from '../../utils/validation';
import { eventService } from '../../services/eventService';
import { EVENT_STATUS } from '../../../constants/status';
import { EVENT_TYPE_OPTIONS } from '../../../constants/eventTypes';
import { EVENT_TYPE_SCHEMA_ACTIVATION_MESSAGE, isEventTypeSchemaReady } from '../../../constants/eventTypeSchema';
import { toEventServicePayload, validateEventSchedule } from '../../../utils/eventSchedule';

const STATUS_OPTIONS = [
  { value: EVENT_STATUS.DRAFT, label: 'Draft' },
  { value: EVENT_STATUS.PUBLISHED, label: 'Published' },
];

const initialFormValues = {
  title: '',
  description: '',
  eventType: '',
  date: '',
  endDate: '',
  scheduleMode: 'shared',
  timeStatus: 'tba',
  time: '',
  sessions: [],
  location: '',
  registrationUrl: '',
  registrationButtonText: '',
  registrationEnabled: true,
  registrationStatus: 'open',
  status: EVENT_STATUS.DRAFT,
  featured: false,
};

const validateOptionalRegistrationUrl = (value) => {
  if (!value || value.toString().trim() === '') return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'Registration URL must start with http:// or https://';
    }
    return null;
  } catch {
    return 'Enter a valid registration URL';
  }
};

const formRules = {
  title: [
    (val) => validators.required(val, 'Event title'),
    (val) => validators.minLength(val, 3, 'Event title'),
  ],
  eventType: [(val) => validators.required(val, 'Event Type')],
  date: [(val) => validators.required(val, 'Date')],
  location: [(val) => validators.required(val, 'Location')],
  registrationUrl: [(val) => validateOptionalRegistrationUrl(val)],
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [posterFile, setPosterFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const eventTypeSchemaReady = isEventTypeSchemaReady();

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useForm(initialFormValues, async (formValues) => {
    if (!eventTypeSchemaReady) {
      addToast(EVENT_TYPE_SCHEMA_ACTIVATION_MESSAGE, 'error');
      return;
    }

    setIsUploading(true);

    try {
      const payload = toEventServicePayload(formValues);

      if (posterFile) {
        const uploadResponse = await eventService.uploadPoster(posterFile);
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.error?.message || 'Unable to upload image');
        }
        payload.poster_url = uploadResponse.data?.path || uploadResponse.data?.path || null;
      }

      const response = await eventService.createEvent(payload);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create event');
      }

      addToast('Event created successfully', 'success');
      navigate('/admin/events');
    } catch (error) {
      addToast(error.message || 'Unable to create event', 'error');
    } finally {
      setIsUploading(false);
    }
  }, (values) => ({
    ...validateForm(values, formRules),
    ...validateEventSchedule(values),
  }));

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handlePosterFileChange = (file) => {
    setPosterFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleScheduleModeChange = (scheduleMode) => {
    if (scheduleMode === 'sessions' && values.sessions.length === 0) {
      setFieldValue('sessions', [{ date: values.date, time: '', timeStatus: 'tba' }]);
    }
    setFieldValue('scheduleMode', scheduleMode);
  };

  const handleScheduleChange = (index, field, value) => {
    setFieldValue('sessions', values.sessions.map((session, sessionIndex) => (
      sessionIndex === index
        ? { ...session, [field]: value, ...(field === 'timeStatus' && value === 'tba' ? { time: '' } : {}) }
        : session
    )));
  };

  const handleAddSession = () => {
    setFieldValue('sessions', [
      ...values.sessions,
      { date: values.endDate || values.date, time: '', timeStatus: 'tba' },
    ]);
  };

  const handleRemoveSession = (index) => {
    if (values.sessions.length > 1) {
      setFieldValue('sessions', values.sessions.filter((_, sessionIndex) => sessionIndex !== index));
    }
  };

  const handleSharedTimeStatusChange = (timeStatus) => {
    setFieldValue('timeStatus', timeStatus);
    if (timeStatus === 'tba') setFieldValue('time', '');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Create Event</h1>
          <p className="mt-2 text-sm text-gray-400">Create a new event and save it to Supabase.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-gray-800 bg-slate-950 p-8 shadow-sm">
          <EventForm
            values={values}
            errors={errors}
            touched={touched}
            onChange={handleChange}
            onBlur={handleBlur}
            onScheduleModeChange={handleScheduleModeChange}
            onSharedTimeStatusChange={handleSharedTimeStatusChange}
            onScheduleChange={handleScheduleChange}
            onAddSession={handleAddSession}
            onRemoveSession={handleRemoveSession}
            onSubmit={handleSubmit}
            eventTypes={[{ value: '', label: 'Select Event Type' }, ...EVENT_TYPE_OPTIONS]}
            eventTypeError={errors.eventType}
            eventTypeHelp="Choose one approved public classification."
            statuses={STATUS_OPTIONS}
            isSubmitting={isSubmitting || isUploading}
            submitDisabled={!eventTypeSchemaReady}
            schemaNotice={!eventTypeSchemaReady
              ? `${EVENT_TYPE_SCHEMA_ACTIVATION_MESSAGE} The selected type will be preserved in this form; no event will be saved yet.`
              : null}
            submitLabel={isSubmitting || isUploading ? 'Saving...' : 'Create Event'}
            onCancel={() => navigate('/admin/events')}
          >
            <EventImageUploader
              previewUrl={posterFile ? previewUrl : null}
              fileName={posterFile?.name}
              onFileChange={handlePosterFileChange}
            />
          </EventForm>
        </div>
      </div>
    </div>
  );
}
