import { useDataStore } from '../../../state/data';
import Card from '../../../components/Card';
import { UsersIcon, BuildingOfficeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VPDashboard() {
    const employees = useDataStore((s) => s.employees);
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const departments = [...new Set(employees.map(e => e.department))].length;
    const totalSalary = employees.reduce((acc, curr) => acc + (curr.salaryBase || 0), 0);

    const stats = [
        { label: 'Total Employees', value: totalEmployees, icon: UsersIcon, color: 'from-blue-500 to-cyan-500' },
        { label: 'Active Staff', value: activeEmployees, icon: UsersIcon, color: 'from-emerald-500 to-teal-500' },
        { label: 'Departments', value: departments, icon: BuildingOfficeIcon, color: 'from-amber-400 to-orange-500' },
        { label: 'Total Payroll', value: `$${totalSalary.toLocaleString()}`, icon: CurrencyDollarIcon, color: 'from-purple-500 to-fuchsia-500' },
    ];

    // Generate realistic payroll trend data (last 6 months)
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const payrollData = months.map((month, index) => {
        // Simulate slight growth over time with some variation
        const basePayroll = totalSalary * 0.85; // Start at 85% of current
        const growth = (totalSalary - basePayroll) / 5 * index;
        const variation = (Math.random() - 0.5) * totalSalary * 0.03; // ±3% variation
        return {
            month,
            payroll: Math.round(basePayroll + growth + variation)
        };
    });

    // Custom tooltip for better UX
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass p-3 rounded-lg shadow-lg border border-white/20">
                    <p className="text-sm font-semibold text-gray-900">{payload[0].payload.month}</p>
                    <p className="text-lg font-bold text-purple-600">
                        ${payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Overview</h2>
                <p className="text-gray-500 mt-1">High-level insights and performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass p-6 rounded-2xl card-hover relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${stat.color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-linear-to-br ${stat.color} text-white shadow-lg`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Department Distribution">
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <div className="text-center">
                            <BuildingOfficeIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-400 font-medium">Distribution Chart</p>
                        </div>
                    </div>
                </Card>
                <Card title="Payroll Trends">
                    <div className="h-64 pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={payrollData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#6b7280"
                                    style={{ fontSize: '0.875rem', fontWeight: 500 }}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    style={{ fontSize: '0.75rem' }}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="payroll"
                                    stroke="url(#colorGradient)"
                                    strokeWidth={3}
                                    dot={{ fill: '#a855f7', r: 5 }}
                                    activeDot={{ r: 7, fill: '#9333ea' }}
                                />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#d946ef" />
                                    </linearGradient>
                                </defs>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
