import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../state/auth';
import { useDataStore } from '../../../state/data';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const { payrollSettings, updatePayrollSettings } = useDataStore();

  // Mock settings state
  const [settings, setSettings] = useState({
    // Attendance Settings
    workStartTime: '09:00',
    workEndTime: '17:00',
    lateThreshold: 15, // minutes
    halfDayThreshold: 4, // hours
    overtimeStartAfter: 8, // hours
    overtimeWarningHours: payrollSettings?.operationalConfig?.overtimeWarningHours || 40,
    expiryHorizonDays: payrollSettings?.operationalConfig?.expiryHorizonDays || 30,

    // Leave Settings
    annualLeaveQuota: 20,
    sickLeaveQuota: 12,
    casualLeaveQuota: 10,
    maxConsecutiveDays: 14,
    minAdvanceNotice: 3, // days

    // Payroll Settings
    workingDays: payrollSettings?.workingDays || 22,
    latePenalty: payrollSettings?.deductionConfig?.latePenalty || 500,
    absentPenalty: payrollSettings?.deductionConfig?.absentPenaltyType || 'daily_rate',
    absentPenaltyValue: payrollSettings?.deductionConfig?.absentPenaltyValue || 0,
    overtimeRate: payrollSettings?.overtimeRate || 1.5,
    taxThreshold: payrollSettings?.deductionConfig?.taxThreshold || 100000,
    taxRate: payrollSettings?.deductionConfig?.taxRate || 5,
    housePercent: payrollSettings?.allowanceConfig?.housePercent || 45,
    medicalPercent: payrollSettings?.allowanceConfig?.medicalPercent || 10,
    transportFixed: payrollSettings?.allowanceConfig?.transportFixed || 5000,

    // Notification Settings
    emailNotifications: true,
    leaveApprovalNotify: true,
    attendanceAlerts: true,
    payrollNotify: true,
    systemAnnouncements: true,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updatePayrollSettings({
      workingDays: settings.workingDays,
      overtimeRate: settings.overtimeRate,
      allowanceConfig: {
        housePercent: settings.housePercent,
        medicalPercent: settings.medicalPercent,
        transportFixed: settings.transportFixed,
      },
      deductionConfig: {
        latePenalty: settings.latePenalty,
        absentPenaltyType: settings.absentPenalty,
        absentPenaltyValue: settings.absentPenaltyValue,
        taxThreshold: settings.taxThreshold,
        taxRate: settings.taxRate,
      },
      operationalConfig: {
        overtimeWarningHours: settings.overtimeWarningHours,
        expiryHorizonDays: settings.expiryHorizonDays,
      },
    });
    alert('Settings saved successfully!');
  };

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      workingDays: payrollSettings?.workingDays || prev.workingDays,
      latePenalty: payrollSettings?.deductionConfig?.latePenalty || prev.latePenalty,
      absentPenalty: payrollSettings?.deductionConfig?.absentPenaltyType || prev.absentPenalty,
      absentPenaltyValue:
        payrollSettings?.deductionConfig?.absentPenaltyValue ?? prev.absentPenaltyValue,
      overtimeRate: payrollSettings?.overtimeRate || prev.overtimeRate,
      taxThreshold: payrollSettings?.deductionConfig?.taxThreshold || prev.taxThreshold,
      taxRate: payrollSettings?.deductionConfig?.taxRate || prev.taxRate,
      housePercent: payrollSettings?.allowanceConfig?.housePercent || prev.housePercent,
      medicalPercent: payrollSettings?.allowanceConfig?.medicalPercent || prev.medicalPercent,
      transportFixed: payrollSettings?.allowanceConfig?.transportFixed || prev.transportFixed,
      overtimeWarningHours:
        payrollSettings?.operationalConfig?.overtimeWarningHours ?? prev.overtimeWarningHours,
      expiryHorizonDays:
        payrollSettings?.operationalConfig?.expiryHorizonDays ?? prev.expiryHorizonDays,
    }));
  }, [payrollSettings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Settings</h1>
          <p className="text-gray-600">Configure HR policies and system settings</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Cog6ToothIcon className="w-5 h-5" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave Policy</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              Attendance Settings
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Start Time
                </label>
                <input
                  type="time"
                  value={settings.workStartTime}
                  onChange={(e) => handleChange('workStartTime', e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work End Time
                </label>
                <input
                  type="time"
                  value={settings.workEndTime}
                  onChange={(e) => handleChange('workEndTime', e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Late Threshold (minutes)
                </label>
                <input
                  type="number"
                  value={settings.lateThreshold}
                  onChange={(e) => handleChange('lateThreshold', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Employees arriving after this many minutes will be marked late
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Half Day Threshold (hours)
                </label>
                <input
                  type="number"
                  value={settings.halfDayThreshold}
                  onChange={(e) => handleChange('halfDayThreshold', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Working less than this counts as half day
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Starts After (hours)
                </label>
                <input
                  type="number"
                  value={settings.overtimeStartAfter}
                  onChange={(e) => handleChange('overtimeStartAfter', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Warning Threshold (hours/month)
                </label>
                <input
                  type="number"
                  value={settings.overtimeWarningHours}
                  onChange={(e) => handleChange('overtimeWarningHours', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Dashboard warning when exceeded</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Horizon (days)
                </label>
                <input
                  type="number"
                  value={settings.expiryHorizonDays}
                  onChange={(e) => handleChange('expiryHorizonDays', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Show upcoming probation/contract expiries
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-gray-400" />
              Leave Policy Settings
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Leave Quota (days)
                </label>
                <input
                  type="number"
                  value={settings.annualLeaveQuota}
                  onChange={(e) => handleChange('annualLeaveQuota', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sick Leave Quota (days)
                </label>
                <input
                  type="number"
                  value={settings.sickLeaveQuota}
                  onChange={(e) => handleChange('sickLeaveQuota', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Casual Leave Quota (days)
                </label>
                <input
                  type="number"
                  value={settings.casualLeaveQuota}
                  onChange={(e) => handleChange('casualLeaveQuota', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Consecutive Days
                </label>
                <input
                  type="number"
                  value={settings.maxConsecutiveDays}
                  onChange={(e) => handleChange('maxConsecutiveDays', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum consecutive days for single leave request
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Advance Notice (days)
                </label>
                <input
                  type="number"
                  value={settings.minAdvanceNotice}
                  onChange={(e) => handleChange('minAdvanceNotice', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Except for sick leave</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              Payroll Settings
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
                <input
                  type="number"
                  value={settings.workingDays}
                  onChange={(e) => handleChange('workingDays', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Used for daily-rate calculations</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Late Penalty (PKR)
                </label>
                <input
                  type="number"
                  value={settings.latePenalty}
                  onChange={(e) => handleChange('latePenalty', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Deduction per late arrival</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Absent Penalty
                </label>
                <select
                  value={settings.absentPenalty}
                  onChange={(e) => handleChange('absentPenalty', e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="daily_rate">Daily Rate (Salary / working days)</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="none">No Deduction</option>
                </select>
              </div>
              {settings.absentPenalty === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Absent Penalty (PKR)
                  </label>
                  <input
                    type="number"
                    value={settings.absentPenaltyValue}
                    onChange={(e) => handleChange('absentPenaltyValue', parseInt(e.target.value))}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Rate (multiplier)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.overtimeRate}
                  onChange={(e) => handleChange('overtimeRate', parseFloat(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">1.5 = 150% of hourly rate</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House Allowance (%)
                </label>
                <input
                  type="number"
                  value={settings.housePercent}
                  onChange={(e) => handleChange('housePercent', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Allowance (%)
                </label>
                <input
                  type="number"
                  value={settings.medicalPercent}
                  onChange={(e) => handleChange('medicalPercent', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transport Allowance (PKR)
                </label>
                <input
                  type="number"
                  value={settings.transportFixed}
                  onChange={(e) => handleChange('transportFixed', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Threshold (PKR)
                </label>
                <input
                  type="number"
                  value={settings.taxThreshold}
                  onChange={(e) => handleChange('taxThreshold', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Income above this is taxed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleChange('taxRate', parseInt(e.target.value))}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BellIcon className="w-5 h-5 text-gray-400" />
              Notification Settings
            </h3>
            <div className="space-y-4">
              {[
                {
                  key: 'emailNotifications',
                  label: 'Email Notifications',
                  desc: 'Send notifications via email',
                },
                {
                  key: 'leaveApprovalNotify',
                  label: 'Leave Approval Alerts',
                  desc: 'Notify when leaves are approved/rejected',
                },
                {
                  key: 'attendanceAlerts',
                  label: 'Attendance Alerts',
                  desc: 'Send alerts for late arrivals and absences',
                },
                {
                  key: 'payrollNotify',
                  label: 'Payroll Notifications',
                  desc: 'Notify employees when payroll is processed',
                },
                {
                  key: 'systemAnnouncements',
                  label: 'System Announcements',
                  desc: 'Show system-wide announcements',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleChange(item.key, !settings[item.key])}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings[item.key] ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        settings[item.key] ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BuildingOffice2Icon className="w-5 h-5 text-gray-400" />
                Organization Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    defaultValue="CECOS University"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    rows={2}
                    defaultValue="F-5, Phase 6, Hayatabad, Peshawar"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    defaultValue="info@cecos.edu.pk"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Force Password Change</p>
                    <p className="text-sm text-gray-500">Require password change every 90 days</p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Require 2FA for admin users</p>
                  </div>
                  <Badge variant="warning">Optional</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Session Timeout</p>
                    <p className="text-sm text-gray-500">Auto logout after inactivity</p>
                  </div>
                  <Badge variant="primary">30 min</Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
