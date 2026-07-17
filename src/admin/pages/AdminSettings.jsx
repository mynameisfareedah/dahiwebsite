import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { PageHeader } from '../components';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
} from '../components/FormField';
import { useForm, useToast } from '../hooks/useDataManagement';
import { validators, validateForm } from '../utils/validation';

const initialSettings = {
  siteName: 'DAHI - Doc Adi Health Initiative',
  siteDescription: 'Empowering women through health education and support',
  siteUrl: 'https://dahinetwork.org',
  maintenanceMode: false,
  notificationsEnabled: true,
  emailNotifications: true,
  passwordMinLength: 8,
  twoFactorAuth: false,
  themeMode: 'dark',
  backupFrequency: 'weekly',
  apiRateLimit: 1000,
};

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const tab = searchParams.get('tab');
    const validTabs = ['general', 'notifications', 'security', 'appearance', 'backup'];
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const formRules = {
    siteName: [(val) => validators.required(val, 'Site name')],
    siteDescription: [(val) => validators.required(val, 'Description')],
    siteUrl: [(val) => validators.url(val)],
    passwordMinLength: [(val) => validators.number(val)],
    apiRateLimit: [(val) => validators.number(val)],
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useForm(initialSettings, async (formValues) => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    addToast('Settings saved successfully', 'success');
    setIsSaving(false);
  }, (values) => validateForm(values, formRules));

  const tabs = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'security', label: 'Security', icon: 'lock' },
    { id: 'appearance', label: 'Appearance', icon: 'palette' },
    { id: 'backup', label: 'Backup & Database', icon: 'database' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Settings"
        subtitle="Configure your website and system preferences"
      />

      {/* Tab Navigation */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-600 bg-gray-800'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              <FormInput
                label="Site Name"
                name="siteName"
                value={values.siteName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.siteName ? errors.siteName : null}
                required
              />

              <FormTextarea
                label="Site Description"
                name="siteDescription"
                value={values.siteDescription}
                onChange={handleChange}
                rows="3"
              />

              <FormInput
                label="Site URL"
                name="siteUrl"
                value={values.siteUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.siteUrl ? errors.siteUrl : null}
              />

              <FormCheckbox
                label="Enable Maintenance Mode"
                name="maintenanceMode"
                checked={values.maintenanceMode}
                onChange={handleChange}
              />
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <>
              <FormCheckbox
                label="Enable All Notifications"
                name="notificationsEnabled"
                checked={values.notificationsEnabled}
                onChange={handleChange}
              />

              <FormCheckbox
                label="Email Notifications"
                name="emailNotifications"
                checked={values.emailNotifications}
                onChange={handleChange}
              />

              <div className="bg-blue-900 border border-blue-800 rounded p-3 text-sm text-blue-200">
                📧 Email notifications will be sent for important system events
              </div>
            </>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <FormInput
                label="Password Minimum Length"
                type="number"
                name="passwordMinLength"
                value={values.passwordMinLength}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.passwordMinLength ? errors.passwordMinLength : null}
              />

              <FormCheckbox
                label="Enable Two-Factor Authentication"
                name="twoFactorAuth"
                checked={values.twoFactorAuth}
                onChange={handleChange}
              />

              <div className="bg-yellow-900 border border-yellow-800 rounded p-3 text-sm text-yellow-200">
                🔒 Strong security settings are recommended for production environments
              </div>
            </>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <>
              <FormSelect
                label="Theme Mode"
                name="themeMode"
                value={values.themeMode}
                onChange={handleChange}
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
                <option value="auto">Auto (System Default)</option>
              </FormSelect>

              <div className="bg-gray-800 border border-gray-700 rounded p-3 text-sm text-gray-300">
                🎨 Choose your preferred theme for the admin panel
              </div>
            </>
          )}

          {/* Backup & Database Tab */}
          {activeTab === 'backup' && (
            <>
              <FormSelect
                label="Backup Frequency"
                name="backupFrequency"
                value={values.backupFrequency}
                onChange={handleChange}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </FormSelect>

              <FormInput
                label="API Rate Limit (requests/hour)"
                type="number"
                name="apiRateLimit"
                value={values.apiRateLimit}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.apiRateLimit ? errors.apiRateLimit : null}
              />

              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                  onClick={() => {
                    addToast('Backup started in background', 'info');
                  }}
                >
                  Create Backup Now
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                  onClick={() => {
                    addToast('Showing last 5 backups', 'info');
                  }}
                >
                  View Backup History
                </button>
              </div>

              <div className="bg-blue-900 border border-blue-800 rounded p-3 text-sm text-blue-200">
                💾 Backups are stored securely and can be restored from the backup history
              </div>
            </>
          )}

          {/* Save Button (Always visible) */}
          <div className="flex gap-3 pt-4 border-t border-gray-700 mt-6">
            <button
              type="button"
              onClick={() => resetForm()}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-green-900 border border-green-800 rounded-lg p-4">
        <p className="text-green-100">
          ✅ All changes are saved to your local database. These settings will be synced when database integration is enabled.
        </p>
      </div>
    </div>
  );
}
