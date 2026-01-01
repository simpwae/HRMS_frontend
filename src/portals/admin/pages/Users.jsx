import { useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import Avatar from '../../../components/Avatar';
import InputWithIcon from '../../../components/InputWithIcon';
import { useDataStore } from '../../../state/data';
import { roleNames } from '../../../state/auth';

export default function Users() {
  const { employees } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock users combining employees with system users
  const systemUsers = [
    {
      id: 'u-admin',
      name: 'System Administrator',
      email: 'admin@cecos.edu.pk',
      role: 'admin',
      status: 'Active',
      lastLogin: '2 min ago',
    },
    {
      id: 'u-hr',
      name: 'Sarah Khan',
      email: 'hr@cecos.edu.pk',
      role: 'hr',
      status: 'Active',
      lastLogin: '1 hour ago',
    },
    {
      id: 'u-vp',
      name: 'Dr. Ahmad Malik',
      email: 'vp@cecos.edu.pk',
      role: 'vp',
      status: 'Active',
      lastLogin: '3 hours ago',
    },
    {
      id: 'u-dean',
      name: 'Prof. Fatima Ali',
      email: 'dean.computing@cecos.edu.pk',
      role: 'dean',
      status: 'Active',
      lastLogin: '1 day ago',
    },
    {
      id: 'u-hod',
      name: 'Dr. Imran Shah',
      email: 'hod.cs@cecos.edu.pk',
      role: 'hod',
      status: 'Active',
      lastLogin: '5 hours ago',
    },
  ];

  const allUsers = [
    ...systemUsers,
    ...employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: 'employee',
      status: emp.status,
      lastLogin: 'N/A',
      department: emp.department,
    })),
  ];

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'vp':
        return 'primary';
      case 'dean':
        return 'warning';
      case 'hod':
        return 'success';
      case 'hr':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage system users and their roles</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusIcon className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <Card>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="max-w-md">
            <InputWithIcon
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              inputClassName="pr-4 py-2"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Last Login
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {roleNames[user.role] || user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={user.status === 'Active' ? 'success' : 'warning'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{user.lastLogin}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                        <ShieldCheckIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found matching your search.
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]"
              placeholder="user@cecos.edu.pk"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[hsl(var(--color-primary))] focus:ring-2 focus:ring-[hsl(var(--color-primary)/0.1)]">
              <option value="employee">Employee</option>
              <option value="hr">HR Manager</option>
              <option value="hod">Head of Department</option>
              <option value="dean">Dean</option>
              <option value="vp">Vice President</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
