import { useMemo, useState } from 'react';
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

const achievementLevels = {
  fully: { label: 'Fully Achieved', marks: 100 },
  largely: { label: 'Largely Achieved', marks: 85 },
  partially: { label: 'Partially Achieved', marks: 70 },
  not: { label: 'Not Achieved', marks: 0 },
};

export default function VCPAMS() {
  const getPamsForVc = useDataStore((s) => s.getPamsForVc);
  const vcApprovePams = useDataStore((s) => s.vcApprovePams);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');

  const items = useMemo(() => getPamsForVc(), [getPamsForVc]);

  const exportCSV = () => {
    if (!items.length) return;
    const csv = toCSV(
      items.map((p) => ({
        period: p.period,
        employee: p.employeeName || p.employeeId,
        department: p.department,
        faculty: p.faculty,
        category: p.category || 'faculty',
        status: p.status,
        hodMeeting: p.hodReview?.meetingDate || '',
        deanMeeting: p.deanReview?.meetingDate || '',
      })),
      [
        'period',
        'employee',
        'department',
        'faculty',
        'category',
        'status',
        'hodMeeting',
        'deanMeeting',
      ],
    );
    downloadCSV('pams-vc-approvals.csv', csv);
  };

  const decide = (id, action) => {
    vcApprovePams(id, {
      action,
      comment: action === 'return' ? comment || 'Please revisit' : comment,
    });
    setSelected(null);
    setComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardDocumentListIcon className="w-6 h-6 text-gray-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PAMS Approvals</h1>
          <p className="text-gray-600">
            Review and approve Faculty & HOD submissions before sending to HR.
          </p>
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
        <>
          {items.filter((p) => p.category === 'faculty').length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Faculty PAMS</h2>
              <div className="grid gap-3">
                {items
                  .filter((p) => p.category === 'faculty')
                  .map((p) => (
                    <Card
                      key={p.id}
                      className={`cursor-pointer transition-all ${
                        selected?.id === p.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelected(p)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {p.employeeName || p.employeeId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {p.department} · {p.faculty}
                          </p>
                          <p className="text-xs text-gray-500">Period: {p.period}</p>
                          {p.hodReview?.meetingDate && (
                            <p className="text-xs text-emerald-600">
                              ✓ HOD meeting: {p.hodReview.meetingDate}
                            </p>
                          )}
                        </div>
                        <Badge variant="primary">pending</Badge>
                      </div>
                    </Card>
                  ))}
              </div>
            </>
          )}

          {items.filter((p) => p.category === 'hod').length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mt-6">HOD PAMS</h2>
              <div className="grid gap-3">
                {items
                  .filter((p) => p.category === 'hod')
                  .map((p) => (
                    <Card
                      key={p.id}
                      className={`cursor-pointer transition-all ${
                        selected?.id === p.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelected(p)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {p.employeeName || p.employeeId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {p.department} · {p.faculty}
                          </p>
                          <p className="text-xs text-gray-500">Period: {p.period}</p>
                          {p.deanReview?.meetingDate && (
                            <p className="text-xs text-emerald-600">
                              ✓ Dean meeting: {p.deanReview.meetingDate}
                            </p>
                          )}
                        </div>
                        <Badge variant="primary">pending</Badge>
                      </div>
                    </Card>
                  ))}
              </div>
            </>
          )}
        </>
      )}

      {selected && (
        <Card>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <p className="font-semibold text-gray-900">
                Reviewing: {selected.employeeName || selected.employeeId}
              </p>
              <p className="text-xs text-gray-500">
                {selected.category === 'hod' ? 'HOD Performance' : 'Faculty Performance'} ·{' '}
                {selected.period}
              </p>
            </div>
            <Badge variant="primary">{selected.category}</Badge>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selected.category === 'faculty' ? (
              <>
                {selected.hodReview && selected.hodReview.assessment ? (
                  <>
                    <div className="border-t pt-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">HOD Assessment</p>
                      <div className="space-y-2">
                        <div className="p-3 rounded border bg-blue-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">Teaching</span>
                            <Badge>{selected.hodReview.assessment.teaching}</Badge>
                          </div>
                          {selected.hodReview.assessmentComments?.teaching && (
                            <p className="text-xs text-gray-600 mt-1">
                              {selected.hodReview.assessmentComments.teaching}
                            </p>
                          )}
                        </div>
                        <div className="p-3 rounded border bg-green-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">Research</span>
                            <Badge variant="success">
                              {selected.hodReview.assessment.research}
                            </Badge>
                          </div>
                          {selected.hodReview.assessmentComments?.research && (
                            <p className="text-xs text-gray-600 mt-1">
                              {selected.hodReview.assessmentComments.research}
                            </p>
                          )}
                        </div>
                        <div className="p-3 rounded border bg-purple-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">
                              FYP Supervision
                            </span>
                            <Badge variant="secondary">
                              {selected.hodReview.assessment.fypSupervision}
                            </Badge>
                          </div>
                          {selected.hodReview.assessmentComments?.fypSupervision && (
                            <p className="text-xs text-gray-600 mt-1">
                              {selected.hodReview.assessmentComments.fypSupervision}
                            </p>
                          )}
                        </div>
                        <div className="p-3 rounded border bg-orange-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">Service</span>
                            <Badge variant="info">{selected.hodReview.assessment.service}</Badge>
                          </div>
                          {selected.hodReview.assessmentComments?.service && (
                            <p className="text-xs text-gray-600 mt-1">
                              {selected.hodReview.assessmentComments.service}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3 bg-blue-50 p-3 rounded">
                      <p className="text-sm font-semibold text-gray-900">HOD Meeting Details</p>
                      <p className="text-xs text-gray-600 mt-1">
                        📅 Meeting: {selected.hodReview.meetingDate || 'Not scheduled'}
                      </p>
                      {selected.hodReview.comment && (
                        <p className="text-xs text-gray-700 mt-2">
                          💬 {selected.hodReview.comment}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="border-t pt-3 bg-yellow-50 p-3 rounded">
                    <p className="text-sm text-yellow-800">⏳ Awaiting HOD Assessment</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {selected.deanReview && selected.deanReview.assessment ? (
                  <>
                    <div className="border-t pt-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Dean Assessment</p>
                      <div className="space-y-2">
                        <div className="p-3 rounded border bg-blue-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">Teaching</span>
                            <Badge>{selected.deanReview.assessment.teaching}</Badge>
                          </div>
                          {selected.deanReview.assessmentComments?.teaching && (
                            <p className="text-xs text-gray-600 mt-1">
                              {selected.deanReview.assessmentComments.teaching}
                            </p>
                          )}
                        </div>
                        <div className="p-3 rounded border bg-green-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">Research</span>
                            <Badge variant="success">
                              {selected.deanReview.assessment.research}
                            </Badge>
                          </div>
                          {selected.deanReview.assessmentComments?.research && (
                            <p className="text-xs text-gray-600 mt-1">
                              {selected.deanReview.assessmentComments.research}
                            </p>
                          )}
                        </div>
                        <div className="p-3 rounded border bg-purple-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">
                              FYP Supervision
                            </span>
                            <Badge variant="secondary">
                              {selected.deanReview.assessment.fypSupervision}
                            </Badge>
                          </div>
                          {selected.deanReview.assessmentComments?.fypSupervision && (
                            <p className="text-xs text-gray-600 mt-1">
                              {selected.deanReview.assessmentComments.fypSupervision}
                            </p>
                          )}
                        </div>
                        <div className="p-3 rounded border bg-orange-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">Service</span>
                            <Badge variant="info">{selected.deanReview.assessment.service}</Badge>
                          </div>
                          {selected.deanReview.assessmentComments?.service && (
                            <p className="text-xs text-gray-600 mt-1">
                              {selected.deanReview.assessmentComments.service}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3 bg-green-50 p-3 rounded">
                      <p className="text-sm font-semibold text-gray-900">Dean Meeting Details</p>
                      <p className="text-xs text-gray-600 mt-1">
                        📅 Meeting: {selected.deanReview.meetingDate || 'Not scheduled'}
                      </p>
                      {selected.deanReview.comment && (
                        <p className="text-xs text-gray-700 mt-2">
                          💬 {selected.deanReview.comment}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="border-t pt-3 bg-yellow-50 p-3 rounded">
                    <p className="text-sm text-yellow-800">⏳ Awaiting Dean Assessment</p>
                  </div>
                )}
              </>
            )}

            {selected.category === 'hod' &&
            selected.deanReview &&
            selected.deanReview.assessment ? (
              <div className="border-t pt-3">
                <p className="text-sm font-semibold text-gray-900 mb-2">Dean Assessment (HOD)</p>
                <div className="space-y-2">
                  <div className="p-3 rounded border bg-blue-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">Teaching</span>
                      <Badge>{selected.deanReview.assessment.teaching}</Badge>
                    </div>
                  </div>
                  <div className="p-3 rounded border bg-green-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">Research</span>
                      <Badge variant="success">{selected.deanReview.assessment.research}</Badge>
                    </div>
                  </div>
                  <div className="p-3 rounded border bg-purple-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">FYP Supervision</span>
                      <Badge variant="secondary">
                        {selected.deanReview.assessment.fypSupervision}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 rounded border bg-orange-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">Service</span>
                      <Badge variant="info">{selected.deanReview.assessment.service}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              selected.category === 'hod' && (
                <div className="border-t pt-3 bg-yellow-50 p-3 rounded">
                  <p className="text-sm text-yellow-800">⏳ Awaiting Dean Assessment</p>
                </div>
              )
            )}

            {selected.deanReview && selected.category === 'hod' && (
              <div className="border-t pt-3 bg-green-50 p-3 rounded">
                <p className="text-sm font-semibold text-gray-900">Dean Meeting Details (HOD)</p>
                <p className="text-xs text-gray-600 mt-1">
                  📅 Meeting: {selected.deanReview.meetingDate || 'Not scheduled'}
                </p>
                {selected.deanReview.comment && (
                  <p className="text-xs text-gray-700 mt-2">💬 {selected.deanReview.comment}</p>
                )}
              </div>
            )}
          </div>

          <div className="border-t mt-4 pt-4">
            <label className="text-sm font-medium text-gray-700 block mb-3">
              Final Comments
              <textarea
                rows={2}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional approval comments"
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => decide(selected.id, 'approve')}
              className="flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" /> Send to HR
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function AchievementDisplay({ label, value }) {
  const meta = value ? achievementLevels[value] : null;
  return (
    <div className="flex items-center justify-between gap-2 text-sm py-1">
      <span className="text-gray-700">{label}</span>
      {meta ? (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {meta.label}
        </span>
      ) : (
        <span className="text-xs text-gray-500">—</span>
      )}
    </div>
  );
}
