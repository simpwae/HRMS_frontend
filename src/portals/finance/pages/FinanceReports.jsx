import Card from '../../../components/Card';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

export default function FinanceReports() {
  const reportData = [
    { month: 'Oct', approved: 12, rejected: 2, total: 45000000 },
    { month: 'Nov', approved: 15, rejected: 3, total: 52000000 },
    { month: 'Dec', approved: 8, rejected: 1, total: 38000000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance Reports</h1>
        <p className="text-gray-600">Monthly provident fund statistics and trends</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-indigo-50 border-indigo-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Disbursed</p>
              <p className="text-2xl font-bold text-gray-900">PKR 1.45 Cr</p>
              <p className="text-xs text-indigo-600 mt-1">This quarter</p>
            </div>
            <BanknotesIcon className="w-8 h-8 text-indigo-400" />
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-xs text-green-600 mt-1">This quarter</p>
            </div>
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Requests</p>
              <p className="text-2xl font-bold text-gray-900">147</p>
              <p className="text-xs text-blue-600 mt-1">Total received</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">5 days</p>
              <p className="text-xs text-purple-600 mt-1">Processing time</p>
            </div>
            <CalendarDaysIcon className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-gray-600">Month</th>
                <th className="px-4 py-2 text-right text-gray-600">Approved</th>
                <th className="px-4 py-2 text-right text-gray-600">Rejected</th>
                <th className="px-4 py-2 text-right text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => (
                <tr key={row.month} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{row.month}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">
                    {row.approved}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-semibold">
                    {row.rejected}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    PKR {(row.total / 10000000).toFixed(1)} Cr
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
