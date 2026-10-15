import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useToast } from '../../hooks/useDataManagement';
import { EventForm } from '../../components/events/EventForm';
import { EventImageUploader } from '../../components/events/EventImageUploader';
import { validators, validateForm } from '../../utils/validation';
import { eventService, getEventImageUrl } from '../../services/eventService';
import { EVENT_STATUS } from '../../../constants/status';
import { EVENT_TYPE_OPTIONS } from '../../../constants/eventTypes';
import { EVENT_TYPE_SCHEMA_ACTIVATION_MESSAGE, isEventTypeSchemaReady } from '../../../constants/eventTypeSchema';

const STATUS_OPTIONS = [
  { value: EVENT_STATUS.DRAFT, label: 'Draft' },
  { value: EVENT_STATUS.PUBLISHED, label: 'Published' },
];

const initialFormValues = {
  title: '',
  description: '',
  eventType: '',
  date: '',
  time: '',
  location: '',
  registrationUrl: '',
  registrationButtonText: '',
  registrationEnabled: true,
  registrationStatus: 'open',
  capacity: '0',
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
  date: [(val) => validators.required(val, 'Date')],
  time: [(val) => validators.required(val, 'Time')],
  location: [(val) => validators.required(val, 'Location')],
  registrationUrl: [(val) => validateOptionalRegistrationUrl(val)],
  capacity: [
    (val) => validators.required(val, 'Capacity'),
    (val) => validators.number(val),
    (val) => validators.minValue(val, 1),
  ],
};

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [posterFile, setPosterFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [eventRecord, setEventRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
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
    setIsUploading(true);

    try {
      const payload = { ...formValues };
      const existingEventType = eventRecord?.event_type || '';
      if (!eventTypeSchemaReady && formValues.eventType !== existingEventType) {
        addToast(EVENT_TYPE_SCHEMA_ACTIVATION_MESSAGE, 'error');
        return;
      }
      if (!eventTypeSchemaReady) {
        delete payload.eventType;
      }

      if (posterFile) {
        const uploadResponse = await eventService.uploadPoster(posterFile);
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.error?.message || 'Unable to upload image');
        }
        payload.poster_url = uploadResponse.data?.path || uploadResponse.data?.path || null;
      } else if (eventRecord?.poster_url) {
        payload.poster_url = eventRecord.poster_url;
      }

      const response = await eventService.updateEvent(id, payload);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update event');
      }

      addToast('Event updated successfully', 'success');
      navigate('/admin/events');
    } catch (error) {
      addToast(error.message || 'Unable to update event', 'error');
    } finally {
      setIsUploading(false);
    }
  }, (values) => {
    const rules = eventTypeSchemaReady || eventRecord?.event_type
      ? { ...formRules, eventType: [(val) => validators.required(val, 'Event Type')] }
      : formRules;
    return validateForm(values, rules);
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    let isMounted = true;

    const loadEvent = async () => {
      setLoading(true);
      try {
        const response = await eventService.getEventById(id);
        if (!isMounted) return;
        if (!response.success || !response.data) {
          setLoadError(response.error?.message || 'Event not found');
          return;
        }

        const eventData = response.data;
        setEventRecord(eventData);
        setFieldValue('title', eventData.title || '');
        setFieldValue('description', eventData.description || '');
        setFieldValue('eventType', eventData.event_type || '');
        setFieldValue('date', eventData.date || '');
        setFieldValue('time', eventData.time || '');
        setFieldValue('location', eventData.location || '');
        setFieldValue('registrationUrl', eventData.registrationUrl || eventData.registration_url || '');
        setFieldValue('registrationButtonText', eventData.registrationButtonText || eventData.registration_button_text || '');
        setFieldValue(
          'registrationEnabled',
          eventData.registrationEnabled ?? eventData.registration_enabled ?? true
        );
        setFieldValue(
          'registrationStatus',
          eventData.registrationStatus || eventData.registration_status || 'open'
        );
        setFieldValue('capacity', String(eventData.capacity || 0));
        setFieldValue('status', eventData.status || EVENT_STATUS.DRAFT);
        setFieldValue('featured', eventData.featured === true);
      } catch (error) {
        setLoadError(error?.message || 'Unable to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();

    return () => {
      isMounted = false;
    };
  }, [id, setFieldValue]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handlePosterFileChange = (file) => {
    setPosterFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-gray-800 bg-slate-950 p-8 text-white">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-red-700 bg-red-950/80 p-8 text-white">
        <h1 className="text-2xl font-semibold">Unable to load event</h1>
        <p className="mt-3 text-gray-300">{loadError}</p>
        <button
          type="button"
          onClick={() => navigate('/admin/events')}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Edit Event</h1>
          <p className="mt-2 text-sm text-gray-400">Update event details and save changes.</p>
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
            onSubmit={handleSubmit}
            eventTypes={[
              ...(!values.eventType ? [{ value: '', label: 'Not assigned — select a type' }] : []),
              ...EVENT_TYPE_OPTIONS,
            ]}
            eventTypeError={errors.eventType}
            eventTypeRequired={eventTypeSchemaReady || Boolean(eventRecord?.event_type)}
            eventTypeHelp={eventTypeSchemaReady
              ? 'Choose the event’s public classification.'
              : 'Existing records without a type remain unassigned. Changing this selection is disabled until the database schema is ready.'}
            statuses={STATUS_OPTIONS}
            isSubmitting={isSubmitting || isUploading}
            submitDisabled={!eventTypeSchemaReady && values.eventType !== (eventRecord?.event_type || '')}
            schemaNotice={!eventTypeSchemaReady
              ? `${EVENT_TYPE_SCHEMA_ACTIVATION_MESSAGE} Existing event types remain visible, and untyped records are not assigned automatically.`
              : null}
            submitLabel={isSubmitting || isUploading ? 'Saving...' : 'Update Event'}
            onCancel={() => navigate('/admin/events')}
          >
            <EventImageUploader
              previewUrl={posterFile ? previewUrl : getEventImageUrl(eventRecord?.poster_url)}
              fileName={posterFile?.name || eventRecord?.poster_url?.split('/').pop()}
              onFileChange={handlePosterFileChange}
            />
          </EventForm>
        </div>
      </div>
    </div>
  );
}
