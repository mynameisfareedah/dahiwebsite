import { useState } from 'react';
import SectionHeader from '../../components/admin/SectionHeader';
import { saveCollection, loadCollection } from '../../utils/adminData';

function AdminSettingsPage() {
  const [settings, setSettings] = useState(() => loadCollection('dahi-settings', {
    organizationName: 'DAHI',
    contactEmail: 'hello@dahi.org',
    phone: '+234 000 000 0000',
    socialLinks: { instagram: '', facebook: '', x: '' },
    footerContent: 'DAHI — Empowering Muslim Women Through Trusted Health Education.',
    metadata: { title: 'DAHI', description: 'Trusted health education for Muslim women.' },
  }));

  const handleChange = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    saveCollection('dahi-settings', settings);
    alert('Settings saved locally.');
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="Settings" description="Manage organization profile and website configuration." action={<button onClick={handleSave} className="rounded-full bg-dahiPrimary px-5 py-2.5 text-sm font-semibold text-white">Save settings</button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Organization details</h3>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              <span className="mb-2 block">Organization Name</span>
              <input value={settings.organizationName || ''} onChange={(event) => handleChange('organizationName', event.target.value)} className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" />
            </label>
            <label className="block text-sm font-medium">
              <span className="mb-2 block">Contact Email</span>
              <input value={settings.contactEmail || ''} onChange={(event) => handleChange('contactEmail', event.target.value)} className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" />
            </label>
            <label className="block text-sm font-medium">
              <span className="mb-2 block">Phone</span>
              <input value={settings.phone || ''} onChange={(event) => handleChange('phone', event.target.value)} className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" />
            </label>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Metadata and footer</h3>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              <span className="mb-2 block">Website Title</span>
              <input value={settings.metadata?.title || ''} onChange={(event) => handleChange('metadata', { ...settings.metadata, title: event.target.value })} className="w-full rounded-full border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary" />
            </label>
            <label className="block text-sm font-medium">
              <span className="mb-2 block">Meta Description</span>
              <textarea value={settings.metadata?.description || ''} onChange={(event) => handleChange('metadata', { ...settings.metadata, description: event.target.value })} rows="4" className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"></textarea>
            </label>
            <label className="block text-sm font-medium">
              <span className="mb-2 block">Footer Content</span>
              <textarea value={settings.footerContent || ''} onChange={(event) => handleChange('footerContent', event.target.value)} rows="4" className="w-full rounded-[1.25rem] border border-slate-200 px-4 py-3 outline-none focus:border-dahiPrimary"></textarea>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettingsPage;
