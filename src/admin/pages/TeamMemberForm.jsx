import { FormCheckbox, FormInput, FormTextarea } from '../components/FormField';
import { FileUploader } from '../components/FileUploader';

export const EMPTY_TEAM_MEMBER = {
  full_name: '',
  role: '',
  bio: '',
  profile_image: '',
  email: '',
  linkedin_url: '',
  display_order: 0,
  featured: false,
  active: true,
};

export default function TeamMemberForm({
  values,
  onChange,
  onImageChange,
  onImageError,
  onSubmit,
  onCancel,
  isEditing,
  isSubmitting,
  error,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <p className="rounded border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      <FormInput label="Full Name" name="full_name" value={values.full_name} onChange={onChange} required />
      <FormInput label="Role" name="role" value={values.role} onChange={onChange} required />
      <FormTextarea label="Bio" name="bio" value={values.bio} onChange={onChange} rows={4} />
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Profile Image</label>
        <FileUploader onChange={onImageChange} onError={onImageError} accept="image/png,image/jpeg,image/webp" maxSize={5242880} disabled={isSubmitting} />
        {values.profile_image ? <p className="text-xs text-gray-400">An existing profile image will be kept unless a new image is selected.</p> : null}
      </div>
      <FormInput label="Email" type="email" name="email" value={values.email} onChange={onChange} />
      <FormInput label="LinkedIn URL" type="url" name="linkedin_url" value={values.linkedin_url} onChange={onChange} placeholder="https://www.linkedin.com/in/..." />
      <FormInput label="Display Order" type="number" min="0" name="display_order" value={values.display_order} onChange={onChange} />
      <FormCheckbox label="Featured team member" name="featured" checked={values.featured} onChange={onChange} />
      <FormCheckbox label="Visible on the public website" name="active" checked={values.active} onChange={onChange} />
      <div className="flex gap-3 border-t border-gray-700 pt-4">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="flex-1 rounded bg-gray-700 px-4 py-2 font-medium text-white transition hover:bg-gray-600 disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Member'}
        </button>
      </div>
    </form>
  );
}
