import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import StatCard from '../../../components/StatCard';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { leaves, employees } = useDataStore();

  // Analytics data: medical leave trends by month (last 12 months)
  const analyticsData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return {
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      };
    });
    return months.map((m) => {
      const count = leaves.filter((l) => {
        if (l.type !== 'medical') return false;
        const start = l.startDate ? parseISO(l.startDate) : null;
        return start && start.getFullYear() === m.year && start.getMonth() === m.month;
      }).length;
      return { ...m, count };
    });
  }, [leaves]);

  const stats = useMemo(() => {
    const medicalLeaves = leaves.filter((l) => l.type === 'medical');
    const vcPending = medicalLeaves.filter((l) => {
      const vcStep = l.approvalChain?.find((s) => s.role === 'vc');
      return vcStep?.status === 'pending';
    });
    const vcApproved = medicalLeaves.filter((l) => {
      const vcStep = l.approvalChain?.find((s) => s.role === 'vc');
      return vcStep?.status === 'approved';
    });
    const vcRejected = medicalLeaves.filter((l) => {
      const vcStep = l.approvalChain?.find((s) => s.role === 'vc');
      return vcStep?.status === 'rejected';
    });
    return {
      totalMedical: medicalLeaves.length,
      pending: vcPending.length,
      approved: vcApproved.length,
      rejected: vcRejected.length,
      pendingLeaves: vcPending,
    };
  }, [leaves]);

  const recentActivity = useMemo(() => {
    return leaves
      .filter((l) => l.type === 'medical')
      .filter((l) => {
        const vcStep = l.approvalChain?.find((s) => s.role === 'vc');
        return vcStep && vcStep.status !== 'pending';
      })
      .sort((a, b) => {
        const aDate = a.approvalChain?.find((s) => s.role === 'vc')?.date;
        const bDate = b.approvalChain?.find((s) => s.role === 'vc')?.date;
        return new Date(bDate) - new Date(aDate);
      })
      .slice(0, 5);
  }, [leaves]);

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-indigo-700 via-blue-600 to-blue-400 dark:from-indigo-900 dark:via-blue-900 dark:to-gray-900 shadow-xl p-6 md:p-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-white tracking-wide">
              Vice Chancellor
            </span>
            <span className="inline-block px-3 py-1 rounded-full bg-blue-900/80 text-xs font-semibold text-blue-100 tracking-wide">
              University HR Portal
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow dark:text-blue-100">
            Welcome, {user?.name}
          </h1>
          <p className="text-blue-100 text-base md:text-lg dark:text-blue-200">
            Empowering HR decisions with real-time analytics and insights.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-lg">
            <ChartBarIcon className="w-10 h-10 text-white" />
          </div>
          <span className="text-white/80 text-xs mt-1 dark:text-blue-200/80">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Medical Leaves"
          value={stats.totalMedical}
          icon={DocumentTextIcon}
          color="primary"
          subtitle="All medical leave requests"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={ClockIcon}
          color="warning"
          subtitle="Awaiting your action"
        />
        <StatCard
          title="Recommended"
          value={stats.approved}
          icon={CheckCircleIcon}
          color="success"
          subtitle="You have recommended"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircleIcon}
          color="danger"
          subtitle="You have rejected"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 border-0 shadow-md hover:shadow-lg transition">
          <DocumentTextIcon className="w-10 h-10 text-blue-600 mb-2" />
          <h3 className="font-semibold text-lg text-blue-900 mb-1">Review Medical Leaves</h3>
          <p className="text-sm text-blue-700 mb-3 text-center">
            See all pending medical leave requests and take action.
          </p>
          <Link to="/vc/medical-leaves">
            <Button size="sm" variant="primary">
              Go to Medical Leaves
            </Button>
          </Link>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900 dark:to-emerald-800 border-0 shadow-md hover:shadow-lg transition">
          <ChartBarIcon className="w-10 h-10 text-emerald-600 mb-2" />
          <h3 className="font-semibold text-lg text-emerald-900 mb-1">View Analytics</h3>
          <p className="text-sm text-emerald-700 mb-3 text-center">
            Explore HR analytics and trends for better decisions.
          </p>
          <Link to="/vc/analytics">
            <Button size="sm" variant="success">
              Go to Analytics
            </Button>
          </Link>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 bg-linear-to-br from-amber-100 to-amber-50 dark:from-amber-900 dark:to-amber-800 border-0 shadow-md hover:shadow-lg transition">
          <UsersIcon className="w-10 h-10 text-amber-600 mb-2" />
          <h3 className="font-semibold text-lg text-amber-900 mb-1">Employee Directory</h3>
          <p className="text-sm text-amber-700 mb-3 text-center">
            Browse all university employees and their details.
          </p>
          <Link to="/hr/employees">
            <Button size="sm" variant="warning">
              View Employees
            </Button>
          </Link>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Medical Leaves */}
        <Card className="h-full flex flex-col dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pending Medical Leaves</h2>
            <Link to="/vc/medical-leaves">
              <Button size="sm" variant="outline">
                View All
              </Button>
            </Link>
          </div>
          {stats.pendingLeaves.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No pending medical leaves</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.pendingLeaves.slice(0, 5).map((leave) => {
                const employee = employees.find((e) => e.id === leave.employeeId);
                return (
                  <div
                    key={leave.id}
                    className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all bg-white/80"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {employee?.name || leave.employeeName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {employee?.department || leave.department} •{' '}
                          {employee?.code || leave.employeeCode}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <CalendarDaysIcon className="w-4 h-4" />
                          {leave.startDate && format(parseISO(leave.startDate), 'MMM dd')} -{' '}
                          {leave.endDate && format(parseISO(leave.endDate), 'MMM dd, yyyy')}
                          <span className="ml-2 font-medium">({leave.days} days)</span>
                        </div>
                      </div>
                      <Badge variant="warning" className="ml-2">
                        Pending
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="h-full flex flex-col dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((leave) => {
                const employee = employees.find((e) => e.id === leave.employeeId);
                const vcStep = leave.approvalChain?.find((s) => s.role === 'vc');
                return (
                  <div key={leave.id} className="p-4 border border-gray-200 rounded-xl bg-white/80">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {employee?.name || leave.employeeName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {employee?.department || leave.department}
                        </p>
                        {vcStep?.date && (
                          <p className="text-xs text-gray-500 mt-2">
                            {format(parseISO(vcStep.date), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={vcStep?.status === 'approved' ? 'success' : 'danger'}
                        className="ml-2"
                      >
                        {vcStep?.status === 'approved' ? 'Recommended' : 'Rejected'}
                      </Badge>
                    </div>
                    {vcStep?.comment && (
                      <p className="mt-2 text-sm text-gray-600 italic">"{vcStep.comment}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card className="mb-8 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Medical Leave Trends (Last 12 Months)
        </h2>
        <div className="w-full" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 14 }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorLeaves)"
                name="Medical Leaves"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* University Overview */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-blue-100 mb-4">
          University Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-xl">
            <UsersIcon className="w-8 h-8 text-blue-600 dark:text-blue-300 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-200">
              {employees.length}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Total Employees</p>
          </div>
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900 rounded-xl">
            <DocumentTextIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-300 mx-auto mb-2" />
            <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-200">
              {leaves.length}
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
              Total Leave Requests
            </p>
          </div>
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-900 rounded-xl">
            <ClockIcon className="w-8 h-8 text-amber-600 dark:text-amber-300 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-900 dark:text-amber-200">{stats.pending}</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Awaiting Your Review</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
