import { useState, useMemo } from 'react';
import { useDataStore } from '../../../state/data';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
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
  AreaChart,
  Area,
} from 'recharts';
import { format, subMonths, parseISO } from 'date-fns';
import Papa from 'papaparse';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const REPORT_TYPES = [
  { id: 'workforce', label: 'Workforce', icon: UsersIcon },
  { id: 'attendance', label: 'Attendance', icon: ClockIcon },
  { id: 'leaves', label: 'Leaves', icon: CalendarDaysIcon },
  { id: 'payroll', label: 'Payroll', icon: CurrencyDollarIcon },
];

export default function VPReports() {
  const employees = useDataStore((s) => s.employees);
  const attendance = useDataStore((s) => s.attendance);
  const leaves = useDataStore((s) => s.leaves);

  const [activeReport, setActiveReport] = useState('workforce');

  // Faculty distribution
  const facultyData = useMemo(() => {
    const facultyCount = {};
    employees.forEach((emp) => {
      const faculty = emp.faculty || 'Other';
      facultyCount[faculty] = (facultyCount[faculty] || 0) + 1;
    });
    return Object.entries(facultyCount).map(([name, value]) => ({ name, value }));
  }, [employees]);

  // Department distribution
  const departmentData = useMemo(() => {
    const deptCount = {};
    employees.forEach((emp) => {
      deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
    });
    return Object.entries(deptCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  // Monthly attendance trend
  const attendanceTrend = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStr = format(date, 'MMM yyyy');
      const monthRecords = attendance.filter((a) => {
        const recordDate = parseISO(a.date);
        return format(recordDate, 'MMM yyyy') === monthStr;
      });

      const present = monthRecords.filter((r) => r.status === 'Present').length;
      const total = monthRecords.length;

      months.push({
        month: format(date, 'MMM'),
        present,
        absent: monthRecords.filter((r) => r.status === 'Absent').length,
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
      });
    }
    return months;
  }, [attendance]);

  // Leave statistics
  const leavesByType = useMemo(() => {
    const typeCount = {};
    leaves.forEach((leave) => {
      typeCount[leave.type] = (typeCount[leave.type] || 0) + 1;
    });
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  }, [leaves]);

  const leaveStats = useMemo(
    () => ({
      total: leaves.length,
      pending: leaves.filter((l) => l.status === 'Pending').length,
      approved: leaves.filter((l) => l.status === 'Approved').length,
      rejected: leaves.filter((l) => l.status === 'Rejected').length,
    }),
    [leaves],
  );

  // Payroll by faculty
  const payrollByFaculty = useMemo(() => {
    const facultyPayroll = {};
    employees.forEach((emp) => {
      const faculty = emp.faculty || 'Other';
      facultyPayroll[faculty] = (facultyPayroll[faculty] || 0) + (emp.salaryBase || 0);
    });
    return Object.entries(facultyPayroll).map(([name, value]) => ({
      name,
      value: Math.round(value / 1000),
    }));
  }, [employees]);

  // Total payroll
  const totalPayroll = employees.reduce((acc, curr) => acc + (curr.salaryBase || 0), 0);

  const handleExport = (type) => {
    let data = [];
    let filename = '';

    switch (type) {
      case 'workforce':
        data = employees.map((e) => ({
          Code: e.code,
          Name: e.name,
          Faculty: e.faculty,
          Department: e.department,
          Designation: e.designation,
          Status: e.status,
          Salary: e.salaryBase,
        }));
        filename = 'institution_workforce';
        break;
      case 'attendance':
        data = attendanceTrend.map((a) => ({
          Month: a.month,
          Present: a.present,
          Absent: a.absent,
          Rate: `${a.rate}%`,
        }));
        filename = 'institution_attendance';
        break;
      case 'leaves':
        data = leaves.map((l) => ({
          Employee: employees.find((e) => e.id === l.employeeId)?.name || 'Unknown',
          Type: l.type,
          From: l.from,
          To: l.to,
          Status: l.status,
        }));
        filename = 'institution_leaves';
        break;
      case 'payroll':
        data = payrollByFaculty.map((p) => ({
          Faculty: p.name,
          Payroll: `$${p.value}k`,
        }));
        filename = 'institution_payroll';
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
          <h2 className="text-2xl font-bold text-gray-900">Institution Reports</h2>
          <p className="text-gray-500 mt-1">Comprehensive institutional analytics</p>
        </div>
        <Button variant="outline" onClick={() => handleExport(activeReport)}>
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export Report
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
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <report.icon className="w-4 h-4" />
            {report.label}
          </button>
        ))}
      </div>

      {/* Workforce Report */}
      {activeReport === 'workforce' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              <p className="text-xs text-gray-500">Total Staff</p>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {employees.filter((e) => e.status === 'Active').length}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-600">{facultyData.length}</p>
              <p className="text-xs text-gray-500">Faculties</p>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-purple-600">{departmentData.length}</p>
              <p className="text-xs text-gray-500">Departments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Faculty Distribution">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={facultyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {facultyData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Department Breakdown">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Attendance Report */}
      {activeReport === 'attendance' && (
        <div className="space-y-6">
          <Card title="Monthly Attendance Trend" subtitle="Last 6 months">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Present"
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Absent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Attendance Rate Trend">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(value) => [`${value}%`, 'Rate']} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Leave Report */}
      {activeReport === 'leaves' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900">{leaveStats.total}</p>
              <p className="text-xs text-gray-500">Total Requests</p>
            </div>
            <div className="glass p-4 rounded-xl text-center border-l-4 border-amber-500">
              <p className="text-2xl font-bold text-amber-600">{leaveStats.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="glass p-4 rounded-xl text-center border-l-4 border-emerald-500">
              <p className="text-2xl font-bold text-emerald-600">{leaveStats.approved}</p>
              <p className="text-xs text-gray-500">Approved</p>
            </div>
            <div className="glass p-4 rounded-xl text-center border-l-4 border-red-500">
              <p className="text-2xl font-bold text-red-600">{leaveStats.rejected}</p>
              <p className="text-xs text-gray-500">Rejected</p>
            </div>
          </div>

          <Card title="Leave Distribution by Type">
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
        </div>
      )}

      {/* Payroll Report */}
      {activeReport === 'payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-6 rounded-xl">
              <p className="text-sm text-gray-500">Total Monthly Payroll</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                ${totalPayroll.toLocaleString()}
              </p>
            </div>
            <div className="glass p-6 rounded-xl">
              <p className="text-sm text-gray-500">Average Salary</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ${Math.round(totalPayroll / employees.length).toLocaleString()}
              </p>
            </div>
            <div className="glass p-6 rounded-xl">
              <p className="text-sm text-gray-500">Annual Projection</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                ${(totalPayroll * 12).toLocaleString()}
              </p>
            </div>
          </div>

          <Card title="Payroll by Faculty" subtitle="Monthly salary expense (in thousands)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollByFaculty}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}k`} />
                  <Tooltip formatter={(value) => [`$${value}k`, 'Payroll']} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
