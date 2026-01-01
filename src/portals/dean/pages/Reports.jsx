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
} from 'recharts';
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  parseISO,
} from 'date-fns';
import Papa from 'papaparse';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const REPORT_TYPES = [
  { id: 'overview', label: 'Overview', icon: DocumentChartBarIcon },
  { id: 'attendance', label: 'Attendance Report', icon: ClockIcon },
  { id: 'leaves', label: 'Leave Report', icon: CalendarDaysIcon },
  { id: 'department', label: 'Department Analysis', icon: BuildingOfficeIcon },
];

export default function Reports() {
  const employees = useDataStore((s) => s.employees);
  const attendance = useDataStore((s) => s.attendance);
  const leaves = useDataStore((s) => s.leaves);
  const user = useAuthStore((s) => s.user);

  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  // Filter data for faculty
  const facultyEmployees = useMemo(
    () => employees.filter((e) => e.faculty === user.faculty),
    [employees, user.faculty],
  );

  const facultyEmployeeIds = useMemo(
    () => new Set(facultyEmployees.map((e) => e.id)),
    [facultyEmployees],
  );

  const facultyAttendance = useMemo(
    () => attendance.filter((a) => facultyEmployeeIds.has(a.employeeId)),
    [attendance, facultyEmployeeIds],
  );

  const facultyLeaves = useMemo(
    () => leaves.filter((l) => facultyEmployeeIds.has(l.employeeId)),
    [leaves, facultyEmployeeIds],
  );

  // Department distribution
  const departmentData = useMemo(() => {
    const deptCount = {};
    facultyEmployees.forEach((emp) => {
      deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
    });
    return Object.entries(deptCount).map(([name, value]) => ({ name, value }));
  }, [facultyEmployees]);

  // Monthly attendance trend (last 6 months)
  const monthlyAttendance = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStr = format(monthDate, 'MMM yyyy');
      const monthRecords = facultyAttendance.filter((a) => {
        const recordDate = parseISO(a.date);
        return format(recordDate, 'MMM yyyy') === monthStr;
      });

      const present = monthRecords.filter((r) => r.status === 'Present').length;
      const absent = monthRecords.filter((r) => r.status === 'Absent').length;
      const late = monthRecords.filter((r) => r.status === 'Late').length;

      months.push({
        month: format(monthDate, 'MMM'),
        present,
        absent,
        late,
        rate: monthRecords.length > 0 ? Math.round((present / (present + absent + late)) * 100) : 0,
      });
    }
    return months;
  }, [facultyAttendance]);

  // Leave statistics by type
  const leavesByType = useMemo(() => {
    const typeCount = {};
    facultyLeaves.forEach((leave) => {
      typeCount[leave.type] = (typeCount[leave.type] || 0) + 1;
    });
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  }, [facultyLeaves]);

  // Leave statistics by status
  const leavesByStatus = useMemo(
    () => ({
      pending: facultyLeaves.filter((l) => l.status === 'Pending').length,
      approved: facultyLeaves.filter((l) => l.status === 'Approved').length,
      rejected: facultyLeaves.filter((l) => l.status === 'Rejected').length,
    }),
    [facultyLeaves],
  );

  // Department performance (attendance rate by department)
  const departmentPerformance = useMemo(() => {
    const deptStats = {};

    facultyEmployees.forEach((emp) => {
      if (!deptStats[emp.department]) {
        deptStats[emp.department] = { total: 0, present: 0, employees: 0 };
      }
      deptStats[emp.department].employees++;
    });

    facultyAttendance.forEach((a) => {
      const emp = employees.find((e) => e.id === a.employeeId);
      if (emp && deptStats[emp.department]) {
        deptStats[emp.department].total++;
        if (a.status === 'Present' || a.status === 'Late') {
          deptStats[emp.department].present++;
        }
      }
    });

    return Object.entries(deptStats).map(([name, stats]) => ({
      name,
      employees: stats.employees,
      rate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    }));
  }, [facultyEmployees, facultyAttendance, employees]);

  const handleExport = (reportType) => {
    let data = [];
    let filename = '';

    switch (reportType) {
      case 'attendance':
        data = facultyAttendance.map((a) => ({
          Employee: employees.find((e) => e.id === a.employeeId)?.name || 'Unknown',
          Date: a.date,
          Status: a.status,
          CheckIn: a.checkIn || '-',
          CheckOut: a.checkOut || '-',
        }));
        filename = 'faculty_attendance_report';
        break;
      case 'leaves':
        data = facultyLeaves.map((l) => ({
          Employee: employees.find((e) => e.id === l.employeeId)?.name || 'Unknown',
          Type: l.type,
          From: l.from,
          To: l.to,
          Status: l.status,
          Reason: l.reason || '-',
        }));
        filename = 'faculty_leaves_report';
        break;
      case 'department':
        data = departmentPerformance.map((d) => ({
          Department: d.name,
          Employees: d.employees,
          AttendanceRate: `${d.rate}%`,
        }));
        filename = 'department_report';
        break;
      default:
        data = facultyEmployees.map((e) => ({
          Code: e.code,
          Name: e.name,
          Department: e.department,
          Designation: e.designation,
          Status: e.status,
        }));
        filename = 'faculty_employees_report';
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
          <h2 className="text-2xl font-bold text-gray-900">Faculty Reports</h2>
          <p className="text-gray-500 mt-1">Analytics and reports for {user.faculty}</p>
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
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <report.icon className="w-4 h-4" />
            {report.label}
          </button>
        ))}
      </div>

      {/* Overview Report */}
      {activeReport === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <UsersIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{facultyEmployees.length}</p>
                  <p className="text-xs text-gray-500">Total Staff</p>
                </div>
              </div>
            </div>
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <BuildingOfficeIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{departmentData.length}</p>
                  <p className="text-xs text-gray-500">Departments</p>
                </div>
              </div>
            </div>
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <CalendarDaysIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{leavesByStatus.pending}</p>
                  <p className="text-xs text-gray-500">Pending Leaves</p>
                </div>
              </div>
            </div>
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <ClockIcon className="w-5 h-5 text-purple-600" />
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
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Department Distribution">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Monthly Attendance Trend">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyAttendance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
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
          <Card
            title="Monthly Attendance Breakdown"
            subtitle="Attendance statistics for the last 6 months"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
                  <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Late" />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Attendance Rate Trend">
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
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-6 rounded-xl text-center border-l-4 border-amber-500">
              <p className="text-3xl font-bold text-amber-600">{leavesByStatus.pending}</p>
              <p className="text-sm text-gray-500 mt-1">Pending</p>
            </div>
            <div className="glass p-6 rounded-xl text-center border-l-4 border-emerald-500">
              <p className="text-3xl font-bold text-emerald-600">{leavesByStatus.approved}</p>
              <p className="text-sm text-gray-500 mt-1">Approved</p>
            </div>
            <div className="glass p-6 rounded-xl text-center border-l-4 border-red-500">
              <p className="text-3xl font-bold text-red-600">{leavesByStatus.rejected}</p>
              <p className="text-sm text-gray-500 mt-1">Rejected</p>
            </div>
          </div>

          <Card title="Leaves by Type" subtitle="Distribution of leave requests by type">
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

      {/* Department Analysis */}
      {activeReport === 'department' && (
        <div className="space-y-6">
          <Card title="Department Performance" subtitle="Attendance rate by department">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                  <Bar dataKey="rate" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Department Staff Count">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {departmentPerformance.map((dept, index) => (
                <div
                  key={dept.name}
                  className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div
                    className="w-3 h-3 rounded-full mb-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                  <p className="text-2xl font-bold text-gray-700 mt-1">{dept.employees}</p>
                  <p className="text-xs text-gray-500">staff members</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
