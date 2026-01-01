import { useState } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { Cog6ToothIcon, CheckIcon, BellIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function FinanceSettings() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReport: true,
    approvalReminder: true,
  });

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage finance portal preferences</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <BellIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Email Alerts</p>
              <p className="text-sm text-gray-600">Get notified for new requests</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={() => handleToggle('emailAlerts')}
                className="w-5 h-5 rounded"
              />
              {notifications.emailAlerts && <Badge variant="success">On</Badge>}
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Weekly Report</p>
              <p className="text-sm text-gray-600">Receive weekly summary report</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weeklyReport}
                onChange={() => handleToggle('weeklyReport')}
                className="w-5 h-5 rounded"
              />
              {notifications.weeklyReport && <Badge variant="success">On</Badge>}
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">Approval Reminders</p>
              <p className="text-sm text-gray-600">Reminder for pending approvals</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.approvalReminder}
                onChange={() => handleToggle('approvalReminder')}
                className="w-5 h-5 rounded"
              />
              {notifications.approvalReminder && <Badge variant="success">On</Badge>}
            </label>
          </div>
        </div>
      </Card>

      {/* System Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Cog6ToothIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Default Approval Threshold
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>PKR 50,000</option>
              <option>PKR 100,000</option>
              <option>PKR 500,000</option>
              <option>No limit</option>
            </select>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-2">Processing Days</label>
            <input
              type="number"
              defaultValue="5"
              min="1"
              max="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Target days to process requests</p>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Security</h2>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Two-factor authentication is enabled for all finance accounts.
          </p>
          <Button variant="outline" size="sm">
            Change Password
          </Button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} className="gap-2">
          <CheckIcon className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
