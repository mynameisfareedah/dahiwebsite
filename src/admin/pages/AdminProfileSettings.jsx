import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Lock, Loader2 } from 'lucide-react';
import { PageHeader } from '../components';
import { FormField, FormInput } from '../components/FormField';
import { LoadingSpinner } from '../components/LoadingState';
import { profileService } from '../services/profileService';
import { useToast } from '../contexts/ToastContext';

export default function AdminProfileSettings() {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [photoPreview, setPhotoPreview] = useState('');

  const initialValues = useMemo(
    () => ({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      job_title: profile?.job_title || '',
      department: profile?.department || '',
      theme: profile?.theme || 'light',
      timezone: profile?.timezone || '',
      language: profile?.language || '',
      email_notifications: Boolean(profile?.email_notifications),
      contact_notifications: Boolean(profile?.contact_notifications),
      event_notifications: Boolean(profile?.event_notifications),
    }),
    [profile]
  );

  const [formValues, setFormValues] = useState(initialValues);

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const result = await profileService.getProfile();
        if (!mounted) return;

        if (result.success) {
          setProfile(result.data || null);
          setPhotoPreview(result.data?.profile_photo || '');
        } else {
          addToast(result.error?.message || 'Unable to load profile.', 'error');
        }
      } catch (error) {
        addToast(error?.message || 'Unable to load profile.', 'error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [addToast]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const result = await profileService.updateProfile({
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        phone: formValues.phone,
        job_title: formValues.job_title,
        department: formValues.department,
        theme: formValues.theme,
        timezone: formValues.timezone,
        language: formValues.language,
        email_notifications: formValues.email_notifications,
        contact_notifications: formValues.contact_notifications,
        event_notifications: formValues.event_notifications,
      });

      if (result.success) {
        setProfile(result.data || profile);
        addToast('Profile updated successfully.', 'success');
      } else {
        addToast(result.error?.message || 'Unable to save profile.', 'error');
      }
    } catch (error) {
      addToast(error?.message || 'Unable to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoPick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingPhoto(true);
    try {
      const result = await profileService.uploadProfilePhoto(file);
      if (result.success) {
        setPhotoPreview(result.data || '');
        addToast('Profile photo uploaded successfully.', 'success');
      } else {
        addToast(result.error?.message || 'Unable to upload profile photo.', 'error');
      }
    } catch (error) {
      addToast(error?.message || 'Unable to upload profile photo.', 'error');
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    if (!passwords.newPassword) {
      addToast('Please enter a new password.', 'error');
      return;
    }

    setPasswordSaving(true);
    try {
      const result = await profileService.changePassword(passwords.newPassword);
      if (result.success) {
        addToast('Password updated successfully.', 'success');
        setPasswords({ newPassword: '', confirmPassword: '' });
      } else {
        addToast(result.error?.message || 'Unable to update password.', 'error');
      }
    } catch (error) {
      addToast(error?.message || 'Unable to update password.', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <PageHeader title="Profile Settings" subtitle="Manage your admin profile information." />
        <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
          <LoadingSpinner size="lg" text="Loading your profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <PageHeader title="Profile Settings" subtitle="Manage your admin profile information." />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSave} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button type="button" onClick={handlePhotoPick} className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-gray-100 text-gray-500 hover:border-blue-500 hover:text-blue-600">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <Camera size={24} />
                )}
                <span className="absolute bottom-1 right-1 rounded-full bg-blue-600 p-2 text-white">
                  <Camera size={14} />
                </span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Profile Photo</h2>
                <p className="text-sm text-gray-500">Click the photo to upload a new image.</p>
                {uploadingPhoto ? <p className="mt-2 text-sm text-blue-600">Uploading photo...</p> : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormInput label="First Name" name="first_name" value={formValues.first_name} onChange={handleChange} />
              <FormInput label="Last Name" name="last_name" value={formValues.last_name} onChange={handleChange} />
              <FormInput label="Email" name="email" value={formValues.email} onChange={handleChange} disabled readOnly />
              <FormInput label="Phone" name="phone" value={formValues.phone} onChange={handleChange} />
              <FormInput label="Job Title" name="job_title" value={formValues.job_title} onChange={handleChange} />
              <FormInput label="Department" name="department" value={formValues.department} onChange={handleChange} />
              <FormInput label="Theme" name="theme" value={formValues.theme} onChange={handleChange} />
              <FormInput label="Timezone" name="timezone" value={formValues.timezone} onChange={handleChange} />
              <FormInput label="Language" name="language" value={formValues.language} onChange={handleChange} />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Notification Preferences</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                  <input type="checkbox" name="email_notifications" checked={formValues.email_notifications} onChange={handleChange} className="h-4 w-4 rounded border-gray-300" />
                  Email notifications
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                  <input type="checkbox" name="contact_notifications" checked={formValues.contact_notifications} onChange={handleChange} className="h-4 w-4 rounded border-gray-300" />
                  Contact notifications
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                  <input type="checkbox" name="event_notifications" checked={formValues.event_notifications} onChange={handleChange} className="h-4 w-4 rounded border-gray-300" />
                  Event notifications
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            </div>
            <form onSubmit={handlePasswordUpdate} className="mt-4 space-y-4">
              <FormField label="New Password">
                <input type="password" name="newPassword" value={passwords.newPassword} onChange={(event) => setPasswords((prev) => ({ ...prev, newPassword: event.target.value }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500" />
              </FormField>
              <FormField label="Confirm Password">
                <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={(event) => setPasswords((prev) => ({ ...prev, confirmPassword: event.target.value }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500" />
              </FormField>
              <button type="submit" disabled={passwordSaving} className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {passwordSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
