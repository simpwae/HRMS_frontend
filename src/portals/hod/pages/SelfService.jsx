import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import {
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function SelfService() {
  const user = useAuthStore((s) => s.user);
  const { employees, leaves, attendance, updateLeaveStatus } = useDataStore();
  const [decisionNotes, setDecisionNotes] = useState('');

  const scopeDept = user?.department;

  const scopedEmployees = useMemo(
    () => employees.filter((e) => !scopeDept || e.department === scopeDept),
    [employees, scopeDept],
  );

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAttendance = useMemo(
    () =>
      attendance.filter(
        (a) => a.date === today && scopedEmployees.some((e) => e.id === a.employeeId),
      ),
    [attendance, scopedEmployees, today],
  );

  const scopedLeaves = useMemo(
    () => leaves.filter((l) => scopedEmployees.some((e) => e.id === l.employeeId)),
    [leaves, scopedEmployees],
  );

  const pendingLeaves = scopedLeaves.filter(
    (l) => l.status === 'Pending' || l.status === 'Forwarded',
  );

  const stats = {
    staff: scopedEmployees.length,
    pendingLeaves: pendingLeaves.length,
    present: todayAttendance.filter((a) => a.status === 'Present').length,
    late: todayAttendance.filter((a) => a.status === 'Late').length,
  };

  const decide = (leaveId, approve) => {
    updateLeaveStatus(
      leaveId,
      approve ? 'Approved' : 'Rejected',
      'hod',
      user?.name || 'HOD',
      decisionNotes || '',
    );
    setDecisionNotes('');
  };

  const badge = (status) => {
    if (status === 'Approved') return 'success';
    if (status === 'Rejected') return 'error';
    if (status === 'Forwarded' || status === 'Pending') return 'warning';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manager Self-Service</h1>
        <p className="text-gray-600">Department view, approvals, and attendance snapshot</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Dept Staff', value: stats.staff, icon: UsersIcon, color: 'indigo' },
          {
            label: 'Pending Leaves',
            value: stats.pendingLeaves,
            icon: CalendarDaysIcon,
            color: 'amber',
          },
          { label: 'Present Today', value: stats.present, icon: CheckCircleIcon, color: 'green' },
          { label: 'Late Today', value: stats.late, icon: ClockIcon, color: 'rose' },
        ].map((s) => (
          <Card key={s.label} className={`border-${s.color}-100 bg-${s.color}-50`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm text-${s.color}-600`}>{s.label}</p>
                <p className={`text-2xl font-bold text-${s.color}-800`}>{s.value}</p>
              </div>
              <s.icon className={`w-8 h-8 text-${s.color}-500`} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-gray-500" />
            <p className="font-semibold text-gray-900">Pending Leave Approvals</p>
          </div>
        </div>
        {pendingLeaves.length === 0 ? (
          <p className="text-sm text-gray-500">No pending leaves for your department.</p>
        ) : (
          <div className="space-y-2 text-sm text-gray-800">
            {pendingLeaves.map((l) => (
              <div key={l.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{l.employeeName}</p>
                    <p className="text-xs text-gray-500">
                      {l.type} · {l.startDate} → {l.endDate} ({l.days}d)
                    </p>
                  </div>
                  <Badge variant={badge(l.status)}>{l.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => decide(l.id, true)}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => decide(l.id, false)}
                    className="text-red-600 border-red-200"
                  >
                    Reject
                  </Button>
                  <input
                    className="flex-1 min-w-[180px] rounded border px-3 py-1 text-xs"
                    placeholder="Notes (optional)"
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
