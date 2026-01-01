import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BellIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useDataStore, leaveTypes } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import { format, parseISO, isToday, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';

export default function EmployeeDashboard() {
  const user = useAuthStore((s) => s.user);
  const { employees, attendance, leaves, notifications } = useDataStore();

  // Get current employee data
  const employee = useMemo(
    () => employees.find((e) => e.id === user?.id || e.email === user?.email),
    [employees, user],
  );

  const employeeId = employee?.id || user?.id;

  // Calculate stats
  const myAttendance = useMemo(
    () => attendance.filter((a) => a.employeeId === employeeId),
    [attendance, employeeId],
  );

  const todayAttendance = useMemo(
    () => myAttendance.find((a) => a.date === format(new Date(), 'yyyy-MM-dd')),
    [myAttendance],
  );

  const myLeaves = useMemo(
    () => leaves.filter((l) => l.employeeId === employeeId),
    [leaves, employeeId],
  );

  // This month's attendance stats
  const thisMonthStats = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const thisMonthAttendance = myAttendance.filter((a) => {
      const date = parseISO(a.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    return {
      present: thisMonthAttendance.filter((a) => a.status === 'Present').length,
      late: thisMonthAttendance.filter((a) => a.status === 'Late').length,
      absent: thisMonthAttendance.filter((a) => a.status === 'Absent').length,
      total: thisMonthAttendance.length,
    };
  }, [myAttendance]);

  const pendingLeaves = myLeaves.filter((l) => l.status === 'Pending').length;
  const approvedLeaves = myLeaves.filter((l) => l.status === 'Approved').length;

  // Leave balance
  const leaveBalance = employee?.leaveBalance || { annual: 0, sick: 0, casual: 0 };
  const totalLeaveBalance = leaveBalance.annual + leaveBalance.sick + leaveBalance.casual;

  // Salary calculation
  const baseSalary = employee?.salaryBase || 0;
  const lateDeduction = thisMonthStats.late * 500; // PKR 500 per late
  const absentDeduction = thisMonthStats.absent * (baseSalary / 22); // Per day salary
  const netPay = baseSalary - lateDeduction - absentDeduction;

  // Recent notifications
  const myNotifications = useMemo(
    () => notifications.filter((n) => n.userId === employeeId || n.userId === 'all').slice(0, 5),
    [notifications, employeeId],
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
      <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {employee?.name?.split(' ')[0] || user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-blue-100 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="flex items-center gap-3">
            {!todayAttendance ? (
              <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                <p className="text-sm text-blue-100">Today's Status</p>
                <p className="font-semibold">Not Clocked In</p>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                <p className="text-sm text-blue-100">Clock In</p>
                <p className="font-semibold">{todayAttendance.clockIn || '--:--'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Present Days"
          value={thisMonthStats.present}
          subtitle={`This month (${thisMonthStats.late} late)`}
          icon={CheckCircleIcon}
          trend={thisMonthStats.present > 15 ? 'up' : 'down'}
          trendValue={`${Math.round((thisMonthStats.present / 22) * 100)}%`}
          color="success"
        />
        <StatCard
          title="Leave Balance"
          value={totalLeaveBalance}
          subtitle={`${leaveBalance.annual} annual, ${leaveBalance.sick} sick`}
          icon={DocumentTextIcon}
          color="primary"
        />
        <StatCard
          title="Pending Requests"
          value={pendingLeaves}
          subtitle={`${approvedLeaves} approved this year`}
          icon={ClockIcon}
          color={pendingLeaves > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Est. Net Salary"
          value={formatCurrency(netPay)}
          subtitle={`Base: ${formatCurrency(baseSalary)}`}
          icon={CurrencyDollarIcon}
          trend={lateDeduction > 0 ? 'down' : 'neutral'}
          trendValue={
            lateDeduction > 0
              ? `-${formatCurrency(lateDeduction + absentDeduction)}`
              : 'No deductions'
          }
          color="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-gray-900">My Profile</h3>
            <Link
              to="/employee/profile"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Full Profile <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Employee Code</p>
                <p className="font-medium text-gray-900">{employee?.code || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Department</p>
                <p className="font-medium text-gray-900">
                  {employee?.department || user?.department}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Designation</p>
                <p className="font-medium text-gray-900">
                  {employee?.designation || user?.designation || 'N/A'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Faculty</p>
                <p className="font-medium text-gray-900">{employee?.faculty || user?.faculty}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Join Date</p>
                <p className="font-medium text-gray-900">{employee?.joinDate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <Badge variant={employee?.status === 'Active' ? 'success' : 'warning'}>
                  {employee?.status || 'Active'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Leave Balance Card */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Leave Balance</h3>
            <Link to="/employee/leave" className="text-sm text-blue-600 hover:text-blue-800">
              Apply
            </Link>
          </div>
          <div className="space-y-3">
            {Object.entries(leaveBalance).map(([type, days]) => {
              const leaveType = leaveTypes.find((lt) => lt.id === type);
              const maxDays = leaveType?.defaultDays || 20;
              const percentage = Math.min((days / maxDays) * 100, 100);

              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-600">{type}</span>
                    <span className="font-medium">{days} days</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentage > 50
                          ? 'bg-green-500'
                          : percentage > 20
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Leave Requests</h3>
            <Link to="/employee/leave" className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </Link>
          </div>
          {myLeaves.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <DocumentTextIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No leave requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myLeaves.slice(0, 4).map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{leave.type} Leave</p>
                    <p className="text-xs text-gray-500">
                      {leave.startDate} — {leave.days} day{leave.days > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge
                    variant={
                      leave.status === 'Approved'
                        ? 'success'
                        : leave.status === 'Pending'
                          ? 'warning'
                          : 'error'
                    }
                  >
                    {leave.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notifications */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <span className="text-xs text-gray-500">{myNotifications.length} new</span>
          </div>
          {myNotifications.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <BellIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myNotifications.map((notif) => (
                <div key={notif.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      notif.type === 'success'
                        ? 'bg-green-100 text-green-600'
                        : notif.type === 'warning'
                          ? 'bg-yellow-100 text-yellow-600'
                          : notif.type === 'error'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <BellIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/employee/attendance"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <ClockIcon className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">View Attendance</span>
          </Link>
          <Link
            to="/employee/leave"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
          >
            <DocumentTextIcon className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-900">Apply Leave</span>
          </Link>
          <Link
            to="/employee/salary"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <CurrencyDollarIcon className="w-6 h-6 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">View Salary</span>
          </Link>
          <Link
            to="/employee/profile"
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <CalendarIcon className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">My Profile</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
