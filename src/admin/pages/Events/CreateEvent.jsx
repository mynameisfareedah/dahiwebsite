import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useToast } from '../../hooks/useDataManagement';
import { EventForm } from '../../components/events/EventForm';
import { EventImageUploader } from '../../components/events/EventImageUploader';
import { validators, validateForm } from '../../utils/validation';
import { eventService } from '../../services/eventService';
import { EVENT_STATUS } from '../../../constants/status';

const CATEGORY_OPTIONS = [
  { value: 'health', label: 'Health' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'education', label: 'Education' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'webinar', label: 'Webinar' },
];

const STATUS_OPTIONS = [
  { value: EVENT_STATUS.DRAFT, label: 'Draft' },
  { value: EVENT_STATUS.PUBLISHED, label: 'Published' },
];

const initialFormValues = {
  title: '',
  description: '',
  category: 'health',
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

export default function CreateEvent() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [posterFile, setPosterFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(initialFormValues, async (formValues) => {
    setIsUploading(true);

    try {
      const payload = { ...formValues };

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
  }, (values) => validateForm(values, formRules));

  useEffect(() => {
    if (!posterFile) {
      setPreviewUrl(null);
      return undefined;
    }

    const url = URL.createObjectURL(posterFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [posterFile]);

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
            onSubmit={handleSubmit}
            categories={CATEGORY_OPTIONS}
            statuses={STATUS_OPTIONS}
            isSubmitting={isSubmitting || isUploading}
            submitLabel={isSubmitting || isUploading ? 'Saving...' : 'Create Event'}
            onCancel={() => navigate('/admin/events')}
          >
            <EventImageUploader
              previewUrl={previewUrl}
              fileName={posterFile?.name}
              onFileChange={setPosterFile}
            />
          </EventForm>
        </div>
      </div>
    </div>
  );
}
