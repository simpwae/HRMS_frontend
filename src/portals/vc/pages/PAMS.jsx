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
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Teaching Assessment</p>
                  <AchievementDisplay
                    label="Student Evaluation"
                    value={selected.teachingAssessment?.studentEvaluation}
                  />
                  <AchievementDisplay
                    label="Teaching Workload"
                    value={selected.teachingAssessment?.teachingWorkload}
                  />
                  <AchievementDisplay
                    label="Course Completion"
                    value={selected.teachingAssessment?.courseCompletion}
                  />
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Research & Supervision</p>
                  <AchievementDisplay label="FYP Supervision" value={selected.fypSupervision} />
                  <AchievementDisplay
                    label="MS/PhD Supervision"
                    value={selected.msPhDSupervision}
                  />
                  <AchievementDisplay
                    label="Research Publications"
                    value={selected.researchPublications}
                  />
                  <AchievementDisplay label="Research Funding" value={selected.researchFunding} />
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Service & Administration
                  </p>
                  <AchievementDisplay
                    label="Administrative Duties"
                    value={selected.administrativeDuties}
                  />
                  <AchievementDisplay
                    label="Service to Community"
                    value={selected.serviceToCommunity}
                  />
                </div>

                {selected.hodReview && (
                  <div className="border-t pt-3 bg-blue-50 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-900">HOD Review</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Meeting: {selected.hodReview.meetingDate || 'Not scheduled'}
                    </p>
                    {selected.hodReview.comment && (
                      <p className="text-xs text-gray-700 mt-1">
                        Note: {selected.hodReview.comment}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Leadership</p>
                  <AchievementDisplay label="Leadership" value={selected.leadership} />
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Curriculum & Instruction
                  </p>
                  <AchievementDisplay
                    label="Curriculum Instruction"
                    value={selected.curriculumInstruction}
                  />
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Management</p>
                  <AchievementDisplay
                    label="Management & Admin"
                    value={selected.managementAdministration}
                  />
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Personnel</p>
                  <AchievementDisplay label="Personnel" value={selected.personnel} />
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Promotion & Tenure</p>
                  <AchievementDisplay label="Promotion & Tenure" value={selected.promotionTenure} />
                </div>

                {selected.deanReview && (
                  <div className="border-t pt-3 bg-blue-50 p-3 rounded">
                    <p className="text-sm font-semibold text-gray-900">Dean Review</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Meeting: {selected.deanReview.meetingDate || 'Not scheduled'}
                    </p>
                    {selected.deanReview.comment && (
                      <p className="text-xs text-gray-700 mt-1">
                        Note: {selected.deanReview.comment}
                      </p>
                    )}
                  </div>
                )}
              </>
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
