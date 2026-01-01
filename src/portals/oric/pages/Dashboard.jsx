import React from 'react';
import Card from '../../../components/Card';
import StatCard from '../../../components/StatCard';
import Button from '../../../components/Button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { dummyPublications, dummyGrants, dummyProjects } from '../data/oricData';

export default function Dashboard() {
  const publications = dummyPublications;
  const grants = dummyGrants;
  const projects = dummyProjects;

  const handleDownload = () => {
    const headers = ['Section', 'Title', 'Detail', 'Year', 'Amount/Impact'];

    const rows = [
      ...projects.map((p) => [
        'Project',
        p.title,
        `${p.department} • ${p.status}`,
        p.year,
        p.budget,
      ]),
      ...grants.map((g) => ['Grant', g.title, g.agency, g.year, g.amount]),
      ...publications.map((pub) => ['Publication', pub.title, pub.journal, pub.year, pub.impact]),
    ];

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'oric-dashboard-data.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Aggregate project data
  const projectsByDept = Object.values(
    projects.reduce((acc, proj) => {
      acc[proj.department] = acc[proj.department] || { department: proj.department, count: 0 };
      acc[proj.department].count += 1;
      return acc;
    }, {}),
  );

  const projectStatus = ['Active', 'Completed', 'Pending'].map((status) => ({
    name: status,
    value: projects.filter((p) => p.status === status).length,
  }));

  const budgetsByYear = Object.values(
    projects.reduce((acc, proj) => {
      const clean = Number((proj.budget || '0').replace(/[$,]/g, ''));
      acc[proj.year] = acc[proj.year] || { year: proj.year, budget: 0 };
      acc[proj.year].budget += clean;
      return acc;
    }, {}),
  ).sort((a, b) => a.year.localeCompare(b.year));

  const topBudgets = [...projects]
    .map((p) => ({ ...p, budgetValue: Number((p.budget || '0').replace(/[$,]/g, '')) }))
    .sort((a, b) => b.budgetValue - a.budgetValue)
    .slice(0, 4)
    .map((p, idx) => ({ ...p, fill: ['#4f46e5', '#0ea5e9', '#22c55e', '#f59e0b'][idx % 4] }));

  const pieColors = ['#4f46e5', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">ORIC Dashboard</h2>
          <p className="text-gray-500 mt-1">Key metrics and research performance at a glance.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleDownload} className="shadow-md">
          Download Excel (CSV)
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Active Grants"
          value={grants.length}
          icon={CurrencyDollarIcon}
          color="success"
        />
        <StatCard
          title="Publications"
          value={publications.length}
          icon={DocumentTextIcon}
          color="info"
        />
      </div>

      {/* Project Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Projects by Department">
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={projectsByDept} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="deptGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="department" stroke="#6b7280" style={{ fontSize: '0.8rem' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '0.8rem' }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="url(#deptGradient)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Project Status Mix">
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={projectStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  label
                >
                  {projectStatus.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Project Budget by Year">
          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={budgetsByYear} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#bbf7d0" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '0.8rem' }} />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '0.8rem' }}
                  tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                <Area
                  type="monotone"
                  dataKey="budget"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fill="url(#budgetGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top Project Budgets">
          <div className="h-112 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="22%"
                outerRadius="100%"
                barSize={16}
                data={topBudgets}
              >
                <RadialBar
                  background
                  dataKey="budgetValue"
                  cornerRadius={8}
                  label={{
                    position: 'insideStart',
                    fill: '#fff',
                    fontSize: 10,
                    formatter: (v) => `$${Math.round(v / 1000)}k`,
                  }}
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: 11, lineHeight: '16px', right: 8, top: 8 }}
                  formatter={(value, entry) => `${entry.payload.title}`}
                />
                <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Publications */}
      <Card title="Recent Publications">
        <div className="space-y-4">
          {publications.slice(0, 5).map((pub) => (
            <div key={pub.id} className="border-b border-gray-200 pb-4 last:border-0">
              <h4 className="text-sm font-semibold text-gray-900">{pub.title}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {pub.authors} • {pub.journal}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-gray-500">Year: {pub.year}</span>
                <span className="text-xs font-medium text-blue-600">
                  Impact Factor: {pub.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Grants */}
      <Card title="Active Grants">
        <div className="space-y-3">
          {grants.map((grant) => (
            <div key={grant.id} className="p-3 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-900">{grant.title}</h5>
              <p className="text-xs text-gray-600 mt-1">Agency: {grant.agency}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-green-600">{grant.amount}</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  {grant.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
