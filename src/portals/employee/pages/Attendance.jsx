import { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, subMonths } from 'date-fns';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import FileUpload from '../../../components/FileUpload';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import 'react-day-picker/dist/style.css';

export default function Attendance() {
  const user = useAuthStore((s) => s.user);
  const { employees, attendance, attendanceCorrections, submitAttendanceCorrection } =
    useDataStore();

  const employee = useMemo(
    () => employees.find((e) => e.id === user?.id || e.email === user?.email),
    [employees, user],
  );
  const employeeId = employee?.id || user?.id;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(new Date());
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    date: '',
    currentStatus: '',
    requestedStatus: '',
    reason: '',
    documents: [],
  });

  // Get all attendance records for this employee
  const myAttendance = useMemo(
    () => attendance.filter((a) => a.employeeId === employeeId),
    [attendance, employeeId],
  );

  // Get attendance for selected date
  const dayAttendance = useMemo(
    () => myAttendance.find((a) => a.date === format(selectedDate, 'yyyy-MM-dd')),
    [myAttendance, selectedDate],
  );

  // Current month stats
  const currentMonthStats = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);

    const monthRecords = myAttendance.filter((a) => {
      const date = parseISO(a.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    return {
      present: monthRecords.filter((a) => a.status === 'Present').length,
      late: monthRecords.filter((a) => a.status === 'Late').length,
      absent: monthRecords.filter((a) => a.status === 'Absent').length,
      total: monthRecords.length,
      avgHours:
        monthRecords.reduce((sum, a) => sum + (a.workHours || 0), 0) / (monthRecords.length || 1),
    };
  }, [myAttendance, viewMonth]);

  // Marked days for calendar
  const markedDays = useMemo(
    () => ({
      present: myAttendance.filter((a) => a.status === 'Present').map((a) => parseISO(a.date)),
      late: myAttendance.filter((a) => a.status === 'Late').map((a) => parseISO(a.date)),
      absent: myAttendance.filter((a) => a.status === 'Absent').map((a) => parseISO(a.date)),
    }),
    [myAttendance],
  );

  const getBadgeVariant = (status) => {
    if (status === 'Present') return 'success';
    if (status === 'Late') return 'warning';
    if (status === 'Absent') return 'error';
    return 'default';
  };

  // Monthly breakdown
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const month = subMonths(new Date(), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const records = myAttendance.filter((a) => {
        const date = parseISO(a.date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });

      months.push({
        month: format(month, 'MMM yyyy'),
        present: records.filter((a) => a.status === 'Present').length,
        late: records.filter((a) => a.status === 'Late').length,
        absent: records.filter((a) => a.status === 'Absent').length,
        total: records.length,
      });
    }
    return months;
  }, [myAttendance]);

  // My correction requests
  const myCorrections = useMemo(
    () => attendanceCorrections.filter((c) => c.employeeId === employeeId),
    [attendanceCorrections, employeeId],
  );

  const handleOpenCorrectionModal = (date, status) => {
    setCorrectionForm({
      date: date ? format(date, 'yyyy-MM-dd') : '',
      currentStatus: status || '',
      requestedStatus: '',
      reason: '',
      documents: [],
    });
    setCorrectionModalOpen(true);
  };

  const handleSubmitCorrection = () => {
    if (!correctionForm.date || !correctionForm.requestedStatus || !correctionForm.reason) {
      alert('Please fill all required fields');
      return;
    }

    const attendanceRecord = myAttendance.find((a) => a.date === correctionForm.date);

    submitAttendanceCorrection(employeeId, {
      originalAttendance: {
        date: correctionForm.date,
        status: correctionForm.currentStatus || 'Absent',
        clockIn: attendanceRecord?.clockIn || null,
        clockOut: attendanceRecord?.clockOut || null,
      },
      requestedChange: {
        status: correctionForm.requestedStatus,
        reason: correctionForm.reason,
      },
      documents: correctionForm.documents,
    });

    setCorrectionModalOpen(false);
    setCorrectionForm({
      date: '',
      currentStatus: '',
      requestedStatus: '',
      reason: '',
      documents: [],
    });
  };

  const getCorrectionStatusColor = (status) => {
    if (status === 'Approved') return 'success';
    if (status === 'Rejected') return 'error';
    return 'warning';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-600">Track your clock-in, clock-out times and attendance history</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Present Days"
          value={currentMonthStats.present}
          subtitle={format(viewMonth, 'MMMM yyyy')}
          icon={CheckCircleIcon}
          color="success"
        />
        <StatCard
          title="Late Arrivals"
          value={currentMonthStats.late}
          subtitle="This month"
          icon={ExclamationTriangleIcon}
          color="warning"
        />
        <StatCard
          title="Absent Days"
          value={currentMonthStats.absent}
          subtitle="This month"
          icon={XCircleIcon}
          color="error"
        />
        <StatCard
          title="Avg. Work Hours"
          value={currentMonthStats.avgHours.toFixed(1)}
          subtitle="Hours per day"
          icon={ClockIcon}
          color="primary"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="corrections">
            Corrections {myCorrections.length > 0 && `(${myCorrections.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={viewMonth}
                  onMonthChange={setViewMonth}
                  modifiers={{
                    present: markedDays.present,
                    late: markedDays.late,
                    absent: markedDays.absent,
                  }}
                  modifiersClassNames={{
                    present: 'bg-green-100 text-green-800 font-semibold',
                    late: 'bg-yellow-100 text-yellow-800 font-semibold',
                    absent: 'bg-red-100 text-red-800 font-semibold',
                  }}
                  className="border rounded-xl p-4 mx-auto"
                />
                <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-600">Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-gray-600">Late</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-600">Absent</span>
                  </div>
                </div>
              </div>

              {/* Selected Day Details */}
              <div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </h3>
                  </div>

                  {dayAttendance ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant={getBadgeVariant(dayAttendance.status)} size="lg">
                          {dayAttendance.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center border">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Clock In</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {dayAttendance.clockIn || '--:--'}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Clock Out</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {dayAttendance.clockOut || '--:--'}
                          </p>
                        </div>
                      </div>

                      {dayAttendance.workHours > 0 && (
                        <div className="bg-white rounded-lg p-4 border">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Total Work Hours
                          </p>
                          <p className="text-xl font-bold text-gray-900 mt-1">
                            {dayAttendance.workHours.toFixed(1)} hours
                          </p>
                        </div>
                      )}

                      {dayAttendance.status === 'Late' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-yellow-800">Late Arrival</p>
                              <p className="text-sm text-yellow-700">
                                Office hours start at 09:00. A deduction may apply.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No attendance record for this date</p>
                      <p className="text-sm text-gray-400 mt-1">Weekend or holiday</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Day</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Clock In
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Clock Out
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Work Hours
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.slice(0, 30).map((record) => (
                    <tr key={record.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {format(parseISO(record.date), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {format(parseISO(record.date), 'EEEE')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{record.clockIn || '--'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{record.clockOut || '--'}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {record.workHours ? `${record.workHours.toFixed(1)}h` : '--'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getBadgeVariant(record.status)}>{record.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Month
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Present
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Late
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Absent
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Total Days
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Attendance %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month) => {
                    const percentage =
                      month.total > 0
                        ? Math.round(((month.present + month.late) / month.total) * 100)
                        : 0;
                    return (
                      <tr key={month.month} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {month.month}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
                            {month.present}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-sm">
                            {month.late}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-800 font-semibold text-sm">
                            {month.absent}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-900">
                          {month.total}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percentage >= 90
                                    ? 'bg-green-500'
                                    : percentage >= 75
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="corrections">
          <div className="space-y-6">
            {/* Request New Correction Button */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Attendance Correction Requests
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Submit a request to correct your attendance records
                  </p>
                </div>
                <Button
                  onClick={() => handleOpenCorrectionModal(null, null)}
                  icon={PlusIcon}
                  variant="primary"
                >
                  Request Correction
                </Button>
              </div>
            </Card>

            {/* Correction Requests List */}
            {myCorrections.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Correction Requests</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't submitted any attendance correction requests yet.
                  </p>
                  <Button
                    onClick={() => handleOpenCorrectionModal(null, null)}
                    icon={PlusIcon}
                    variant="primary"
                  >
                    Submit Your First Request
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {myCorrections
                  .sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn))
                  .map((correction) => (
                    <Card key={correction.id} className="hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                            <span className="font-semibold text-gray-900">
                              {format(parseISO(correction.originalAttendance.date), 'MMMM d, yyyy')}
                            </span>
                            <Badge variant={getCorrectionStatusColor(correction.status)} size="sm">
                              {correction.status}
                            </Badge>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500">Original Status:</span>
                              <Badge
                                variant={getBadgeVariant(correction.originalAttendance.status)}
                              >
                                {correction.originalAttendance.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500">Requested Status:</span>
                              <Badge variant={getBadgeVariant(correction.requestedChange.status)}>
                                {correction.requestedChange.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="mt-3 bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Reason
                            </p>
                            <p className="text-sm text-gray-700">
                              {correction.requestedChange.reason}
                            </p>
                          </div>

                          {correction.documents && correction.documents.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                Supporting Documents
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {correction.documents.map((doc, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                                  >
                                    <DocumentTextIcon className="w-3 h-3" />
                                    {doc.name || `Document ${idx + 1}`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {correction.notes && (
                            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-xs text-yellow-800 uppercase tracking-wide mb-1">
                                HR Notes
                              </p>
                              <p className="text-sm text-yellow-700">{correction.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="text-right text-xs text-gray-500">
                          <p>Submitted</p>
                          <p className="font-medium text-gray-700">
                            {format(parseISO(correction.submittedOn), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Correction Request Modal */}
      <Modal
        isOpen={correctionModalOpen}
        onClose={() => setCorrectionModalOpen(false)}
        title="Request Attendance Correction"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={correctionForm.date}
              onChange={(e) => setCorrectionForm({ ...correctionForm, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          {correctionForm.date && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg">
                  {correctionForm.currentStatus ? (
                    <Badge variant={getBadgeVariant(correctionForm.currentStatus)}>
                      {correctionForm.currentStatus}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-500">
                      No record found (Absent or Weekend)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={correctionForm.requestedStatus}
                  onChange={(e) =>
                    setCorrectionForm({ ...correctionForm, requestedStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Correction <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={correctionForm.reason}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                  rows={4}
                  placeholder="Explain why this correction is needed (e.g., forgot to clock in, system error, etc.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supporting Documents (Optional)
                </label>
                <FileUpload
                  onUpload={(files) =>
                    setCorrectionForm({
                      ...correctionForm,
                      documents: files.map((f) => ({ name: f.name, file: f })),
                    })
                  }
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload any supporting documents (e.g., screenshots, emails)
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setCorrectionModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmitCorrection} className="flex-1">
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
