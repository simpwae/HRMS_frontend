import { useState, useMemo } from 'react';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  format,
  parseISO,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
} from 'date-fns';
import InputWithIcon from '../../../components/InputWithIcon';
import Papa from 'papaparse';

export default function FacultyAttendance() {
  const employees = useDataStore((s) => s.employees);
  const attendance = useDataStore((s) => s.attendance);
  const user = useAuthStore((s) => s.user);

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly

  // Filter employees by faculty
  const facultyEmployees = useMemo(
    () => employees.filter((e) => e.faculty === user.faculty),
    [employees, user.faculty],
  );

  const facultyEmployeeIds = useMemo(
    () => new Set(facultyEmployees.map((e) => e.id)),
    [facultyEmployees],
  );

  // Get unique departments
  const departments = useMemo(
    () => [...new Set(facultyEmployees.map((e) => e.department))].sort(),
    [facultyEmployees],
  );

  // Filter attendance for selected date
  const dailyAttendance = useMemo(() => {
    return facultyEmployees
      .filter((emp) => {
        const matchesSearch =
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
        return matchesSearch && matchesDept;
      })
      .map((emp) => {
        const record = attendance.find((a) => a.employeeId === emp.id && a.date === selectedDate);
        return {
          ...emp,
          attendance: record || null,
        };
      });
  }, [facultyEmployees, attendance, selectedDate, searchTerm, selectedDepartment]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const records = attendance.filter(
      (a) => a.date === selectedDate && facultyEmployeeIds.has(a.employeeId),
    );
    return {
      total: facultyEmployees.length,
      present: records.filter((r) => r.status === 'Present').length,
      absent: records.filter((r) => r.status === 'Absent').length,
      late: records.filter((r) => r.status === 'Late').length,
      leave: records.filter((r) => r.status === 'Leave').length,
    };
  }, [attendance, selectedDate, facultyEmployees, facultyEmployeeIds]);

  // Weekly trend data
  const weeklyTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const records = attendance.filter(
        (a) => a.date === dateStr && facultyEmployeeIds.has(a.employeeId),
      );
      return {
        date: format(date, 'EEE'),
        present: records.filter((r) => r.status === 'Present').length,
        absent: records.filter((r) => r.status === 'Absent').length,
        late: records.filter((r) => r.status === 'Late').length,
      };
    });
    return last7Days;
  }, [attendance, facultyEmployeeIds]);

  const handleExport = () => {
    const exportData = dailyAttendance.map((emp) => ({
      Code: emp.code,
      Name: emp.name,
      Department: emp.department,
      Date: selectedDate,
      Status: emp.attendance?.status || 'No Record',
      CheckIn: emp.attendance?.checkIn || '-',
      CheckOut: emp.attendance?.checkOut || '-',
    }));
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty_attendance_${selectedDate}.csv`;
    a.click();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <Badge variant="success">{status}</Badge>;
      case 'Absent':
        return <Badge variant="danger">{status}</Badge>;
      case 'Late':
        return <Badge variant="warning">{status}</Badge>;
      case 'Leave':
        return <Badge variant="info">{status}</Badge>;
      default:
        return <Badge variant="default">No Record</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faculty Attendance</h2>
          <p className="text-gray-500 mt-1">Track attendance for {user.faculty}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button variant="outline" onClick={handleExport}>
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
          <p className="text-xs text-gray-500">Total Staff</p>
        </div>
        <div className="glass p-4 rounded-xl text-center border-l-4 border-emerald-500">
          <p className="text-2xl font-bold text-emerald-600">{summary.present}</p>
          <p className="text-xs text-gray-500">Present</p>
        </div>
        <div className="glass p-4 rounded-xl text-center border-l-4 border-red-500">
          <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
          <p className="text-xs text-gray-500">Absent</p>
        </div>
        <div className="glass p-4 rounded-xl text-center border-l-4 border-amber-500">
          <p className="text-2xl font-bold text-amber-600">{summary.late}</p>
          <p className="text-xs text-gray-500">Late</p>
        </div>
        <div className="glass p-4 rounded-xl text-center border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-blue-600">{summary.leave}</p>
          <p className="text-xs text-gray-500">On Leave</p>
        </div>
      </div>

      {/* Weekly Trend */}
      <Card title="Weekly Attendance Trend" subtitle="Last 7 days overview">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="present"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Present"
              />
              <Area
                type="monotone"
                dataKey="late"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
                name="Late"
              />
              <Area
                type="monotone"
                dataKey="absent"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Absent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Filters & Table */}
      <Card>
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <InputWithIcon
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              inputClassName="pr-4 py-2 text-sm"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Check In
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Check Out
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Work Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyAttendance.map((emp) => {
                const checkIn = emp.attendance?.checkIn;
                const checkOut = emp.attendance?.checkOut;
                let workHours = '-';
                if (checkIn && checkOut) {
                  const [inH, inM] = checkIn.split(':').map(Number);
                  const [outH, outM] = checkOut.split(':').map(Number);
                  const totalMins = outH * 60 + outM - (inH * 60 + inM);
                  const hours = Math.floor(totalMins / 60);
                  const mins = totalMins % 60;
                  workHours = `${hours}h ${mins}m`;
                }

                return (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.department}</td>
                    <td className="px-4 py-3">{getStatusBadge(emp.attendance?.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{checkIn || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{checkOut || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{workHours}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {dailyAttendance.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No attendance records found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
