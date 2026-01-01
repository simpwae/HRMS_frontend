import { useMemo } from 'react';
import { useDataStore } from '../../../state/data';
import Card from '../../../components/Card';
import {
  ChartPieIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  Treemap,
} from 'recharts';

const COLORS = [
  '#8b5cf6',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

export default function VPAnalytics() {
  const employees = useDataStore((s) => s.employees);
  const attendance = useDataStore((s) => s.attendance);
  const leaves = useDataStore((s) => s.leaves);

  // Salary distribution analysis
  const salaryDistribution = useMemo(() => {
    const ranges = [
      { range: '< $30k', min: 0, max: 30000 },
      { range: '$30k-50k', min: 30000, max: 50000 },
      { range: '$50k-70k', min: 50000, max: 70000 },
      { range: '$70k-100k', min: 70000, max: 100000 },
      { range: '> $100k', min: 100000, max: Infinity },
    ];

    return ranges.map((r) => ({
      range: r.range,
      count: employees.filter((e) => (e.salaryBase || 0) >= r.min && (e.salaryBase || 0) < r.max)
        .length,
    }));
  }, [employees]);

  // Faculty performance metrics (simulated)
  const facultyMetrics = useMemo(() => {
    const faculties = [...new Set(employees.map((e) => e.faculty).filter(Boolean))];
    return faculties.map((faculty) => {
      const facultyEmps = employees.filter((e) => e.faculty === faculty);
      const avgSalary =
        facultyEmps.reduce((acc, e) => acc + (e.salaryBase || 0), 0) / facultyEmps.length;
      return {
        faculty: faculty.split(' ')[0], // Shorten for display
        staffCount: facultyEmps.length,
        attendance: Math.round(70 + Math.random() * 25), // Simulated
        efficiency: Math.round(65 + Math.random() * 30), // Simulated
        satisfaction: Math.round(60 + Math.random() * 35), // Simulated
      };
    });
  }, [employees]);

  // Designation hierarchy
  const designationData = useMemo(() => {
    const desigCount = {};
    employees.forEach((emp) => {
      desigCount[emp.designation] = (desigCount[emp.designation] || 0) + 1;
    });
    return Object.entries(desigCount)
      .map(([name, size]) => ({ name, size }))
      .sort((a, b) => b.size - a.size);
  }, [employees]);

  // Staff age distribution (simulated based on designation)
  const experienceVsSalary = useMemo(() => {
    return employees.slice(0, 50).map((emp) => ({
      name: emp.name,
      experience: Math.floor(Math.random() * 25) + 1,
      salary: (emp.salaryBase || 50000) / 1000,
      department: emp.department,
    }));
  }, [employees]);

  // Key Performance Indicators
  const kpis = useMemo(() => {
    const totalPayroll = employees.reduce((acc, e) => acc + (e.salaryBase || 0), 0);
    const activeRate =
      (employees.filter((e) => e.status === 'Active').length / employees.length) * 100;
    const avgSalary = totalPayroll / employees.length;
    const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;

    return [
      {
        label: 'Workforce Utilization',
        value: `${Math.round(activeRate)}%`,
        trend: 'up',
        change: '+2.3%',
        icon: UsersIcon,
        color: 'text-emerald-600',
      },
      {
        label: 'Avg. Compensation',
        value: `$${Math.round(avgSalary / 1000)}k`,
        trend: 'up',
        change: '+5.1%',
        icon: CurrencyDollarIcon,
        color: 'text-purple-600',
      },
      {
        label: 'Pending Actions',
        value: pendingLeaves,
        trend: pendingLeaves > 10 ? 'down' : 'neutral',
        change: pendingLeaves > 10 ? 'High' : 'Normal',
        icon: ChartPieIcon,
        color: pendingLeaves > 10 ? 'text-red-600' : 'text-blue-600',
      },
      {
        label: 'Departments',
        value: [...new Set(employees.map((e) => e.department))].length,
        trend: 'neutral',
        change: 'Stable',
        icon: BuildingOfficeIcon,
        color: 'text-amber-600',
      },
    ];
  }, [employees, leaves]);

  // Radar chart data for faculty comparison
  const radarData = useMemo(() => {
    const metrics = ['Attendance', 'Efficiency', 'Satisfaction', 'Growth', 'Retention'];
    return metrics.map((metric) => ({
      metric,
      ...facultyMetrics.reduce((acc, f) => {
        acc[f.faculty] = Math.round(60 + Math.random() * 35);
        return acc;
      }, {}),
    }));
  }, [facultyMetrics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
        <p className="text-gray-500 mt-1">Deep insights and performance analysis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              {kpi.trend === 'up' && <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />}
              {kpi.trend === 'down' && <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />}
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-500">{kpi.label}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Distribution */}
        <Card title="Salary Distribution" subtitle="Employee count by salary range">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {salaryDistribution.map((entry, index) => (
                    <Cell key={entry.range} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Faculty Performance Radar */}
        <Card title="Faculty Comparison" subtitle="Performance metrics across faculties">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                {facultyMetrics.slice(0, 3).map((f, i) => (
                  <Radar
                    key={f.faculty}
                    name={f.faculty}
                    dataKey={f.faculty}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.2}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Designation Distribution */}
        <Card title="Designation Hierarchy" subtitle="Staff count by designation">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={designationData.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="size"
                  label={({ name, percent }) =>
                    `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {designationData.slice(0, 6).map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Experience vs Salary */}
        <Card title="Experience vs Salary" subtitle="Correlation analysis">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="experience" name="Experience" unit=" yrs" tick={{ fontSize: 11 }} />
                <YAxis dataKey="salary" name="Salary" unit="k" tick={{ fontSize: 11 }} />
                <ZAxis range={[60, 200]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Employees" data={experienceVsSalary} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Faculty Metrics Table */}
      <Card title="Faculty Performance Metrics">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Faculty
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Staff
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Attendance
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Efficiency
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                  Satisfaction
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {facultyMetrics.map((faculty, index) => (
                <tr key={faculty.faculty} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900">{faculty.faculty}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {faculty.staffCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-sm font-medium ${faculty.attendance >= 85 ? 'text-emerald-600' : faculty.attendance >= 70 ? 'text-amber-600' : 'text-red-600'}`}
                    >
                      {faculty.attendance}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-sm font-medium ${faculty.efficiency >= 85 ? 'text-emerald-600' : faculty.efficiency >= 70 ? 'text-amber-600' : 'text-red-600'}`}
                    >
                      {faculty.efficiency}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-sm font-medium ${faculty.satisfaction >= 85 ? 'text-emerald-600' : faculty.satisfaction >= 70 ? 'text-amber-600' : 'text-red-600'}`}
                    >
                      {faculty.satisfaction}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
