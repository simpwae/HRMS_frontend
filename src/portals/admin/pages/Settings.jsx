import { useState } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Tabs from '../../../components/Tabs';
import { useDataStore } from '../../../state/data';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const { resetData } = useDataStore();

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'integrations', label: 'Integrations' },
  ];

  const handleResetData = () => {
    if (
      window.confirm('Are you sure you want to reset all data to defaults? This cannot be undone.')
    ) {
      resetData();
      alert('Data has been reset to defaults.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500">Configure HRMS system preferences</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card title="Organization Info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  defaultValue="CECOS University"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  defaultValue="https://cecos.edu.pk"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  defaultValue="info@cecos.edu.pk"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue="+92-91-1234567"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                rows={3}
                defaultValue="F-5 Phase 6, Hayatabad, Peshawar, KPK, Pakistan"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
              />
            </div>
          </Card>

          <Card title="Working Hours">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Start Time
                </label>
                <input
                  type="time"
                  defaultValue="09:00"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work End Time
                </label>
                <input
                  type="time"
                  defaultValue="17:00"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Late Threshold (minutes)
                </label>
                <input
                  type="number"
                  defaultValue="15"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (day, i) => (
                    <label
                      key={day}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={i < 5}
                        className="rounded text-[hsl(var(--color-primary))]"
                      />
                      <span className="text-sm">{day}</span>
                    </label>
                  ),
                )}
              </div>
            </div>
          </Card>

          <Card title="Leave Configuration">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Leave (days/year)
                </label>
                <input
                  type="number"
                  defaultValue="20"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sick Leave (days/year)
                </label>
                <input
                  type="number"
                  defaultValue="12"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Casual Leave (days/year)
                </label>
                <input
                  type="number"
                  defaultValue="10"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card title="Password Policy">
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Minimum Password Length</p>
                  <p className="text-sm text-gray-500">Require at least 8 characters</p>
                </div>
                <input
                  type="number"
                  defaultValue="8"
                  className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-center"
                />
              </label>
              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Require Special Characters</p>
                  <p className="text-sm text-gray-500">At least one special character (!@#$%)</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded text-[hsl(var(--color-primary))]"
                />
              </label>
              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Password Expiry</p>
                  <p className="text-sm text-gray-500">Force password reset every 90 days</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded text-[hsl(var(--color-primary))]"
                />
              </label>
            </div>
          </Card>

          <Card title="Session Settings">
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Session Timeout (minutes)</p>
                  <p className="text-sm text-gray-500">Auto logout after inactivity</p>
                </div>
                <input
                  type="number"
                  defaultValue="30"
                  className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-center"
                />
              </label>
              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Single Session Only</p>
                  <p className="text-sm text-gray-500">Prevent multiple simultaneous logins</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded text-[hsl(var(--color-primary))]"
                />
              </label>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button>Save Security Settings</Button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card title="Email Notifications">
            <div className="space-y-4">
              {[
                { title: 'Leave Request Submitted', desc: 'Notify HR when leave is applied' },
                { title: 'Leave Approved/Rejected', desc: 'Notify employee of leave decision' },
                { title: 'New Employee Added', desc: 'Notify HR and Admin' },
                { title: 'Attendance Alert', desc: 'Notify when late or absent' },
                { title: 'Payroll Processed', desc: 'Notify employees of salary credit' },
              ].map((item, i) => (
                <label
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded text-[hsl(var(--color-primary))]"
                  />
                </label>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button>Save Notification Settings</Button>
          </div>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <Card title="Connected Services">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    MS
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Microsoft 365</p>
                    <p className="text-sm text-gray-500">Calendar and email integration</p>
                  </div>
                </div>
                <Button variant="secondary" className="text-sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold">
                    WA
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">WhatsApp Business</p>
                    <p className="text-sm text-gray-500">Notification delivery</p>
                  </div>
                </div>
                <Button variant="outline" className="text-sm">
                  Connect
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    BM
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Biometric System</p>
                    <p className="text-sm text-gray-500">Attendance hardware integration</p>
                  </div>
                </div>
                <Button variant="outline" className="text-sm">
                  Connect
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Data Management" className="border-red-200">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Reset all data to default values. This will remove all employees, attendance
                records, and leave requests. This action cannot be undone.
              </p>
              <Button variant="danger" onClick={handleResetData}>
                Reset All Data
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
