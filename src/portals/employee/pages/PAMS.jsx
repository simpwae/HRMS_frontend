import { useMemo, useState } from 'react';
import {
  ClipboardDocumentListIcon,
  InboxArrowDownIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import FileUpload from '../../../components/FileUpload';
import Modal from '../../../components/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import { useAuthStore } from '../../../state/auth';
import { useDataStore } from '../../../state/data';

const statusVariant = {
  submitted: 'info',
  returned: 'warning',
  'hod-confirmed': 'primary',
  'dean-confirmed': 'success',
  'vc-approved': 'success',
  'hr-final': 'success',
  pending: 'secondary',
};

const initialFacultyForm = (period) => ({
  period,
  workload: {
    teachingLoad: '',
    admin: '',
  },
  grievance: '',
  attachments: [],
});

const initialHODForm = (period) => ({
  period,
  workload: {
    teachingLoad: '',
    admin: '',
  },
  grievance: '',
  attachments: [],
});

export default function EmployeePAMS() {
  const { user, hasRole } = useAuthStore();
  const employees = useDataStore((s) => s.employees);
  const submitPamsForm = useDataStore((s) => s.submitPamsForm);
  const getPamsForEmployee = useDataStore((s) => s.getPamsForEmployee);
  const isHOD = hasRole('hod');

  const employee = useMemo(
    () => employees.find((e) => e.id === user?.id || e.email === user?.email),
    [employees, user],
  );

  const now = new Date();
  // Align period format with the rest of the app (e.g., "Fall 2026")
  const semester = 'Fall';
  const defaultPeriod = `${semester} ${now.getFullYear()}`;

  const [activeTab, setActiveTab] = useState('workload');
  const [form, setForm] = useState(() =>
    isHOD ? initialHODForm(defaultPeriod) : initialFacultyForm(defaultPeriod),
  );
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const submissions = useMemo(
    () => (employee ? getPamsForEmployee(employee.id) : []),
    [employee, getPamsForEmployee],
  );

  const hasSubmittedThisPeriod = useMemo(
    () => submissions.some((s) => s.period === form.period && s.status === 'submitted'),
    [submissions, form.period],
  );

  const updateField = (path, value) => {
    setForm((prev) => {
      const parts = path.split('.');
      if (parts.length === 1) {
        return { ...prev, [path]: value };
      }
      const [section, key] = parts;
      return { ...prev, [section]: { ...prev[section], [key]: value } };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employee) {
      setMessage('No employee profile found.');
      return;
    }

    // Check if already submitted
    if (hasSubmittedThisPeriod) {
      setMessage('Form already submitted for this period. No modifications allowed.');
      return;
    }

    // Show confirmation modal instead of alert
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    submitPamsForm({
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      faculty: employee.faculty,
      category: isHOD ? 'hod' : 'faculty',
      period: form.period,
      ...form,
      attachments: form.attachments.map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
      })),
      by: 'employee',
    });
    setSubmitting(false);
    setMessage(
      isHOD
        ? 'HOD PAMS submitted to Dean for review and meeting.'
        : 'Faculty PAMS submitted to HOD for review and meeting.',
    );
    setForm(isHOD ? initialHODForm(defaultPeriod) : initialFacultyForm(defaultPeriod));
    setActiveTab('workload');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance & Workload (PAMS)</h1>
          <p className="text-gray-600">
            {isHOD
              ? 'HOD Performance Evaluation - Describe your workload and achievements'
              : 'Faculty Performance Evaluation - Describe your workload and achievements'}
          </p>
          {isHOD && (
            <p className="text-sm text-indigo-600 mt-1">
              ✓ Submitting as HOD — routed to Dean for appraisal meeting
            </p>
          )}
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500" />
          <p className="font-semibold text-gray-900">New Submission</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm text-gray-700 font-medium">
              Period
              <input
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={form.period}
                onChange={(e) => updateField('period', e.target.value)}
                placeholder="Fall 2026"
              />
            </label>
            <label className="text-sm text-gray-700 font-medium">
              Department
              <input
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                value={employee?.department || ''}
                disabled
              />
            </label>
            <label className="text-sm text-gray-700 font-medium">
              Faculty
              <input
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                value={employee?.faculty || ''}
                disabled
              />
            </label>
          </div>

          <PAMSForm
            form={form}
            updateField={updateField}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isHOD={isHOD}
          />

          {hasSubmittedThisPeriod && (
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-3">
              <p className="text-sm text-orange-700 font-medium">
                ⚠️ Form already submitted for period {form.period}. No modifications allowed.
              </p>
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-sm text-emerald-700">{message}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="submit"
              disabled={submitting || !employee || hasSubmittedThisPeriod}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircleIcon className="w-4 h-4" />
              )}
              Submit {isHOD ? 'to Dean' : 'to HOD'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <InboxArrowDownIcon className="w-5 h-5 text-gray-500" />
          <p className="font-semibold text-gray-900">Your Submissions</p>
        </div>
        {submissions.length === 0 ? (
          <p className="text-sm text-gray-600">No PAMS submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((p) => (
              <div key={p.id} className="border rounded-lg p-3 grid md:grid-cols-4 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="font-semibold text-gray-900">{p.period}</p>
                  <p className="text-xs text-gray-500">{p.submittedAt || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-sm text-gray-800">
                    {p.category === 'hod' ? 'HOD Evaluation' : 'Faculty Evaluation'}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-center gap-1">
                  <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                  <p className="text-[11px] text-gray-500">
                    {(() => {
                      switch (p.status) {
                        case 'submitted':
                          return p.category === 'hod'
                            ? 'Next: Dean will schedule appraisal'
                            : 'Next: HOD will schedule appraisal';
                        case 'hod-confirmed':
                          return 'Next: VC approval';
                        case 'dean-confirmed':
                          return 'Next: VC approval';
                        case 'vc-approved':
                          return 'Next: HR finalization';
                        case 'hr-final':
                          return 'Completed';
                        default:
                          return '';
                      }
                    })()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Review Your Submission</h2>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Important:</strong> Once submitted, this form cannot be modified. Please
              review all information carefully.
            </p>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Basic Info */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Submission Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">
                    {isHOD ? 'HOD Evaluation' : 'Faculty Evaluation'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Period</p>
                  <p className="font-medium text-gray-900">{form.period}</p>
                </div>
                <div>
                  <p className="text-gray-500">Department</p>
                  <p className="font-medium text-gray-900">{employee?.department}</p>
                </div>
                <div>
                  <p className="text-gray-500">Faculty</p>
                  <p className="font-medium text-gray-900">{employee?.faculty}</p>
                </div>
                <div>
                  <p className="text-gray-500">Submitted By</p>
                  <p className="font-medium text-gray-900">{employee?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Submitted To</p>
                  <p className="font-medium text-gray-900">{isHOD ? 'Dean' : 'HOD'}</p>
                </div>
              </div>
            </div>

            {/* Workload */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Workload Description</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Teaching Load</p>
                  <p className="text-sm text-gray-900 whitespace-pre-line bg-white p-2 rounded border">
                    {form.workload.teachingLoad || <em className="text-gray-400">Not provided</em>}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Administrative Duties</p>
                  <p className="text-sm text-gray-900 whitespace-pre-line bg-white p-2 rounded border">
                    {form.workload.admin || <em className="text-gray-400">Not provided</em>}
                  </p>
                </div>
              </div>
            </div>

            {/* Grievance/Comments */}
            {form.grievance && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">Grievance / Comments</h3>
                <p className="text-sm text-gray-900 whitespace-pre-line bg-white p-2 rounded border">
                  {form.grievance}
                </p>
              </div>
            )}

            {/* Attachments */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">
                Attachments ({form.attachments.length})
              </h3>
              {form.attachments.length === 0 ? (
                <p className="text-sm text-gray-500">No attachments</p>
              ) : (
                <ul className="space-y-2">
                  {form.attachments.map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center justify-between text-sm bg-white p-2 rounded border"
                    >
                      <span className="font-medium text-gray-900">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={confirmSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircleIcon className="w-4 h-4" />
              )}
              Confirm & Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PAMSForm({ form, updateField, activeTab, setActiveTab, isHOD }) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="workload">Workload Description</TabsTrigger>
        <TabsTrigger value="attachments">Attachments</TabsTrigger>
      </TabsList>

      <TabsContent value="workload" className="space-y-4 mt-4">
        <p className="text-sm text-gray-600 mb-3">
          {isHOD
            ? 'As HOD, describe your departmental leadership workload including teaching and administrative responsibilities.'
            : 'Describe your workload during this performance period. Be specific about courses taught and administrative duties. Note: FYP supervisions, thesis supervisions, and research grants are managed in your Profile section.'}
        </p>
        <label className="text-sm font-medium text-gray-700 block">
          Teaching Load *
          <textarea
            rows={4}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.workload.teachingLoad}
            onChange={(e) => updateField('workload.teachingLoad', e.target.value)}
            placeholder={
              isHOD
                ? 'e.g., Led department teaching plan; taught 1 course to CS-21'
                : 'e.g., 3 courses across 2 sections; labs included with prep and grading'
            }
            required
          />
        </label>

        <label className="text-sm font-medium text-gray-700 block">
          Administrative Duties
          <textarea
            rows={4}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.workload.admin}
            onChange={(e) => updateField('workload.admin', e.target.value)}
            placeholder={
              isHOD
                ? 'e.g., Department budgeting, QEC liaison, hiring coordination'
                : 'e.g., Exam coordinator (weekly) plus QEC focal (biweekly)'
            }
          />
        </label>
        <label className="text-sm font-medium text-gray-700 block mt-4">
          Grievance / Comments / Suggestions (Optional)
          <textarea
            rows={2}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.grievance}
            onChange={(e) => updateField('grievance', e.target.value)}
            placeholder="Any concerns, suggestions, or additional comments"
          />
        </label>
      </TabsContent>

      <TabsContent value="attachments" className="space-y-3 mt-4">
        <FileUpload
          label="Supporting Documents"
          value={form.attachments}
          onChange={(files) => updateField('attachments', files)}
          helper={
            isHOD
              ? 'Attach strategic plans, reports, budget documents, faculty development records'
              : 'Attach course files, SETE reports, publication proofs, grant proposals'
          }
          maxFiles={10}
          maxSizeMB={15}
        />
      </TabsContent>
    </Tabs>
  );
}
