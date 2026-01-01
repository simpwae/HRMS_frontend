import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import {
  UserCircleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function SelfService() {
  const user = useAuthStore((s) => s.user);
  const { employees, leaves, payrollRuns } = useDataStore();
  const getProfileCompletion = useDataStore((s) => s.getProfileCompletion);

  const employee = useMemo(
    () => employees.find((e) => e.id === user?.id || e.email === user?.email),
    [employees, user],
  );

  const leaveBalance = employee?.leaveBalance || {};

  const completion = useMemo(
    () => (employee ? getProfileCompletion(employee.id) : { percent: 0, missing: [] }),
    [employee, getProfileCompletion],
  );

  const myLeaves = useMemo(
    () =>
      leaves
        .filter((l) => l.employeeId === employee?.id)
        .sort((a, b) => parseISO(b.appliedOn) - parseISO(a.appliedOn)),
    [leaves, employee],
  );

  const recentLeaves = myLeaves.slice(0, 5);

  const myPayslips = useMemo(() => {
    if (!employee) return [];
    return payrollRuns
      .filter((run) => run.items)
      .flatMap((run) =>
        run.items
          .filter((item) => item.employeeId === employee.id)
          .map((item) => ({
            period: run.period,
            status: run.status,
            netPay: item.netPay,
            postedOn: run.postedOn || run.generatedOn,
          })),
      )
      .slice(0, 6);
  }, [payrollRuns, employee]);

  const history = useMemo(() => {
    const lifecycle = (employee?.lifecycle || []).map((e) => ({
      date: e.effectiveDate,
      title: e.title || e.type,
      detail: e.meta?.designation || e.meta?.reason || '',
    }));
    const salary = (employee?.salaryHistory || []).map((s) => ({
      date: s.effectiveDate,
      title: 'Salary change',
      detail: `${s.type || 'adjustment'} to ${s.amount}`,
    }));
    return [...lifecycle, ...salary]
      .filter((h) => h.date)
      .sort((a, b) => parseISO(b.date) - parseISO(a.date))
      .slice(0, 10);
  }, [employee]);

  if (!employee) {
    return <div className="text-sm text-gray-600">Profile not found.</div>;
  }

  const leaveColor = (status) => {
    if (status === 'Approved') return 'success';
    if (status === 'Pending' || status === 'Forwarded') return 'warning';
    if (status === 'Rejected') return 'error';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Self-Service</h1>
        <p className="text-gray-600">View your data, balances, and history (read-only)</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <UserCircleIcon className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Profile</p>
              <p className="font-semibold text-gray-900">{employee.name}</p>
              <p className="text-sm text-gray-600">{employee.designation}</p>
              <p className="text-xs text-gray-500">
                {employee.department} · {employee.faculty}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <CalendarDaysIcon className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-sm text-gray-500">Leave Balance</p>
              <div className="grid grid-cols-2 gap-1 text-sm text-gray-800">
                {Object.entries(leaveBalance).map(([k, v]) => (
                  <span key={k} className="flex items-center justify-between">
                    <span className="capitalize">{k.replace('_', ' ')}</span>
                    <Badge variant={v > 0 ? 'success' : 'warning'}>{v}</Badge>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <BanknotesIcon className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-sm text-gray-500">Payslips</p>
              <p className="text-sm text-gray-800">
                {myPayslips.length > 0
                  ? `${myPayslips[0].period?.month || ''} ${myPayslips[0].period?.year || ''}`
                  : 'None available'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <UserCircleIcon className="w-8 h-8 text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Profile Completion</p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    completion.percent >= 90
                      ? 'success'
                      : completion.percent >= 70
                        ? 'warning'
                        : 'error'
                  }
                >
                  {completion.percent}%
                </Badge>
                {completion.missing && completion.missing.length > 0 && (
                  <span className="text-xs text-gray-500">
                    Missing: {completion.missing.slice(0, 3).join(', ')}
                    {completion.missing.length > 3 ? '…' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500" />
              <p className="font-semibold text-gray-900">Recent Leave Requests</p>
            </div>
          </div>
          {recentLeaves.length === 0 ? (
            <p className="text-sm text-gray-500">No leave requests yet.</p>
          ) : (
            <div className="space-y-2 text-sm text-gray-800">
              {recentLeaves.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded border px-3 py-2"
                >
                  <div>
                    <p className="font-medium capitalize">{l.type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">
                      {l.startDate} → {l.endDate} ({l.days}d)
                    </p>
                  </div>
                  <Badge variant={leaveColor(l.status)}>{l.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-gray-500" />
              <p className="font-semibold text-gray-900">Service History</p>
            </div>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No history available.</p>
          ) : (
            <div className="space-y-2 text-sm text-gray-800">
              {history.map((h, idx) => (
                <div key={`${h.date}-${idx}`} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{h.title}</p>
                    <p className="text-xs text-gray-500">{h.detail}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {h.date && format(parseISO(h.date), 'PPP')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="w-5 h-5 text-gray-500" />
            <p className="font-semibold text-gray-900">Payslips (last 6)</p>
          </div>
        </div>
        {myPayslips.length === 0 ? (
          <p className="text-sm text-gray-500">No payslips available yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-800">
            {myPayslips.map((p, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <p className="font-medium">
                  {p.period?.month} {p.period?.year}
                </p>
                <p className="text-xs text-gray-500">Net Pay: {p.netPay}</p>
                <Badge variant={p.status === 'Posted' ? 'success' : 'info'}>
                  {p.status || 'Draft'}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">{p.postedOn || 'Unposted'}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
