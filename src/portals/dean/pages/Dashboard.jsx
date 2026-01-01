import { useMemo } from 'react';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import { Link } from 'react-router-dom';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import {
  UsersIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ClockIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
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
} from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DeanDashboard() {
  const employees = useDataStore((s) => s.employees);
  const attendance = useDataStore((s) => s.attendance);
  const leaves = useDataStore((s) => s.leaves);
  const user = useAuthStore((s) => s.user);

  // Filter data for dean's faculty
  const facultyEmployees = useMemo(
    () => employees.filter((e) => e.faculty === user.faculty),
    [employees, user.faculty],
  );

  const facultyEmployeeIds = useMemo(
    () => new Set(facultyEmployees.map((e) => e.id)),
    [facultyEmployees],
  );

  const facultyLeaves = useMemo(
    () => leaves.filter((l) => facultyEmployeeIds.has(l.employeeId)),
    [leaves, facultyEmployeeIds],
  );

  // Statistics
  const totalEmployees = facultyEmployees.length;
  const activeEmployees = facultyEmployees.filter((e) => e.status === 'Active').length;
  const departments = [...new Set(facultyEmployees.map((e) => e.department))];
  const pendingLeaves = facultyLeaves.filter((l) => l.status === 'Pending').length;

  // Today's attendance for faculty
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAttendance = useMemo(() => {
    const records = attendance.filter(
      (a) => a.date === today && facultyEmployeeIds.has(a.employeeId),
    );
    const present = records.filter((a) => a.status === 'Present').length;
    const absent = records.filter((a) => a.status === 'Absent').length;
    const late = records.filter((a) => a.status === 'Late').length;
    return { present, absent, late, total: records.length };
  }, [attendance, today, facultyEmployeeIds]);

  // Department distribution data for chart
  const departmentData = useMemo(() => {
    const deptCount = {};
    facultyEmployees.forEach((emp) => {
      deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
    });
    return Object.entries(deptCount).map(([name, value]) => ({ name, value }));
  }, [facultyEmployees]);

  // Monthly attendance trend (mock data for demonstration)
  const attendanceTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days.map((day) => ({
      day,
      present: Math.floor(Math.random() * 20) + 30,
      absent: Math.floor(Math.random() * 5) + 1,
      late: Math.floor(Math.random() * 5) + 1,
    }));
  }, []);

  // Recent leave requests
  const recentLeaves = useMemo(
    () =>
      facultyLeaves
        .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn))
        .slice(0, 5)
        .map((leave) => ({
          ...leave,
          employee: employees.find((e) => e.id === leave.employeeId),
        })),
    [facultyLeaves, employees],
  );

  const stats = [
    {
      label: 'Total Faculty Staff',
      value: totalEmployees,
      icon: UsersIcon,
      color: 'from-blue-600 to-indigo-600',
      change: '+2 this month',
    },
    {
      label: 'Active Members',
      value: activeEmployees,
      icon: AcademicCapIcon,
      color: 'from-emerald-500 to-teal-500',
      change: `${Math.round((activeEmployees / totalEmployees) * 100)}% active`,
    },
    {
      label: 'Departments',
      value: departments.length,
      icon: BuildingOfficeIcon,
      color: 'from-amber-500 to-orange-500',
      change: 'Under faculty',
    },
    {
      label: 'Pending Leaves',
      value: pendingLeaves,
      icon: CalendarDaysIcon,
      color: 'from-purple-500 to-pink-500',
      change: 'Requires action',
    },
  ];

  const quickActions = [
    { label: 'View All Staff', icon: UsersIcon, path: '/dean/employees', color: 'bg-blue-500' },
    {
      label: 'Check Attendance',
      icon: ClockIcon,
      path: '/dean/attendance',
      color: 'bg-emerald-500',
    },
    {
      label: 'Leave Requests',
      icon: CalendarDaysIcon,
      path: '/dean/leaves',
      color: 'bg-purple-500',
    },
    {
      label: 'View Reports',
      icon: DocumentChartBarIcon,
      path: '/dean/reports',
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Faculty Overview</h2>
          <p className="text-gray-500 mt-1">
            Faculty of {user.faculty || 'Computing & Engineering'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass p-6 rounded-2xl card-hover relative overflow-hidden group"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${stat.color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}
            />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-linear-to-br ${stat.color} text-white shadow-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            to={action.path}
            className="glass p-4 rounded-xl card-hover flex items-center gap-3 group"
          >
            <div
              className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}
            >
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card title="Department Distribution" subtitle="Staff distribution across departments">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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

        {/* Weekly Attendance Trend */}
        <Card title="Weekly Attendance" subtitle="Attendance pattern this week">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
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
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance Summary */}
        <Card title="Today's Attendance" subtitle={format(new Date(), 'MMMM d, yyyy')}>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckCircleIcon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">{todayAttendance.present}</p>
              <p className="text-xs text-emerald-600">Present</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-amber-50 border border-amber-100">
              <ClockIcon className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-700">{todayAttendance.late}</p>
              <p className="text-xs text-amber-600">Late</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-50 border border-red-100">
              <XCircleIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-700">{todayAttendance.absent}</p>
              <p className="text-xs text-red-600">Absent</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Attendance Rate</span>
              <span className="font-semibold text-gray-900">
                {todayAttendance.total > 0
                  ? `${Math.round((todayAttendance.present / totalEmployees) * 100)}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="mt-2 w-full h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                style={{ width: `${(todayAttendance.present / totalEmployees) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Recent Leave Requests */}
        <Card
          title="Recent Leave Requests"
          subtitle="Latest requests from faculty"
          actions={
            <Link to="/dean/leaves">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {recentLeaves.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CalendarDaysIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No leave requests</p>
              </div>
            ) : (
              recentLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                      {leave.employee?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {leave.employee?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {leave.type} •{' '}
                        {leave.startDate ? format(parseISO(leave.startDate), 'MMM d') : 'N/A'} -{' '}
                        {leave.endDate ? format(parseISO(leave.endDate), 'MMM d') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      leave.status === 'Approved'
                        ? 'success'
                        : leave.status === 'Rejected'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {leave.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
