import { useMemo } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import Card from '../../../components/Card';
import DataTable from '../../../components/DataTable';
import Badge from '../../../components/Badge';
import { useDataStore } from '../../../state/data';
import {
  ClockIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

export default function Operational() {
  const getOvertimeStats = useDataStore((s) => s.getOvertimeStats);
  const getPendingApprovalsSummary = useDataStore((s) => s.getPendingApprovalsSummary);
  const getExpiringContracts = useDataStore((s) => s.getExpiringContracts);
  const employees = useDataStore((s) => s.employees);
  const payrollSettings = useDataStore((s) => s.payrollSettings);

  const overtime = useMemo(() => getOvertimeStats(), [getOvertimeStats]);
  const approvals = useMemo(() => getPendingApprovalsSummary(), [getPendingApprovalsSummary]);
  const expiries = useMemo(
    () => getExpiringContracts(payrollSettings?.operationalConfig?.expiryHorizonDays || 30),
    [getExpiringContracts, payrollSettings],
  );

  // Overtime anomaly detection (>20hrs/week = 80hrs/month threshold)
  const overtimeThreshold = payrollSettings?.operationalConfig?.overtimeWarningHours || 40;
  const overtimeAnomalies = useMemo(() => {
    return overtime.rows.filter((emp) => emp.hours > overtimeThreshold);
  }, [overtime.rows, overtimeThreshold]);

  // Probation completion tracking
  const probationTracking = useMemo(() => {
    return employees
      .filter((e) => e.employmentStatus === 'probation' && e.probationEndDate)
      .map((e) => {
        const daysRemaining = differenceInDays(parseISO(e.probationEndDate), new Date());
        return {
          id: e.id,
          name: e.name,
          department: e.department,
          probationEndDate: e.probationEndDate,
          daysRemaining,
          status: daysRemaining <= 7 ? 'urgent' : daysRemaining <= 30 ? 'upcoming' : 'normal',
        };
      })
      .filter((e) => e.daysRemaining <= 60) // Only show those within 60 days
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [employees]);

  const overtimeColumns = [
    { header: 'Employee', accessorKey: 'name' },
    { header: 'Department', accessorKey: 'department' },
    {
      header: 'Overtime (hrs)',
      accessorKey: 'hours',
      cell: ({ getValue }) => <span className="font-semibold">{getValue()}</span>,
    },
  ];

  const expiryColumns = [
    { header: 'Employee', accessorKey: 'name' },
    { header: 'Department', accessorKey: 'department' },
    { header: 'Type', accessorKey: 'type' },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: ({ getValue }) => (
        <Badge variant="warning">{format(parseISO(getValue()), 'MMM d, yyyy')}</Badge>
      ),
    },
  ];

  const probationColumns = [
    { header: 'Employee', accessorKey: 'name' },
    { header: 'Department', accessorKey: 'department' },
    {
      header: 'Completion Date',
      accessorKey: 'probationEndDate',
      cell: ({ getValue }) => format(parseISO(getValue()), 'MMM d, yyyy'),
    },
    {
      header: 'Days Remaining',
      accessorKey: 'daysRemaining',
      cell: ({ getValue, row }) => {
        const days = getValue();
        const status = row.original.status;
        return (
          <Badge
            variant={status === 'urgent' ? 'error' : status === 'upcoming' ? 'warning' : 'info'}
          >
            {days} days
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operational Dashboard</h1>
          <p className="text-gray-600">Overtime, approvals, and expiring contracts</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Overtime (This Month)" subtitle="Employees with overtime hours">
          <div className="flex items-center gap-2 mb-3 text-gray-600">
            <ClockIcon className="w-5 h-5" />
            <span>Total: {overtime.totalHours} hrs</span>
          </div>
          {overtimeAnomalies.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-800">
                  {overtimeAnomalies.length} Overtime Anomal
                  {overtimeAnomalies.length === 1 ? 'y' : 'ies'} Detected
                </p>
                <p className="text-yellow-700">
                  Employees exceeding {overtimeThreshold} hours/month threshold
                </p>
              </div>
            </div>
          )}
          <DataTable
            data={overtime.rows}
            columns={overtimeColumns}
            searchPlaceholder="Search employees"
          />
        </Card>

        <Card title="Pending Approvals" subtitle="Requests awaiting action">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <span className="text-gray-700">Leaves</span>
              <Badge variant="warning">{approvals.leaves}</Badge>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <span className="text-gray-700">Attendance Corrections</span>
              <Badge variant="warning">{approvals.attendanceCorrections}</Badge>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <span className="text-gray-700">Promotions</span>
              <Badge variant="warning">{approvals.promotions}</Badge>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <span className="text-gray-700">Profile Updates</span>
              <Badge variant="warning">{approvals.profileUpdates}</Badge>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <span className="text-gray-700">Selection Board</span>
              <Badge variant="warning">{approvals.selectionBoard}</Badge>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Probation Completion Tracking"
        subtitle="Employees completing probation in next 60 days"
      >
        <div className="flex items-center gap-2 mb-3 text-gray-600">
          <CheckBadgeIcon className="w-5 h-5" />
          <span>Total: {probationTracking.length}</span>
        </div>
        {probationTracking.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckBadgeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No probation completions in next 60 days</p>
          </div>
        ) : (
          <>
            {probationTracking.filter((e) => e.status === 'urgent').length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-red-800">
                    {probationTracking.filter((e) => e.status === 'urgent').length} Urgent Probation
                    Completion(s)
                  </p>
                  <p className="text-red-700">
                    Within 7 days - Schedule evaluation and confirmation meeting
                  </p>
                </div>
              </div>
            )}
            <DataTable
              data={probationTracking}
              columns={probationColumns}
              searchPlaceholder="Search employees"
            />
          </>
        )}
      </Card>

      <Card
        title="Upcoming Probation/Contract Expiries"
        subtitle={`Next ${payrollSettings?.operationalConfig?.expiryHorizonDays || 30} days`}
      >
        <div className="flex items-center gap-2 mb-3 text-gray-600">
          <CalendarDaysIcon className="w-5 h-5" />
          <span>Total: {expiries.length}</span>
        </div>
        <DataTable data={expiries} columns={expiryColumns} searchPlaceholder="Search employees" />
      </Card>
    </div>
  );
}
