import { useState } from 'react';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import FormField from '../../../components/FormField';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserCircleIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'preferences', label: 'Preferences', icon: Cog6ToothIcon },
  { id: 'security', label: 'Security', icon: ShieldCheckIcon },
];

export default function VPSettings() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+92-300-1234567',
    office: 'Executive Block, Room 001',
    title: 'Vice President',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    institutionalUpdates: true,
    hrReports: true,
    weeklyDigest: true,
    monthlyAnalytics: true,
    systemAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    defaultView: 'dashboard',
    dashboardLayout: 'executive',
    reportFormat: 'detailed',
    dateFormat: 'dd/MM/yyyy',
    currency: 'USD',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">Manage your executive portal preferences</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card title="Profile Information" subtitle="Your executive profile details">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || 'VP'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-gray-500">{profile.title} - CECOS University</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Full Name">
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </FormField>
              <FormField label="Title">
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </FormField>
              <FormField label="Email">
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </FormField>
              <FormField label="Phone">
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </FormField>
              <FormField label="Office" className="md:col-span-2">
                <input
                  type="text"
                  value={profile.office}
                  onChange={(e) => setProfile({ ...profile, office: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </FormField>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Changes'}</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card title="Notification Preferences" subtitle="Control executive notifications">
          <div className="space-y-4">
            {[
              { key: 'emailAlerts', label: 'Email Alerts', desc: 'Critical updates via email' },
              {
                key: 'institutionalUpdates',
                label: 'Institutional Updates',
                desc: 'University-wide announcements',
              },
              { key: 'hrReports', label: 'HR Reports', desc: 'HR department summaries' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly performance summary' },
              {
                key: 'monthlyAnalytics',
                label: 'Monthly Analytics',
                desc: 'Monthly analytics reports',
              },
              {
                key: 'systemAlerts',
                label: 'System Alerts',
                desc: 'Technical and system notifications',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) =>
                      setNotifications({ ...notifications, [item.key]: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Preferences'}</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card title="Portal Preferences" subtitle="Customize your executive experience">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Default View">
                <select
                  value={preferences.defaultView}
                  onChange={(e) => setPreferences({ ...preferences, defaultView: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="analytics">Analytics</option>
                  <option value="reports">Reports</option>
                  <option value="employees">Employees</option>
                </select>
              </FormField>
              <FormField label="Dashboard Layout">
                <select
                  value={preferences.dashboardLayout}
                  onChange={(e) =>
                    setPreferences({ ...preferences, dashboardLayout: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="executive">Executive Summary</option>
                  <option value="detailed">Detailed View</option>
                  <option value="compact">Compact View</option>
                </select>
              </FormField>
              <FormField label="Report Format">
                <select
                  value={preferences.reportFormat}
                  onChange={(e) => setPreferences({ ...preferences, reportFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="detailed">Detailed</option>
                  <option value="summary">Summary</option>
                  <option value="visual">Visual Heavy</option>
                </select>
              </FormField>
              <FormField label="Date Format">
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                </select>
              </FormField>
              <FormField label="Currency Display">
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (₨)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </FormField>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Preferences'}</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card title="Security Settings" subtitle="Manage your account security">
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Active Sessions</p>
                  <p className="text-sm text-gray-500">Manage your active login sessions</p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Login History</p>
                  <p className="text-sm text-gray-500">View recent login activity</p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
