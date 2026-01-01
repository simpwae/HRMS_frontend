import { useDataStore } from '../../../state/data';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Papa from 'papaparse';

export default function AttendanceList() {
  const { employees, attendance } = useDataStore();

  const attendanceWithNames = attendance.map((a) => {
    const emp = employees.find((e) => e.id === a.employeeId);
    return { ...a, employeeName: emp?.name, employeeCode: emp?.code };
  });

  const handleExport = () => {
    const csv = Papa.unparse(attendanceWithNames);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance.csv';
    link.click();
  };

  const getBadgeVariant = (status) => {
    if (status === 'Present') return 'success';
    if (status === 'Late') return 'warning';
    if (status === 'Absent') return 'error';
    return 'default';
  };

  return (
    <Card
      title="Attendance Records"
      subtitle="View employee attendance"
      actions={
        <Button variant="outline" onClick={handleExport}>
          <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Clock In
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Clock Out
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attendanceWithNames.map((att) => (
              <tr key={att.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{att.employeeCode}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{att.employeeName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{att.date}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{att.clockIn}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{att.clockOut}</td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant={getBadgeVariant(att.status)}>{att.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
