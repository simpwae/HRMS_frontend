import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import {
  useDataStore,
  faculties,
  departments,
  designations,
  sendNewEmployeeNotification,
} from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import InputWithIcon from '../../../components/InputWithIcon';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import Avatar from '../../../components/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import {
  ArrowDownTrayIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
  EyeIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

export default function Employees() {
  const user = useAuthStore((s) => s.user);
  const {
    employees,
    addEmployee,
    updateEmployee,
    removeEmployee,
    addLifecycleEntry,
    renewContract,
  } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [renewalDate, setRenewalDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      code: '',
      name: '',
      email: '',
      phone: '',
      department: 'CS',
      faculty: 'Computing',
      designation: 'Lecturer',
      joinDate: format(new Date(), 'yyyy-MM-dd'),
      salaryBase: 100000,
      status: 'Active',
      gender: 'male',
      employmentStatus: 'confirmed',
      probationEndDate: '',
      cnic: '',
      bankAccount: '',
      address: '',
      emergencyContact: '',
    },
  });

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchQuery, filterDepartment, filterStatus]);

  // Handle form submit
  const onSubmit = (data) => {
    // Clean up probation end date if not on probation
    const cleanedData = {
      ...data,
      salaryBase: parseInt(data.salaryBase),
      probationEndDate:
        data.employmentStatus === 'probation' && data.probationEndDate
          ? data.probationEndDate
          : null,
    };

    if (selectedEmployee) {
      updateEmployee(selectedEmployee.id, cleanedData);
    } else {
      addEmployee(cleanedData);

      // Send new employee notification emails to all employees except current user
      sendNewEmployeeNotification(
        {
          name: cleanedData.name,
          code: cleanedData.code || `EMP${String(employees.length + 1).padStart(3, '0')}`,
          email: cleanedData.email,
          designation: cleanedData.designation,
          department: cleanedData.department,
          joinDate: cleanedData.joinDate,
        },
        user?.email,
      );
    }
    handleCloseModal();
  };

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setSelectedEmployee(employee);
      Object.keys(employee).forEach((key) => {
        setValue(key, employee[key]);
      });
    } else {
      setSelectedEmployee(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    reset();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      removeEmployee(id);
    }
  };

  const handleExport = () => {
    const headers = [
      'Code',
      'Name',
      'Email',
      'Department',
      'Faculty',
      'Designation',
      'Join Date',
      'Status',
      'Salary',
    ];
    const rows = employees.map((emp) => [
      emp.code,
      emp.name,
      emp.email,
      emp.department,
      emp.faculty,
      emp.designation,
      emp.joinDate,
      emp.status,
      emp.salaryBase,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage employee records and information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <PlusIcon className="w-4 h-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <InputWithIcon
              type="text"
              placeholder="Search by name, code, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              inputClassName="pr-4 py-2"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
          </select>
        </div>
      </Card>

      {/* Employee Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Employee
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Department
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Designation
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Join Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} size="sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{emp.name}</p>
                            <Badge
                              variant={emp.gender === 'female' ? 'info' : 'secondary'}
                              className="text-xs"
                            >
                              {emp.gender === 'female' ? '♀ Female' : '♂ Male'}
                            </Badge>
                            {emp.employmentStatus === 'probation' && (
                              <Badge variant="warning" className="text-xs">
                                Probation
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {emp.code} • {emp.email}
                          </p>
                          {emp.employmentStatus === 'probation' && emp.probationEndDate && (
                            <p className="text-xs text-orange-600 mt-1">
                              Probation ends:{' '}
                              {format(parseISO(emp.probationEndDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">{emp.department}</p>
                      <p className="text-xs text-gray-500">{emp.faculty}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{emp.designation}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {emp.joinDate ? format(parseISO(emp.joinDate), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          emp.status === 'Active'
                            ? 'success'
                            : emp.status === 'On Leave'
                              ? 'warning'
                              : 'error'
                        }
                      >
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setViewEmployee(emp)}>
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleOpenModal(emp)}>
                          <PencilSquareIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(emp.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <p className="text-sm text-gray-500">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>
      </Card>

      {/* Add/Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="basic">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('code', { required: 'Employee code is required' })}
                    placeholder="EMP001"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.code && (
                    <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    placeholder="John Doe"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    placeholder="john@cecos.edu.pk"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    {...register('phone')}
                    placeholder="+92-XXX-XXXXXXX"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-4 pt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                  <select
                    {...register('faculty')}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {Object.keys(faculties).map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    {...register('department')}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <select
                    {...register('designation')}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {designations.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    {...register('status')}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    {...register('gender')}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Status
                  </label>
                  <select
                    {...register('employmentStatus')}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="probation">Probation</option>
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <input
                    type="date"
                    {...register('joinDate')}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Salary (PKR)
                  </label>
                  <input
                    type="number"
                    {...register('salaryBase')}
                    placeholder="100000"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probation End Date
                  <span className="text-gray-500 text-xs ml-2">
                    (Auto-calculated if on probation, otherwise leave empty)
                  </span>
                </label>
                <input
                  type="date"
                  {...register('probationEndDate')}
                  disabled={watch('employmentStatus') !== 'probation'}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Only applicable for probation status</p>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 pt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('cnic', { required: 'CNIC is required' })}
                    placeholder="XXXXX-XXXXXXX-X"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.cnic && (
                    <p className="text-sm text-red-600 mt-1">{errors.cnic.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('bankAccount', { required: 'Bank account is required' })}
                    placeholder="Bank-AccountNumber"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.bankAccount && (
                    <p className="text-sm text-red-600 mt-1">{errors.bankAccount.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('address', { required: 'Address is required' })}
                  rows={2}
                  placeholder="Enter address"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('emergencyContact', { required: 'Emergency contact is required' })}
                  placeholder="+92-XXX-XXXXXXX"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.emergencyContact && (
                  <p className="text-sm text-red-600 mt-1">{errors.emergencyContact.message}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : selectedEmployee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Employee Modal */}
      <Modal
        isOpen={!!viewEmployee}
        onClose={() => setViewEmployee(null)}
        title="Employee Details"
        size="lg"
      >
        {viewEmployee && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Avatar name={viewEmployee.name} size="xl" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewEmployee.name}</h3>
                <p className="text-gray-500">{viewEmployee.designation}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="primary">{viewEmployee.department}</Badge>
                  <Badge variant={viewEmployee.status === 'Active' ? 'success' : 'warning'}>
                    {viewEmployee.status}
                  </Badge>
                  <Badge variant={viewEmployee.gender === 'female' ? 'info' : 'secondary'}>
                    {viewEmployee.gender === 'female' ? '♀ Female' : '♂ Male'}
                  </Badge>
                  {viewEmployee.employmentStatus === 'probation' && (
                    <Badge variant="warning">Probation</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <BuildingOffice2Icon className="w-5 h-5" />
                  <span>{viewEmployee.faculty}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>{viewEmployee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <PhoneIcon className="w-5 h-5" />
                  <span>{viewEmployee.phone || 'Not provided'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Employee Code</p>
                  <p className="font-medium">{viewEmployee.code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Join Date</p>
                  <p className="font-medium">
                    {viewEmployee.joinDate
                      ? format(parseISO(viewEmployee.joinDate), 'MMMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Base Salary</p>
                  <p className="font-medium">{formatCurrency(viewEmployee.salaryBase)}</p>
                </div>
                {viewEmployee.employmentStatus === 'probation' && viewEmployee.probationEndDate && (
                  <div>
                    <p className="text-xs text-gray-500">Probation End Date</p>
                    <p className="font-medium text-orange-600">
                      {format(parseISO(viewEmployee.probationEndDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Leave Balance */}
            {viewEmployee.leaveBalance && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Leave Balance</p>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(viewEmployee.leaveBalance).map(([type, days]) => (
                    <div key={type} className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900">{days}</p>
                      <p className="text-xs text-gray-500 capitalize">{type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewEmployee.salaryHistory && viewEmployee.salaryHistory.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Salary History</p>
                <div className="max-h-60 overflow-y-auto divide-y border rounded-lg">
                  {viewEmployee.salaryHistory
                    .slice()
                    .reverse()
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(entry.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {entry.type} • {entry.reason}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {entry.effectiveDate
                            ? format(parseISO(entry.effectiveDate), 'MMM d, yyyy')
                            : 'N/A'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {viewEmployee.lifecycle && viewEmployee.lifecycle.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Lifecycle</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {viewEmployee.lifecycle
                    .slice()
                    .reverse()
                    .map((item) => (
                      <div key={item.id} className="p-3 rounded-lg bg-gray-50 border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-gray-900 capitalize">
                            {item.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.effectiveDate
                              ? format(parseISO(item.effectiveDate), 'MMM d, yyyy')
                              : item.createdAt}
                          </span>
                        </div>
                        {item.meta && (
                          <p className="text-xs text-gray-600 mt-1">
                            {Object.entries(item.meta)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2 border-t">
              {viewEmployee.employmentStatus === 'probation' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    addLifecycleEntry(viewEmployee.id, {
                      type: 'confirmation',
                      title: 'Confirmation',
                      meta: { from: 'probation', to: 'confirmed' },
                    });
                    updateEmployee(viewEmployee.id, { employmentStatus: 'confirmed' });
                  }}
                >
                  Mark Confirmed
                </Button>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>Contract renewal</span>
                  <input
                    type="date"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    renewContract(viewEmployee.id, {
                      newEndDate: renewalDate,
                      effectiveDate: renewalDate,
                      status: 'active',
                    })
                  }
                >
                  Renew
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setViewEmployee(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewEmployee(null);
                  handleOpenModal(viewEmployee);
                }}
              >
                Edit Employee
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
