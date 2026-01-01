import {
  UsersIcon,
  ServerIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../../components/StatCard';
import Card from '../../../components/Card';
import { useDataStore } from '../../../state/data';

export default function AdminDashboard() {
  const employees = useDataStore((s) => s.employees);
  const getStats = useDataStore((s) => s.getStats);
  const stats = getStats();

  const systemStats = [
    {
      title: 'Total Users',
      value: employees.length + 6, // employees + demo admin users
      icon: UsersIcon,
      iconBg: 'bg-blue-500',
      trend: 5,
    },
    {
      title: 'Active Sessions',
      value: 12,
      icon: ServerIcon,
      iconBg: 'bg-green-500',
      subtitle: 'Across all portals',
    },
    {
      title: 'Security Alerts',
      value: 0,
      icon: ShieldCheckIcon,
      iconBg: 'bg-purple-500',
      subtitle: 'All systems secure',
    },
    {
      title: 'Pending Issues',
      value: 2,
      icon: ExclamationTriangleIcon,
      iconBg: 'bg-yellow-500',
      subtitle: 'Requires attention',
    },
  ];

  const recentActivity = [
    { action: 'User login', user: 'Alice Smith', time: '2 minutes ago', status: 'success' },
    { action: 'Leave approved', user: 'HR Manager', time: '15 minutes ago', status: 'success' },
    { action: 'Password reset', user: 'Bob Ahmed', time: '1 hour ago', status: 'warning' },
    { action: 'New employee added', user: 'HR Manager', time: '3 hours ago', status: 'success' },
    { action: 'System backup', user: 'System', time: '6 hours ago', status: 'success' },
  ];

  const systemHealth = [
    { name: 'Database', status: 'Operational', uptime: '99.9%' },
    { name: 'Authentication', status: 'Operational', uptime: '100%' },
    { name: 'File Storage', status: 'Operational', uptime: '99.8%' },
    { name: 'Email Service', status: 'Degraded', uptime: '98.5%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-500">Monitor and manage HRMS system settings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-animate">
        {systemStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card title="Recent Activity" subtitle="Latest system events">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.status === 'success'
                      ? 'bg-green-500'
                      : activity.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">by {activity.user}</p>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* System Health */}
        <Card title="System Health" subtitle="Service status overview">
          <div className="space-y-4">
            {systemHealth.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {service.status === 'Operational' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="font-medium text-gray-900">{service.name}</span>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      service.status === 'Operational' ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {service.status}
                  </p>
                  <p className="text-xs text-gray-500">Uptime: {service.uptime}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-center">
            <UsersIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">Add User</p>
          </button>
          <button className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-center">
            <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">Security Scan</p>
          </button>
          <button className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-center">
            <ServerIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">Backup Data</p>
          </button>
          <button className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-center">
            <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">View Alerts</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
