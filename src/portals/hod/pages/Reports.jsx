import { useState, useMemo } from 'react';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { format, subMonths, parseISO } from 'date-fns';
import Papa from 'papaparse';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const REPORT_TYPES = [
  { id: 'overview', label: 'Overview', icon: DocumentChartBarIcon },
  { id: 'attendance', label: 'Attendance', icon: ClockIcon },
  { id: 'leaves', label: 'Leaves', icon: CalendarDaysIcon },
];

export default function Reports() {
  const employees = useDataStore((s) => s.employees);
  const attendance = useDataStore((s) => s.attendance);
  const leaves = useDataStore((s) => s.leaves);
  const user = useAuthStore((s) => s.user);

  const [activeReport, setActiveReport] = useState('overview');

  // Filter data for department
  const deptEmployees = useMemo(
    () => employees.filter((e) => e.department === user.department),
    [employees, user.department],
  );

  const deptEmployeeIds = useMemo(() => new Set(deptEmployees.map((e) => e.id)), [deptEmployees]);

  const deptAttendance = useMemo(
    () => attendance.filter((a) => deptEmployeeIds.has(a.employeeId)),
    [attendance, deptEmployeeIds],
  );

  const deptLeaves = useMemo(
    () => leaves.filter((l) => deptEmployeeIds.has(l.employeeId)),
    [leaves, deptEmployeeIds],
  );

  // Designation distribution
  const designationData = useMemo(() => {
    const desigCount = {};
    deptEmployees.forEach((emp) => {
      desigCount[emp.designation] = (desigCount[emp.designation] || 0) + 1;
    });
    return Object.entries(desigCount).map(([name, value]) => ({ name, value }));
  }, [deptEmployees]);

  // Monthly attendance trend
  const monthlyAttendance = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStr = format(monthDate, 'MMM yyyy');
      const monthRecords = deptAttendance.filter((a) => {
        const recordDate = parseISO(a.date);
        return format(recordDate, 'MMM yyyy') === monthStr;
      });

      const present = monthRecords.filter((r) => r.status === 'Present').length;
      const total = monthRecords.length;

      months.push({
        month: format(monthDate, 'MMM'),
        present,
        absent: monthRecords.filter((r) => r.status === 'Absent').length,
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
      });
    }
    return months;
  }, [deptAttendance]);

  // Leave statistics
  const leavesByType = useMemo(() => {
    const typeCount = {};
    deptLeaves.forEach((leave) => {
      typeCount[leave.type] = (typeCount[leave.type] || 0) + 1;
    });
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  }, [deptLeaves]);

  const leaveStats = useMemo(
    () => ({
      pending: deptLeaves.filter((l) => l.status === 'Pending').length,
      approved: deptLeaves.filter((l) => l.status === 'Approved').length,
      rejected: deptLeaves.filter((l) => l.status === 'Rejected').length,
    }),
    [deptLeaves],
  );

  const handleExport = (type) => {
    let data = [];
    let filename = '';

    switch (type) {
      case 'employees':
        data = deptEmployees.map((e) => ({
          Code: e.code,
          Name: e.name,
          Designation: e.designation,
          Status: e.status,
        }));
        filename = 'department_employees';
        break;
      case 'attendance':
        data = deptAttendance.map((a) => ({
          Employee: employees.find((e) => e.id === a.employeeId)?.name || 'Unknown',
          Date: a.date,
          Status: a.status,
          CheckIn: a.checkIn || '-',
          CheckOut: a.checkOut || '-',
        }));
        filename = 'department_attendance';
        break;
      case 'leaves':
        data = deptLeaves.map((l) => ({
          Employee: employees.find((e) => e.id === l.employeeId)?.name || 'Unknown',
          Type: l.type,
          From: l.from,
          To: l.to,
          Status: l.status,
        }));
        filename = 'department_leaves';
        break;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Department Reports</h2>
          <p className="text-gray-500 mt-1">Analytics for {user.department}</p>
        </div>
        <Button variant="outline" onClick={() => handleExport('employees')}>
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {REPORT_TYPES.map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeReport === report.id
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <report.icon className="w-4 h-4" />
            {report.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeReport === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <UsersIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{deptEmployees.length}</p>
                  <p className="text-xs text-gray-500">Total Staff</p>
                </div>
              </div>
            </div>
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyAttendance.length > 0
                      ? `${monthlyAttendance[monthlyAttendance.length - 1].rate}%`
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">Attendance Rate</p>
                </div>
              </div>
            </div>
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <CalendarDaysIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{leaveStats.pending}</p>
                  <p className="text-xs text-gray-500">Pending Leaves</p>
                </div>
              </div>
            </div>
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <DocumentChartBarIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{designationData.length}</p>
                  <p className="text-xs text-gray-500">Designations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Staff by Designation">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={designationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {designationData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Attendance Trend">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyAttendance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Rate']} />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Attendance Report */}
      {activeReport === 'attendance' && (
        <div className="space-y-6">
          <Card title="Monthly Attendance" subtitle="Last 6 months">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleExport('attendance')}>
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export Attendance
            </Button>
          </div>
        </div>
      )}

      {/* Leave Report */}
      {activeReport === 'leaves' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass p-6 rounded-xl text-center border-l-4 border-amber-500">
              <p className="text-3xl font-bold text-amber-600">{leaveStats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div className="glass p-6 rounded-xl text-center border-l-4 border-emerald-500">
              <p className="text-3xl font-bold text-emerald-600">{leaveStats.approved}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
            <div className="glass p-6 rounded-xl text-center border-l-4 border-red-500">
              <p className="text-3xl font-bold text-red-600">{leaveStats.rejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>

          <Card title="Leaves by Type">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leavesByType}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {leavesByType.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleExport('leaves')}>
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export Leaves
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
