import { useState } from 'react';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import FormField from '../../../components/FormField';
import { ArrowDownTrayIcon, PencilIcon } from '@heroicons/react/24/outline';
import Papa from 'papaparse';

export default function DeptEmployees() {
    const employees = useDataStore((s) => s.employees);
    const user = useAuthStore((s) => s.user);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const deptEmployees = employees.filter(e => e.department === user.department);

    const handleExport = () => {
        const csv = Papa.unparse(deptEmployees);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dept_${user.department}_employees.csv`;
        a.click();
    };

    const handleEdit = (emp) => {
        setEditingEmployee({ ...emp });
    };

    const handleSave = () => {
        // In a real app, update the store. For now, just close modal.
        console.log('Saving employee:', editingEmployee);
        setEditingEmployee(null);
    };

    return (
        <>
            <Card
                title={`Department Staff: ${user.department}`}
                subtitle="Manage your department's teachers and staff"
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {deptEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{emp.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{emp.designation}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <Badge variant={emp.status === 'Active' ? 'success' : 'default'}>
                                            {emp.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        <button
                                            onClick={() => handleEdit(emp)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                open={!!editingEmployee}
                onClose={() => setEditingEmployee(null)}
                title="Edit Employee"
                actions={
                    <>
                        <Button variant="outline" onClick={() => setEditingEmployee(null)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </>
                }
            >
                {editingEmployee && (
                    <div className="space-y-4">
                        <FormField label="Full Name" id="edit-name">
                            <input
                                id="edit-name"
                                type="text"
                                className="w-full border-gray-300 rounded-md shadow-xs focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                                value={editingEmployee.name}
                                onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Designation" id="edit-designation">
                            <input
                                id="edit-designation"
                                type="text"
                                className="w-full border-gray-300 rounded-md shadow-xs focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                                value={editingEmployee.designation}
                                onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                            />
                        </FormField>
                        <FormField label="Status" id="edit-status">
                            <select
                                id="edit-status"
                                className="w-full border-gray-300 rounded-md shadow-xs focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
                                value={editingEmployee.status}
                                onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </FormField>
                    </div>
                )}
            </Modal>
        </>
    );
}
