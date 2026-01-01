import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  ChartBarIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useDataStore, leaveTypes } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';

export default function HRDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { employees, attendance, leaves } = useDataStore();
  const getOvertimeStats = useDataStore((s) => s.getOvertimeStats);
  const getPendingApprovalsSummary = useDataStore((s) => s.getPendingApprovalsSummary);
  const getExpiringContracts = useDataStore((s) => s.getExpiringContracts);
  const payrollSettings = useDataStore((s) => s.payrollSettings);
  const userRole = user?.primaryRole || user?.role;
  const isDean = userRole === 'dean';
  const isHOD = userRole === 'hod';
  const isApprover = isDean || isHOD;

  // Helper to get leave type name
  const getLeaveTypeName = (typeId) => {
    const type = leaveTypes.find((t) => t.id === typeId);
    return type ? type.name : typeId;
  };

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Today's attendance
    const todayAttendance = attendance.filter((a) => a.date === todayStr);
    const presentToday = todayAttendance.filter((a) => a.status === 'Present').length;
    const lateToday = todayAttendance.filter((a) => a.status === 'Late').length;
    const absentToday = employees.length - presentToday - lateToday;

    // Leave stats
    const pendingLeaves = leaves.filter((l) => l.status === 'Pending');
    const approvedThisMonth = leaves.filter((l) => {
      if (l.status !== 'Approved') return false;
      const date = parseISO(l.appliedOn);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    // Employee stats
    const activeEmployees = employees.filter((e) => e.status === 'Active').length;
    const onLeave = employees.filter((e) => e.status === 'On Leave').length;

    // Total salary expense
    const totalPayroll = employees
      .filter((e) => e.status === 'Active')
      .reduce((sum, e) => sum + (e.salaryBase || 0), 0);

    return {
      totalEmployees: employees.length,
      activeEmployees,
      onLeave,
      presentToday,
      lateToday,
      absentToday,
      pendingLeaves: pendingLeaves.length,
      approvedThisMonth: approvedThisMonth.length,
      totalPayroll,
      attendanceRate:
        employees.length > 0
          ? Math.round(((presentToday + lateToday) / employees.length) * 100)
          : 0,
      overtimeThisMonth: getOvertimeStats()?.totalHours || 0,
      pendingApprovals: getPendingApprovalsSummary(),
      expiringSoon: getExpiringContracts(
        payrollSettings?.operationalConfig?.expiryHorizonDays || 30,
      ),
    };
  }, [
    employees,
    attendance,
    leaves,
    getOvertimeStats,
    getPendingApprovalsSummary,
    getExpiringContracts,
    payrollSettings,
  ]);

  // Recent leave requests - filtered by role
  const recentLeaveRequests = useMemo(() => {
    let filteredLeaves = leaves;

    // Filter leaves based on approver role
    if (isApprover) {
      const roleToMatch = userRole?.toLowerCase();
      filteredLeaves = leaves.filter((leave) => {
        const currentStep = leave.approvalChain?.find((s) => s.role === roleToMatch);
        return (
          currentStep?.status === 'pending' &&
          (leave.status === 'Pending' || leave.status === 'Forwarded')
        );
      });
    } else {
      filteredLeaves = leaves.filter((l) => l.status === 'Pending');
    }

    return filteredLeaves.sort((a, b) => parseISO(b.appliedOn) - parseISO(a.appliedOn)).slice(0, 5);
  }, [leaves, isApprover, userRole]);

  // Recent attendance issues
  const attendanceIssues = useMemo(
    () =>
      attendance
        .filter((a) => a.status === 'Late' || a.status === 'Absent')
        .sort((a, b) => parseISO(b.date) - parseISO(a.date))
        .slice(0, 5)
        .map((a) => ({
          ...a,
          employee: employees.find((e) => e.id === a.employeeId),
        })),
    [attendance, employees],
  );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-linear-to-r from-red-800 to-red-900 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {isDean ? 'Dean Dashboard' : isHOD ? 'HOD Dashboard' : 'HR Dashboard'}
            </h1>
            <p className="text-red-100 mt-1">
              Welcome back, {user?.name?.split(' ')[0]}!
              {isApprover
                ? ' Review pending leave requests.'
                : ` Here's your overview for ${format(new Date(), 'EEEE, MMMM d')}`}
            </p>
          </div>
          {!isApprover && (
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                <p className="text-sm text-red-100">Attendance Rate</p>
                <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Quick Stats */}
      {!isApprover ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            subtitle={`${stats.activeEmployees} active, ${stats.onLeave} on leave`}
            icon={UsersIcon}
            trend="up"
            trendValue="+2 this month"
            color="primary"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            subtitle={`${stats.lateToday} late, ${stats.absentToday} absent`}
            icon={CheckCircleIcon}
            color="success"
          />
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            subtitle={`${stats.approvedThisMonth} approved this month`}
            icon={DocumentTextIcon}
            color={stats.pendingLeaves > 5 ? 'warning' : 'default'}
          />
          <StatCard
            title="Monthly Payroll"
            value={formatCurrency(stats.totalPayroll)}
            subtitle="Total base salary expense"
            icon={CurrencyDollarIcon}
            color="success"
          />
          <StatCard
            title="Overtime (Month)"
            value={`${stats.overtimeThisMonth.toFixed ? stats.overtimeThisMonth.toFixed(1) : stats.overtimeThisMonth} hrs`}
            subtitle={`Warning above ${payrollSettings?.operationalConfig?.overtimeWarningHours || 40} hrs`}
            icon={ClockIcon}
            color={
              stats.overtimeThisMonth >
              (payrollSettings?.operationalConfig?.overtimeWarningHours || 40)
                ? 'warning'
                : 'default'
            }
          />
          <StatCard
            title="Pending Approvals"
            value={
              (stats.pendingApprovals?.leaves || 0) +
              (stats.pendingApprovals?.attendanceCorrections || 0) +
              (stats.pendingApprovals?.promotions || 0) +
              (stats.pendingApprovals?.profileUpdates || 0) +
              (stats.pendingApprovals?.selectionBoard || 0)
            }
            subtitle="Leaves, corrections, promotions, profiles, board"
            icon={DocumentTextIcon}
            color={(stats.pendingApprovals?.leaves || 0) > 5 ? 'warning' : 'default'}
          />
          <StatCard
            title={`Expiries (${payrollSettings?.operationalConfig?.expiryHorizonDays || 30}d)`}
            value={stats.expiringSoon?.length || 0}
            subtitle="Probation & contracts due"
            icon={CalendarIcon}
            color={(stats.expiringSoon?.length || 0) > 0 ? 'warning' : 'default'}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Pending Approvals"
            value={
              (stats.pendingApprovals?.leaves || 0) +
              (stats.pendingApprovals?.attendanceCorrections || 0) +
              (stats.pendingApprovals?.promotions || 0)
            }
            subtitle={`Requests awaiting your approval`}
            icon={DocumentTextIcon}
            color={recentLeaveRequests.length > 5 ? 'warning' : 'default'}
          />
          <StatCard
            title="Your Department"
            value={user?.faculty || 'N/A'}
            subtitle={`${user?.department || 'Department'} Department`}
            icon={UsersIcon}
            color="primary"
          />
          <StatCard
            title="Approved This Month"
            value={stats.approvedThisMonth}
            subtitle="Leave requests approved"
            icon={CheckCircleIcon}
            color="success"
          />
        </div>
      )}
      {/* Quick Actions */}
      {!isApprover && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/hr/employees"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
            >
              <UsersIcon className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-blue-900">Manage Employees</span>
            </Link>
            <Link
              to="/hr/leaves"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
            >
              <DocumentTextIcon className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-green-900">Approve Leaves</span>
            </Link>
            <Link
              to="/hr/attendance"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group"
            >
              <ClockIcon className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-amber-900">View Attendance</span>
            </Link>
            <Link
              to="/hr/reports"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group"
            >
              <ChartBarIcon className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-purple-900">View Reports</span>
            </Link>
          </div>
        </Card>
      )}
      {/* Main Content Grid */}
      <div className={isApprover ? 'grid gap-6' : 'grid lg:grid-cols-2 gap-6'}>
        {/* Pending Leave Requests */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {isApprover ? 'Leave Requests Awaiting Your Approval' : 'Pending Leave Requests'}
            </h3>
            <Link
              to="/hr/leaves"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          {recentLeaveRequests.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-green-300 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">
                {isApprover ? 'All Caught Up!' : 'No pending leave requests'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isApprover
                  ? 'You have no leave requests awaiting your approval at this time.'
                  : 'No pending leave requests'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeaveRequests.map((leave) => (
                <div
                  key={leave.id}
                  onClick={() => navigate('/hr/leaves')}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {leave.employeeName
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{leave.employeeName}</p>
                      <p className="text-xs text-gray-500">
                        {getLeaveTypeName(leave.type)} • {leave.days} day{leave.days > 1 ? 's' : ''}{' '}
                        • {leave.department}
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Attendance Issues - Only for HR */}
        {!isApprover && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Attendance Issues</h3>
              <Link
                to="/hr/attendance"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            {attendanceIssues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-300 mx-auto mb-2" />
                <p className="text-gray-500">No attendance issues</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          issue.status === 'Late' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}
                      >
                        <ExclamationTriangleIcon
                          className={`w-5 h-5 ${
                            issue.status === 'Late' ? 'text-yellow-600' : 'text-red-600'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {issue.employee?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(issue.date), 'MMM d, yyyy')} •{' '}
                          {issue.clockIn || 'No clock in'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={issue.status === 'Late' ? 'warning' : 'error'}>
                      {issue.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Upcoming Expiries */}
        {!isApprover && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {`Upcoming Probation/Contract Expiries (${payrollSettings?.operationalConfig?.expiryHorizonDays || 30}d)`}
              </h3>
              <Link
                to="/hr/employees"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Manage <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            {!stats.expiringSoon || stats.expiringSoon.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-300 mx-auto mb-2" />
                <p className="text-gray-500">No upcoming expiries</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.expiringSoon.map((x) => (
                  <div
                    key={`${x.id}-${x.dueDate}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{x.name}</p>
                      <p className="text-xs text-gray-500">
                        {x.department} • {x.type}
                      </p>
                    </div>
                    <Badge variant="warning">{format(parseISO(x.dueDate), 'MMM d, yyyy')}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>{' '}
      {/* Department Overview - Only for HR */}
      {!isApprover && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Department Overview</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Computing', 'Engineering', 'Management', 'Sciences'].map((faculty) => {
              const facultyEmployees = employees.filter((e) => e.faculty === faculty);
              return (
                <div key={faculty} className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-900">{faculty}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{facultyEmployees.length}</p>
                  <p className="text-xs text-gray-500">
                    {facultyEmployees.filter((e) => e.status === 'Active').length} active
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
