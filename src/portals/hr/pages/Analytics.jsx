import { useState, useMemo } from 'react';
import { format, parseISO, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useDataStore, faculties } from '../../../state/data';
import Card from '../../../components/Card';
import {
  UsersIcon,
  UserPlusIcon,
  UserMinusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
];

export default function Analytics() {
  const { employees, exEmployees, resignations, promotions } = useDataStore();
  const getPerformanceAnalytics = useDataStore((s) => s.getPerformanceAnalytics);
  const [timeRange, setTimeRange] = useState('12'); // months

  // Current workforce stats
  const workforceStats = useMemo(() => {
    const active = employees.filter((e) => e.status === 'Active').length;
    const onLeave = employees.filter((e) => e.status === 'On Leave').length;
    const total = employees.length;
    const totalExEmployees = exEmployees.length;

    return { active, onLeave, total, totalExEmployees };
  }, [employees, exEmployees]);

  // Monthly hiring & attrition data
  const monthlyData = useMemo(() => {
    const months = parseInt(timeRange);
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      // Count new hires (employees who joined this month)
      const hired = employees.filter((emp) => {
        if (!emp.joinDate) return false;
        const joinDate = parseISO(emp.joinDate);
        return isWithinInterval(joinDate, { start: monthStart, end: monthEnd });
      }).length;

      // Count departures (ex-employees who left this month)
      const left = exEmployees.filter((a) => {
        if (!a.exitDate) return false;
        const exitDate = parseISO(a.exitDate);
        return isWithinInterval(exitDate, { start: monthStart, end: monthEnd });
      }).length;

      data.push({
        month: format(month, 'MMM yyyy'),
        shortMonth: format(month, 'MMM'),
        hired,
        left,
        netChange: hired - left,
      });
    }

    return data;
  }, [employees, exEmployees, timeRange]);

  // Department distribution
  const departmentData = useMemo(() => {
    const deptCounts = {};
    employees.forEach((emp) => {
      deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
    });

    return Object.entries(deptCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [employees]);

  // Faculty distribution
  const facultyData = useMemo(() => {
    const facCounts = {};
    employees.forEach((emp) => {
      facCounts[emp.faculty] = (facCounts[emp.faculty] || 0) + 1;
    });

    return Object.entries(facCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [employees]);

  // Exit reasons analysis
  const exitReasonData = useMemo(() => {
    const reasonCounts = {};
    exEmployees.forEach((a) => {
      const reason = a.exitReason || 'Other';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    return Object.entries(reasonCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [exEmployees]);

  // Designation distribution
  const designationData = useMemo(() => {
    const desCounts = {};
    employees.forEach((emp) => {
      desCounts[emp.designation] = (desCounts[emp.designation] || 0) + 1;
    });

    return Object.entries(desCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [employees]);

  // Average tenure
  const avgTenure = useMemo(() => {
    const tenures = employees
      .filter((e) => e.joinDate)
      .map((e) => {
        const years = (new Date() - parseISO(e.joinDate)) / (365.25 * 24 * 60 * 60 * 1000);
        return years;
      });

    if (tenures.length === 0) return 0;
    return (tenures.reduce((a, b) => a + b, 0) / tenures.length).toFixed(1);
  }, [employees]);

  // Pending actions
  const pendingActions = useMemo(() => {
    const pendingPromotions = promotions.filter(
      (p) => p.status === 'Pending' || p.status === 'Under Review',
    ).length;
    const pendingResignations = resignations.filter(
      (r) => r.status === 'Pending' || r.status === 'Approved',
    ).length;

    return { pendingPromotions, pendingResignations };
  }, [promotions, resignations]);

  // Year-over-year change
  const yoyChange = useMemo(() => {
    const totalHired = monthlyData.reduce((sum, m) => sum + m.hired, 0);
    const totalLeft = monthlyData.reduce((sum, m) => sum + m.left, 0);
    const netChange = totalHired - totalLeft;

    return { totalHired, totalLeft, netChange };
  }, [monthlyData]);

  const perf = useMemo(() => getPerformanceAnalytics(), [getPerformanceAnalytics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workforce Analytics</h1>
          <p className="text-gray-600">Comprehensive overview of employee statistics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="6">Last 6 Months</option>
          <option value="12">Last 12 Months</option>
          <option value="24">Last 24 Months</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700">Current Workforce</p>
              <p className="text-3xl font-bold text-indigo-900 mt-1">{workforceStats.total}</p>
              <p className="text-xs text-indigo-600 mt-1">{workforceStats.active} active</p>
            </div>
            <div className="p-3 bg-indigo-500 rounded-lg">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">New Hires</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{yoyChange.totalHired}</p>
              <p className="text-xs text-green-600 mt-1">in last {timeRange} months</p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <UserPlusIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-linear-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Departures</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{yoyChange.totalLeft}</p>
              <p className="text-xs text-red-600 mt-1">in last {timeRange} months</p>
            </div>
            <div className="p-3 bg-red-500 rounded-lg">
              <UserMinusIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card
          className={`bg-linear-to-br ${yoyChange.netChange >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-sm font-medium ${yoyChange.netChange >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}
              >
                Net Change
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${yoyChange.netChange >= 0 ? 'text-emerald-900' : 'text-orange-900'}`}
              >
                {yoyChange.netChange >= 0 ? '+' : ''}
                {yoyChange.netChange}
              </p>
              <p
                className={`text-xs mt-1 ${yoyChange.netChange >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}
              >
                {yoyChange.netChange >= 0 ? 'Growth' : 'Decline'}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${yoyChange.netChange >= 0 ? 'bg-emerald-500' : 'bg-orange-500'}`}
            >
              {yoyChange.netChange >= 0 ? (
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              ) : (
                <ArrowTrendingDownIcon className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{avgTenure}</p>
            <p className="text-sm text-gray-500">Avg. Tenure (Years)</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{workforceStats.totalExEmployees}</p>
            <p className="text-sm text-gray-500">Total Ex-Employees</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-600">{pendingActions.pendingPromotions}</p>
            <p className="text-sm text-gray-500">Pending Promotions</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{pendingActions.pendingResignations}</p>
            <p className="text-sm text-gray-500">Active Resignations</p>
          </div>
        </Card>
      </div>

      {/* Hiring & Attrition Trend */}
      <Card title="Hiring & Attrition Trend" subtitle="Monthly employee movement">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLeft" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortMonth" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="hired"
                name="New Hires"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorHired)"
              />
              <Area
                type="monotone"
                dataKey="left"
                name="Departures"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorLeft)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Distribution */}
        <Card title="Faculty Distribution" subtitle="Employees by faculty">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={facultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {facultyData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Distribution */}
        <Card title="Department Distribution" subtitle="Top departments by headcount">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Designation Distribution */}
        <Card title="Designation Distribution" subtitle="Employees by role">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={designationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Exit Reasons */}
        <Card title="Exit Reasons Analysis" subtitle="Why employees leave">
          <div className="h-64">
            {exitReasonData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No departure data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={exitReasonData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {exitReasonData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Net Change Trend */}
      <Card title="Net Workforce Change" subtitle="Monthly growth/decline">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortMonth" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="netChange"
                name="Net Change"
                fill={(entry) => (entry.netChange >= 0 ? '#22c55e' : '#ef4444')}
                radius={[4, 4, 0, 0]}
              >
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.netChange >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Performance Analytics */}
      <Card title="Performance Analytics (PAMS)" subtitle="Average ratings and top performers">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Average Rating by Department</h3>
            {perf.avgByDepartment.length === 0 ? (
              <div className="text-sm text-gray-500">No performance reviews available.</div>
            ) : (
              <div className="space-y-3">
                {perf.avgByDepartment.map((row) => (
                  <div key={row.department} className="flex items-center justify-between">
                    <span className="text-gray-600">{row.department}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(row.averageRating / 5) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium w-12 text-right">{row.averageRating}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Top Performers</h3>
            {perf.topPerformers.length === 0 ? (
              <div className="text-sm text-gray-500">No performance reviews available.</div>
            ) : (
              <div className="space-y-2">
                {perf.topPerformers.map((p) => (
                  <div
                    key={p.employeeId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.department}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">{p.rating}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Overall Average Rating:{' '}
          <span className="font-semibold text-gray-900">{perf.overallAvg}</span> ({perf.count}{' '}
          reviews)
        </div>
      </Card>

      {/* Quick Stats Table */}
      <Card title="Department Summary" subtitle="Headcount by department">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Department
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                  Active
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                  On Leave
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept) => {
                const deptEmployees = employees.filter((e) => e.department === dept.name);
                const active = deptEmployees.filter((e) => e.status === 'Active').length;
                const onLeave = deptEmployees.filter((e) => e.status === 'On Leave').length;
                const percentage = ((dept.value / workforceStats.total) * 100).toFixed(1);

                return (
                  <tr key={dept.name} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[departmentData.indexOf(dept) % COLORS.length],
                          }}
                        />
                        <span className="font-medium text-gray-900">{dept.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">{dept.value}</td>
                    <td className="py-3 px-4 text-center text-green-600">{active}</td>
                    <td className="py-3 px-4 text-center text-amber-600">{onLeave}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
