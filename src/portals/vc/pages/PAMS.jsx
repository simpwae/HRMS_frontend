import { useMemo } from 'react';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { useDataStore } from '../../../state/data';
import { toCSV, downloadCSV } from '../../../services/export';

const statusVariant = {
  'hod-confirmed': 'primary',
  returned: 'warning',
  'vc-approved': 'success',
};

export default function VCPAMS() {
  const getPamsForVc = useDataStore((s) => s.getPamsForVc);
  const vcApprovePams = useDataStore((s) => s.vcApprovePams);

  const items = useMemo(() => getPamsForVc(), [getPamsForVc]);

  const exportCSV = () => {
    if (!items.length) return;
    const csv = toCSV(
      items.map((p) => ({
        period: p.period,
        employee: p.employeeName || p.employeeId,
        department: p.department,
        faculty: p.faculty,
        status: p.status,
        hodMeeting: p.hodReview?.meetingDate || '',
      })),
      ['period', 'employee', 'department', 'faculty', 'status', 'hodMeeting'],
    );
    downloadCSV('pams-approved.csv', csv);
  };

  const decide = (id, action) => {
    vcApprovePams(id, { action, comment: action === 'return' ? 'Please revisit with HOD' : '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardDocumentListIcon className="w-6 h-6 text-gray-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PAMS Approvals</h1>
          <p className="text-gray-600">Review HOD-confirmed submissions and approve.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={exportCSV} className="flex items-center gap-2">
          <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-600">No submissions awaiting VC approval.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((p) => (
            <Card key={p.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{p.employeeName || p.employeeId}</p>
                  <p className="text-xs text-gray-500">
                    {p.department} · {p.faculty}
                  </p>
                  <p className="text-xs text-gray-500">Period: {p.period}</p>
                  {p.hodReview?.meetingDate && (
                    <p className="text-xs text-gray-500">HOD meeting: {p.hodReview.meetingDate}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[p.status] || 'info'}>{p.status}</Badge>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3 mt-3 text-sm text-gray-800">
                <Info title="Teaching" value={p.rubric?.teaching} />
                <Info title="Research" value={p.rubric?.research} />
                <Info title="Service" value={p.rubric?.service} />
              </div>

              <div className="flex flex-wrap justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => decide(p.id, 'return')}
                  className="flex items-center gap-2"
                >
                  <ArrowUturnLeftIcon className="w-4 h-4" /> Return
                </Button>
                <Button onClick={() => decide(p.id, 'approve')} className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" /> Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ title, value }) {
  return (
    <div className="border rounded-lg p-3 bg-white">
      <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
      <p className="text-sm text-gray-800 mt-1 whitespace-pre-line min-h-12">{value || '—'}</p>
    </div>
  );
}
