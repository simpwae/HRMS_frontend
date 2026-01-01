import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { FunnelIcon, ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import InputWithIcon from '../../../components/InputWithIcon';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';

// Generate mock audit logs
const generateAuditLogs = () => {
  const actions = [
    { action: 'User Login', category: 'Authentication', severity: 'info' },
    { action: 'User Logout', category: 'Authentication', severity: 'info' },
    { action: 'Employee Created', category: 'Employee', severity: 'info' },
    { action: 'Employee Updated', category: 'Employee', severity: 'info' },
    { action: 'Employee Deleted', category: 'Employee', severity: 'warning' },
    { action: 'Leave Approved', category: 'Leave', severity: 'success' },
    { action: 'Leave Rejected', category: 'Leave', severity: 'warning' },
    { action: 'Password Changed', category: 'Security', severity: 'info' },
    { action: 'Settings Updated', category: 'System', severity: 'info' },
    { action: 'Failed Login Attempt', category: 'Security', severity: 'danger' },
    { action: 'Role Changed', category: 'Security', severity: 'warning' },
    { action: 'Data Export', category: 'Data', severity: 'info' },
  ];

  const users = ['Admin', 'Sarah Khan', 'Dr. Ahmad Malik', 'System', 'Alice Smith'];
  const logs = [];

  for (let i = 0; i < 50; i++) {
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomDate = subDays(new Date(), Math.floor(Math.random() * 30));
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);

    logs.push({
      id: `log-${i}`,
      ...randomAction,
      user: randomUser,
      timestamp: new Date(randomDate.setHours(randomHour, randomMinute)),
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      details: `${randomAction.action} performed successfully`,
    });
  }

  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

const auditLogs = generateAuditLogs();

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const categories = ['all', 'Authentication', 'Employee', 'Leave', 'Security', 'System', 'Data'];
  const severities = ['all', 'info', 'success', 'warning', 'danger'];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getSeverityBadgeVariant = (severity) => {
    switch (severity) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Track all system activities and changes</p>
        </div>
        <Button variant="secondary">
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export Logs
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <InputWithIcon
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              inputClassName="pr-4 py-2"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
          >
            {severities.map((sev) => (
              <option key={sev} value={sev}>
                {sev === 'all' ? 'All Severities' : sev.charAt(0).toUpperCase() + sev.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.slice(0, 20).map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {format(log.timestamp, 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500">{log.details}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{log.user}</td>
                  <td className="px-4 py-3">
                    <Badge variant="default">{log.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getSeverityBadgeVariant(log.severity)}>{log.severity}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No logs found matching your filters.
          </div>
        )}

        {filteredLogs.length > 20 && (
          <div className="mt-4 text-center">
            <Button variant="secondary">Load More</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
