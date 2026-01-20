import { useMemo, useState } from 'react';
import {
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { useAuthStore } from '../../../state/auth';
import { useDataStore } from '../../../state/data';
import AppraisalForm from './AppraisalForm';

const statusVariant = {
  submitted: 'info',
  returned: 'warning',
  'hod-confirmed': 'primary',
  'vc-approved': 'success',
};

const achievementLevels = {
  fully: { label: 'Fully Achieved', marks: 100 },
  largely: { label: 'Largely Achieved', marks: 85 },
  partially: { label: 'Partially Achieved', marks: 70 },
  not: { label: 'Not Achieved', marks: 0 },
};

export default function HODPAMS() {
  const { user } = useAuthStore();
  const getPamsForHod = useDataStore((s) => s.getPamsForHod);
  const hodReviewPams = useDataStore((s) => s.hodReviewPams);
  const updatePamsSubmission = useDataStore((s) => s.updatePamsSubmission);
  const getEmployeesByDepartment = useDataStore((s) => s.getEmployeesByDepartment);
  const [selected, setSelected] = useState(null);
  const [showAppraisalForm, setShowAppraisalForm] = useState(false);
  const [comment, setComment] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [editing, setEditing] = useState(false);
  const [editWorkload, setEditWorkload] = useState({ teachingLoad: '', admin: '' });
  const [editRubric, setEditRubric] = useState({ teaching: '', research: '', service: '' });

  // Sync editable fields when selection changes
  React.useEffect(() => {
    if (selected) {
      setEditWorkload({
        teachingLoad: selected.workload?.teachingLoad || '',
        admin: selected.workload?.admin || '',
      });
      setEditRubric({
        teaching: selected.rubric?.teaching || '',
        research: selected.rubric?.research || '',
        service: selected.rubric?.service || '',
      });
    } else {
      setEditing(false);
      setEditWorkload({ teachingLoad: '', admin: '' });
      setEditRubric({ teaching: '', research: '', service: '' });
    }
  }, [selected]);

  const submissions = useMemo(
    () => (user?.department ? getPamsForHod(user.department) : []),
    [getPamsForHod, user],
  );

  // Get all employees in the department for manual selection
  const departmentEmployees = useMemo(
    () => (user?.department ? getEmployeesByDepartment(user.department) : []),
    [getEmployeesByDepartment, user],
  );

  const handleDecision = (action) => {
    if (!selected) return;
    hodReviewPams(selected.id, {
      action,
      comment,
      meetingDate,
      followUpDate,
      by: 'hod',
    });
    setComment('');
    setMeetingDate('');
    setSelected(null);
    setFollowUpDate('');
  };

  const handleSelectEmployee = (employeeId) => {
    const employee = departmentEmployees.find((e) => e.id === employeeId);
    if (employee) {
      // Try to find existing PAMS submission for this employee
      const existingPams = submissions.find((p) => p.employeeId === employeeId);

      if (existingPams) {
        // Use the existing PAMS submission
        setSelected(existingPams);
      } else {
        // If no PAMS exists, create a temporary one
        setSelected({
          id: employee.id,
          employeeId: employee.id,
          employeeName: employee.name,
          period: new Date().getFullYear().toString(),
          workload: {
            teachingLoad: `${employee.name}'s teaching workload`,
            projectSupervision: '',
            advisory: '',
            admin: '',
          },
          teachingAssessment: {},
          fypSupervision: undefined,
          msPhDSupervision: undefined,
          researchPublications: undefined,
          researchFunding: undefined,
          administrativeDuties: undefined,
          serviceToCommunity: undefined,
          grievance: '',
          attachments: [],
          status: 'pending',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardDocumentCheckIcon className="w-6 h-6 text-gray-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PAMS Reviews</h1>
          <p className="text-gray-600">
            Confirm after meeting. If errors, use Edit to correct with employee.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <UserGroupIcon className="w-5 h-5 text-gray-500" />
          <p className="font-semibold text-gray-900">Select Employee to Appraise</p>
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Department Employees
            <select
              value={selectedEmployee}
              onChange={(e) => handleSelectEmployee(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select an employee to appraise --</option>
              {departmentEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2 mb-4 pt-3 border-t">
          <UserGroupIcon className="w-5 h-5 text-gray-500" />
          <p className="font-semibold text-gray-900">Pending Submissions</p>
        </div>
        {submissions.length === 0 ? (
          <p className="text-sm text-gray-600">No submitted forms for your department.</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left border rounded-lg p-3 hover:border-[hsl(var(--color-primary))] ${selected?.id === p.id ? 'border-[hsl(var(--color-primary))] shadow-sm' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{p.employeeName || p.employeeId}</p>
                    <p className="text-xs text-gray-500">{p.period}</p>
                    {p.followUpMeeting?.scheduledAt && (
                      <p className="text-[11px] text-gray-500">
                        Follow-up: {p.followUpMeeting.scheduledAt} (
                        {p.followUpMeeting.status || 'pending'})
                      </p>
                    )}
                  </div>
                  <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                </div>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                  {p.workload?.teachingLoad}
                </p>
              </button>
            ))}
          </div>
        )}
      </Card>

      {selected && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-semibold text-gray-900">
                Reviewing: {selected.employeeName || selected.employeeId}
              </p>
              <p className="text-xs text-gray-500">Period {selected.period}</p>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>Teaching Assessment</SectionTitle>
            <AchievementRow
              label="Student Evaluation (SETE)"
              value={selected.teachingAssessment?.studentEvaluation}
            />
            <AchievementRow
              label="Teaching Workload"
              value={selected.teachingAssessment?.teachingWorkload}
            />
            <AchievementRow
              label="Course Completion"
              value={selected.teachingAssessment?.courseCompletion}
            />

            <SectionTitle>Research & Supervision</SectionTitle>
            <AchievementRow label="FYP Supervision / Academic" value={selected.fypSupervision} />
            <AchievementRow label="MS/PhD Thesis Supervision" value={selected.msPhDSupervision} />
            <AchievementRow label="Research Publications" value={selected.researchPublications} />
            <AchievementRow label="Research Funding" value={selected.researchFunding} />

            <SectionTitle>Service & Administration</SectionTitle>
            <AchievementRow label="Administrative Duties" value={selected.administrativeDuties} />
            <AchievementRow label="Service to Community" value={selected.serviceToCommunity} />

            {selected.grievance && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">Grievance / Suggestion</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                  {selected.grievance}
                </p>
              </div>
            )}

            {selected.attachments?.length ? (
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800 mb-1">Attachments</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  {selected.attachments.map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900">{f.name || f.id}</span>
                      <span className="text-xs text-gray-500">
                        {(f.size ? Math.round(f.size / 1024) : 0) || 0} KB
                        {f.type ? ` · ${f.type}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-gray-500 mt-1">
                  Files are stored in submission; download/view is not available in this mock UI.
                </p>
              </div>
            ) : null}

            {editing ? (
              <div className="mt-4 border rounded-lg p-3 bg-gray-50 space-y-3">
                <p className="text-sm font-semibold text-gray-800">Edit Submission</p>
                <label className="text-sm font-medium text-gray-700 block">
                  Teaching Load
                  <textarea
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={editWorkload.teachingLoad}
                    onChange={(e) =>
                      setEditWorkload({ ...editWorkload, teachingLoad: e.target.value })
                    }
                  />
                </label>
                <label className="text-sm font-medium text-gray-700 block">
                  Administrative Duties
                  <textarea
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={editWorkload.admin}
                    onChange={(e) => setEditWorkload({ ...editWorkload, admin: e.target.value })}
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="text-sm font-medium text-gray-700 block">
                    Teaching
                    <textarea
                      rows={2}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={editRubric.teaching}
                      onChange={(e) => setEditRubric({ ...editRubric, teaching: e.target.value })}
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700 block">
                    Research
                    <textarea
                      rows={2}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={editRubric.research}
                      onChange={(e) => setEditRubric({ ...editRubric, research: e.target.value })}
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700 block">
                    Service
                    <textarea
                      rows={2}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={editRubric.service}
                      onChange={(e) => setEditRubric({ ...editRubric, service: e.target.value })}
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selected) return;
                      updatePamsSubmission(selected.id, {
                        workload: { ...selected.workload, ...editWorkload },
                        rubric: { ...selected.rubric, ...editRubric },
                      });
                      setSelected({
                        ...selected,
                        workload: { ...selected.workload, ...editWorkload },
                        rubric: { ...selected.rubric, ...editRubric },
                      });
                      setEditing(false);
                    }}
                  >
                    Save Edits
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Meeting date
              <input
                type="date"
                className="mt-1"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Follow-up meeting
              <input
                type="date"
                className="mt-1"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                placeholder="Optional"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Comments / required changes
              <textarea
                rows={3}
                className="mt-1"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Confirmation notes or change requests"
              />
            </label>
          </div>

          {selected.followUpMeeting && (
            <div className="mt-3 border rounded-lg p-3 bg-gray-50">
              <p className="text-sm font-semibold text-gray-800">
                Department performance follow-up
              </p>
              <p className="text-sm text-gray-700">
                Scheduled: {selected.followUpMeeting.scheduledAt || 'TBD'} · Status:{' '}
                {selected.followUpMeeting.status || 'pending'}
              </p>
              {selected.followUpMeeting.topic && (
                <p className="text-xs text-gray-500 mt-1">{selected.followUpMeeting.topic}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Clear selection
            </Button>
            <Button variant="outline" onClick={() => setEditing(!editing)}>
              {editing ? 'Close Edit' : 'Edit Submission'}
            </Button>
            <Button
              onClick={() => setShowAppraisalForm(!showAppraisalForm)}
              className="flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              {showAppraisalForm ? 'Hide' : 'Show'} Appraisal Form
            </Button>
          </div>

          {showAppraisalForm && (
            <div className="mt-6 pt-6 border-t">
              <AppraisalForm
                pamsId={selected.id}
                employeeId={selected.employeeId}
                pamsData={selected}
                onClose={() => setShowAppraisalForm(false)}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function EditableField({ label, value, onChange, rows = 2 }) {
  return null;
}

function AchievementRow({ label, value }) {
  const meta = value ? achievementLevels[value] : null;
  return (
    <div className="flex items-center justify-between border rounded-lg p-3 bg-white">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-600">
          {meta ? `${meta.label} (${meta.marks} marks)` : 'No selection provided'}
        </p>
      </div>
      {meta && (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {meta.label}
        </span>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return <p className="text-sm font-semibold text-gray-900 mt-2">{children}</p>;
}
