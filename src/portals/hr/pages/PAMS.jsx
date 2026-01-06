import { useMemo, useState } from 'react';
import { CheckBadgeIcon, ArrowDownTrayIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { useDataStore } from '../../../state/data';
import { toCSV, downloadCSV } from '../../../services/export';

const achievementLevels = {
  fully: { label: 'Fully Achieved', marks: 100 },
  largely: { label: 'Largely Achieved', marks: 85 },
  partially: { label: 'Partially Achieved', marks: 70 },
  not: { label: 'Not Achieved', marks: 0 },
};

export default function HRPAMS() {
  const getPamsForHr = useDataStore((s) => s.getPamsForHr);
  const hrApprovePams = useDataStore((s) => s.hrApprovePams);
  const [selected, setSelected] = useState(null);

  const items = useMemo(() => getPamsForHr(), [getPamsForHr]);

  const exportCSV = () => {
    if (!items.length) return;
    const csv = toCSV(
      items.map((p) => ({
        period: p.period,
        employee: p.employeeName || p.employeeId,
        department: p.department,
        faculty: p.faculty,
        category: p.category || 'faculty',
        hodMeeting: p.hodReview?.meetingDate || '',
        deanMeeting: p.deanReview?.meetingDate || '',
      })),
      ['period', 'employee', 'department', 'faculty', 'category', 'hodMeeting', 'deanMeeting'],
    );
    downloadCSV('pams-hr-final.csv', csv);
  };

  const approve = (id) => {
    hrApprovePams(id, { action: 'approve', comment: 'Approved and finalized' });
    setSelected(null);
  };

  const facultyItems = items.filter((p) => p.category === 'faculty');
  const hodItems = items.filter((p) => p.category === 'hod');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckBadgeIcon className="w-6 h-6 text-gray-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PAMS Final Processing</h1>
          <p className="text-gray-600">
            Review VC-approved submissions and finalize records. Faculty & HOD performance
            evaluations.
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
          <p className="text-sm text-gray-600">No submissions awaiting HR finalization.</p>
        </Card>
      ) : (
        <>
          {facultyItems.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Faculty PAMS (VC Approved)</h2>
              <div className="grid gap-3">
                {facultyItems.map((p) => (
                  <Card
                    key={p.id}
                    className={`cursor-pointer transition-all ${
                      selected?.id === p.id ? 'ring-2 ring-green-500' : ''
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
                        <div className="flex gap-3 mt-1 text-xs">
                          {p.hodReview?.meetingDate && (
                            <span className="text-emerald-600">
                              ✓ HOD: {p.hodReview.meetingDate}
                            </span>
                          )}
                          {p.vcReview?.decidedAt && (
                            <span className="text-emerald-600">✓ VC: {p.vcReview.decidedAt}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="success">vc-approved</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {hodItems.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mt-6">HOD PAMS (VC Approved)</h2>
              <div className="grid gap-3">
                {hodItems.map((p) => (
                  <Card
                    key={p.id}
                    className={`cursor-pointer transition-all ${
                      selected?.id === p.id ? 'ring-2 ring-green-500' : ''
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
                        <div className="flex gap-3 mt-1 text-xs">
                          {p.deanReview?.meetingDate && (
                            <span className="text-emerald-600">
                              ✓ Dean: {p.deanReview.meetingDate}
                            </span>
                          )}
                          {p.vcReview?.decidedAt && (
                            <span className="text-emerald-600">✓ VC: {p.vcReview.decidedAt}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="success">vc-approved</Badge>
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
                {selected.employeeName || selected.employeeId}
              </p>
              <p className="text-xs text-gray-500">
                {selected.category === 'hod' ? 'HOD Performance' : 'Faculty Performance'} ·{' '}
                {selected.period}
              </p>
            </div>
            <Badge variant="success">Ready for HR</Badge>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-2">
              <CheckBadgeIcon className="w-4 h-4" /> Approval Chain Complete
            </p>
            <div className="text-xs text-green-800 space-y-1">
              <p>✓ VC Approved: {selected.vcReview?.decidedAt || 'Today'}</p>
              {selected.category === 'faculty' && selected.hodReview?.meetingDate && (
                <p>✓ HOD Meeting: {selected.hodReview.meetingDate}</p>
              )}
              {selected.category === 'hod' && selected.deanReview?.meetingDate && (
                <p>✓ Dean Meeting: {selected.deanReview.meetingDate}</p>
              )}
              {selected.vcReview?.comment && <p>Note: {selected.vcReview.comment}</p>}
            </div>
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
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 mt-6 border-t pt-4">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => approve(selected.id)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <EnvelopeIcon className="w-4 h-4" /> Finalize & File
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
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {meta.label}
        </span>
      ) : (
        <span className="text-xs text-gray-500">—</span>
      )}
    </div>
  );
}
