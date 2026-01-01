import { useState } from 'react';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import FormField from '../../../components/FormField';
import {
  Cog6ToothIcon,
  BellIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserCircleIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'preferences', label: 'Preferences', icon: Cog6ToothIcon },
];

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Profile settings
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+92-300-1234567',
    office: 'Block A, Room 101',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    leaveRequests: true,
    attendanceAlerts: true,
    weeklyReports: true,
    systemUpdates: false,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    defaultView: 'dashboard',
    itemsPerPage: '10',
    dateFormat: 'dd/MM/yyyy',
    autoApproveLeaves: false,
  });

  const handleSave = () => {
    // Simulate save
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">Manage your portal preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card title="Profile Information" subtitle="Your personal information">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || 'D'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-gray-500">Dean - Faculty of {user?.faculty}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Full Name">
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
              <FormField label="Email">
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
              <FormField label="Phone">
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
              <FormField label="Office">
                <input
                  type="text"
                  value={profile.office}
                  onChange={(e) => setProfile({ ...profile, office: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Changes'}</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card title="Notification Preferences" subtitle="Control what notifications you receive">
          <div className="space-y-4">
            {[
              {
                key: 'emailAlerts',
                label: 'Email Alerts',
                desc: 'Receive important updates via email',
              },
              {
                key: 'leaveRequests',
                label: 'Leave Requests',
                desc: 'Get notified when staff submit leave requests',
              },
              {
                key: 'attendanceAlerts',
                label: 'Attendance Alerts',
                desc: 'Alerts for unusual attendance patterns',
              },
              {
                key: 'weeklyReports',
                label: 'Weekly Reports',
                desc: 'Receive weekly summary reports',
              },
              {
                key: 'systemUpdates',
                label: 'System Updates',
                desc: 'Notifications about system changes',
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Preferences'}</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card title="Portal Preferences" subtitle="Customize your portal experience">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Default View">
                <select
                  value={preferences.defaultView}
                  onChange={(e) => setPreferences({ ...preferences, defaultView: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="employees">Faculty Staff</option>
                  <option value="attendance">Attendance</option>
                  <option value="leaves">Leave Requests</option>
                </select>
              </FormField>
              <FormField label="Items Per Page">
                <select
                  value={preferences.itemsPerPage}
                  onChange={(e) => setPreferences({ ...preferences, itemsPerPage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10 items</option>
                  <option value="25">25 items</option>
                  <option value="50">50 items</option>
                  <option value="100">100 items</option>
                </select>
              </FormField>
              <FormField label="Date Format">
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                </select>
              </FormField>
            </div>

            <div className="p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Auto-approve Leaves</p>
                  <p className="text-sm text-gray-500">
                    Automatically approve leave requests under 2 days
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.autoApproveLeaves}
                    onChange={(e) =>
                      setPreferences({ ...preferences, autoApproveLeaves: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Preferences'}</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
