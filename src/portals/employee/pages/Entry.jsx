import { useState } from 'react';
import { useDataStore } from '../../../state/data';
import Card from '../../../components/Card';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';

export default function Entry() {
  const addEmployee = useDataStore((s) => s.addEmployee);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    designation: '',
    joinDate: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEmp = {
      id: `e${Date.now()}`,
      code: `EMP${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`,
      ...formData,
      status: 'Active',
      salaryBase: 4000,
    };
    addEmployee(newEmp);
    alert('Employee entry submitted!');
    setFormData({ name: '', department: '', designation: '', joinDate: '' });
  };

  return (
    <Card title="New Employee Entry" subtitle="Fill in your details to register">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name" id="name" required>
          <input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </FormField>
        <FormField label="Department" id="department" required>
          <input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </FormField>
        <FormField label="Designation" id="designation" required>
          <input
            id="designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </FormField>
        <FormField label="Join Date" id="joinDate" required>
          <input
            id="joinDate"
            type="date"
            value={formData.joinDate}
            onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </FormField>
        <Button type="submit">Submit Entry</Button>
      </form>
    </Card>
  );
}
