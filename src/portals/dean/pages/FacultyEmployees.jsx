import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Papa from 'papaparse';

export default function FacultyEmployees() {
    const employees = useDataStore((s) => s.employees);
    const user = useAuthStore((s) => s.user);

    const facultyEmployees = employees.filter(e => e.faculty === user.faculty);

    const handleExport = () => {
        const csv = Papa.unparse(facultyEmployees);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `faculty_${user.faculty}_employees.csv`;
        a.click();
    };

    return (
        <Card
            title={`Faculty Staff: ${user.faculty}`}
            subtitle="View staff records for your faculty"
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {facultyEmployees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.code}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{emp.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{emp.department}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{emp.designation}</td>
                                <td className="px-4 py-3 text-sm">
                                    <Badge variant={emp.status === 'Active' ? 'success' : 'default'}>
                                        {emp.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
