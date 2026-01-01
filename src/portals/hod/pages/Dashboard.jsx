import { useMemo } from 'react';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import { Link } from 'react-router-dom';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function HODDashboard() {
  const employees = useDataStore((s) => s.employees);
  const attendance = useDataStore((s) => s.attendance);
  const leaves = useDataStore((s) => s.leaves);
  const user = useAuthStore((s) => s.user);

  // Filter data for HOD's department
  const deptEmployees = useMemo(
    () => employees.filter((e) => e.department === user.department),
    [employees, user.department],
  );

  const deptEmployeeIds = useMemo(() => new Set(deptEmployees.map((e) => e.id)), [deptEmployees]);

  const deptLeaves = useMemo(
    () => leaves.filter((l) => deptEmployeeIds.has(l.employeeId)),
    [leaves, deptEmployeeIds],
  );

  // Statistics
  const totalEmployees = deptEmployees.length;
  const activeEmployees = deptEmployees.filter((e) => e.status === 'Active').length;
  const pendingLeaves = deptLeaves.filter((l) => l.status === 'Pending').length;

  // Today's attendance
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAttendance = useMemo(() => {
    const records = attendance.filter((a) => a.date === today && deptEmployeeIds.has(a.employeeId));
    return {
      present: records.filter((a) => a.status === 'Present').length,
      absent: records.filter((a) => a.status === 'Absent').length,
      late: records.filter((a) => a.status === 'Late').length,
      leave: records.filter((a) => a.status === 'Leave').length,
    };
  }, [attendance, today, deptEmployeeIds]);

  // Weekly attendance trend
  const weeklyTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const records = attendance.filter(
        (a) => a.date === dateStr && deptEmployeeIds.has(a.employeeId),
      );
      return {
        day: format(date, 'EEE'),
        present: records.filter((r) => r.status === 'Present').length,
        absent: records.filter((r) => r.status === 'Absent').length,
      };
    });
    return last7Days;
  }, [attendance, deptEmployeeIds]);

  // Attendance distribution for pie chart
  const attendanceDistribution = [
    { name: 'Present', value: todayAttendance.present },
    { name: 'Late', value: todayAttendance.late },
    { name: 'Absent', value: todayAttendance.absent },
    { name: 'Leave', value: todayAttendance.leave },
  ].filter((item) => item.value > 0);

  // Recent leave requests
  const recentLeaves = useMemo(
    () =>
      deptLeaves
        .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn))
        .slice(0, 5)
        .map((leave) => ({
          ...leave,
          employee: employees.find((e) => e.id === leave.employeeId),
        })),
    [deptLeaves, employees],
  );

  // Designation distribution
  const designationStats = useMemo(() => {
    const stats = {};
    deptEmployees.forEach((emp) => {
      stats[emp.designation] = (stats[emp.designation] || 0) + 1;
    });
    return Object.entries(stats).map(([name, count]) => ({ name, count }));
  }, [deptEmployees]);

  const stats = [
    {
      label: 'Department Staff',
      value: totalEmployees,
      icon: UsersIcon,
      color: 'from-emerald-600 to-green-600',
      change: `${activeEmployees} active`,
    },
    {
      label: 'Present Today',
      value: todayAttendance.present,
      icon: CheckCircleIcon,
      color: 'from-blue-500 to-indigo-500',
      change: `${totalEmployees > 0 ? Math.round((todayAttendance.present / totalEmployees) * 100) : 0}% attendance`,
    },
    {
      label: 'Late Today',
      value: todayAttendance.late,
      icon: ClockIcon,
      color: 'from-amber-500 to-orange-500',
      change: 'Requires attention',
    },
    {
      label: 'Pending Leaves',
      value: pendingLeaves,
      icon: CalendarDaysIcon,
      color: 'from-purple-500 to-pink-500',
      change: 'Awaiting approval',
    },
  ];

  const quickActions = [
    { label: 'View Staff', icon: UsersIcon, path: '/hod/employees', color: 'bg-emerald-500' },
    { label: 'Attendance', icon: ClockIcon, path: '/hod/attendance', color: 'bg-blue-500' },
    { label: 'Leaves', icon: CalendarDaysIcon, path: '/hod/leaves', color: 'bg-purple-500' },
    { label: 'Reports', icon: DocumentChartBarIcon, path: '/hod/reports', color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Department Overview</h2>
          <p className="text-gray-500 mt-1">
            Department of {user.department || 'Computer Science'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
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
        {/* Weekly Attendance Trend */}
        <Card title="Weekly Attendance" subtitle="Last 7 days trend">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
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

        {/* Today's Attendance Distribution */}
        <Card title="Today's Attendance" subtitle="Current attendance status">
          <div className="h-64">
            {attendanceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {attendanceDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No attendance data for today</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff by Designation */}
        <Card title="Staff by Designation" subtitle="Team composition">
          <div className="space-y-3">
            {designationStats.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
            {designationStats.length === 0 && (
              <p className="text-center text-gray-400 py-8">No staff data available</p>
            )}
          </div>
        </Card>

        {/* Recent Leave Requests */}
        <Card
          title="Recent Leave Requests"
          subtitle="Latest requests from your team"
          actions={
            <Link to="/hod/leaves">
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
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white font-bold text-sm">
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
