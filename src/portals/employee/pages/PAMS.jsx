import { useMemo, useState } from 'react';
import {
  ClipboardDocumentListIcon,
  InboxArrowDownIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import FileUpload from '../../../components/FileUpload';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import { useAuthStore } from '../../../state/auth';
import { useDataStore } from '../../../state/data';

const statusVariant = {
  submitted: 'info',
  returned: 'warning',
  'hod-confirmed': 'primary',
  'vc-approved': 'success',
  pending: 'secondary',
};

const achievementLevels = [
  { value: 'fully', label: 'Fully Achieved', marks: 100 },
  { value: 'largely', label: 'Largely Achieved', marks: 85 },
  { value: 'partially', label: 'Partially Achieved', marks: 70 },
  { value: 'not', label: 'Not Achieved', marks: 0 },
];

const initialFacultyForm = (period) => ({
  period,
  designation: '',
  teachingAssessment: {
    studentEvaluation: '',
    teachingWorkload: '',
    courseCompletion: '',
  },
  fypSupervision: '',
  msPhDSupervision: '',
  researchPublications: '',
  researchFunding: '',
  administrativeDuties: '',
  serviceToCommunity: '',
  attachments: [],
});

const initialHODForm = (period) => ({
  period,
  leadership: '',
  curriculumInstruction: '',
  managementAdministration: '',
  personnel: '',
  promotionTenure: '',
  attachments: [],
});

export default function EmployeePAMS() {
  const { user, activeRole, hasRole } = useAuthStore();
  const employees = useDataStore((s) => s.employees);
  const submitPamsForm = useDataStore((s) => s.submitPamsForm);
  const getPamsForEmployee = useDataStore((s) => s.getPamsForEmployee);
  const isHOD = hasRole('hod');

  const employee = useMemo(
    () => employees.find((e) => e.id === user?.id || e.email === user?.email),
    [employees, user],
  );

  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const defaultPeriod = `${now.getFullYear()}-Q${quarter}`;

  const [activeTab, setActiveTab] = useState('teaching');
  const [form, setForm] = useState(() =>
    isHOD ? initialHODForm(defaultPeriod) : initialFacultyForm(defaultPeriod),
  );
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submissions = useMemo(
    () => (employee ? getPamsForEmployee(employee.id) : []),
    [employee, getPamsForEmployee],
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
        ? 'HOD PAMS submitted to Dean for review.'
        : 'Faculty PAMS submitted to HOD for review. You will be invited for confirmation.',
    );
    setForm(isHOD ? initialHODForm(defaultPeriod) : initialFacultyForm(defaultPeriod));
    setActiveTab(isHOD ? 'leadership' : 'teaching');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance & Workload (PAMS)</h1>
          <p className="text-gray-600">
            {isHOD
              ? 'HOD Performance Evaluation - Submit your annual performance report'
              : 'Faculty Performance Evaluation - Submit your annual performance report'}
          </p>
          {isHOD && (
            <p className="text-sm text-indigo-600 mt-1">
              Submitting as HOD — this will route to the Dean for review.
            </p>
          )}
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500" />
          <p className="font-semibold text-gray-900">New submission</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm text-gray-700 font-medium">
              Period
              <input
                className="mt-1"
                value={form.period}
                onChange={(e) => updateField('period', e.target.value)}
                placeholder="2026-Q1"
              />
            </label>
            <label className="text-sm text-gray-700 font-medium">
              Department
              <input className="mt-1" value={employee?.department || ''} disabled />
            </label>
            <label className="text-sm text-gray-700 font-medium">
              Faculty
              <input className="mt-1" value={employee?.faculty || ''} disabled />
            </label>
          </div>

          {isHOD ? (
            <HODPAMSForm
              form={form}
              updateField={updateField}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ) : (
            <FacultyPAMSForm
              form={form}
              updateField={updateField}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {message && <p className="text-sm text-emerald-600">{message}</p>}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="submit"
              disabled={submitting || !employee}
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
          <p className="font-semibold text-gray-900">Your submissions</p>
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
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm text-gray-800">
                    {p.category === 'hod' ? 'HOD Evaluation' : 'Faculty Evaluation'}
                  </p>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-2">
                  <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function FacultyPAMSForm({ form, updateField, activeTab, setActiveTab }) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="teaching">Teaching Assessment</TabsTrigger>
        <TabsTrigger value="research">Research & Supervision</TabsTrigger>
        <TabsTrigger value="service">Service & Admin</TabsTrigger>
        <TabsTrigger value="attachments">Attachments</TabsTrigger>
      </TabsList>

      <TabsContent value="teaching" className="space-y-4 mt-4">
        <AchievementField
          label="Student Evaluation (SETE)"
          description="Target: Average student evaluation above 85% in all assigned courses"
          value={form.teachingAssessment.studentEvaluation}
          onChange={(v) => updateField('teachingAssessment.studentEvaluation', v)}
          criteria={[
            'Fully: Scores exceeding 85%',
            'Largely: 70-85%',
            'Partially: 50-70%',
            'Not: Below 50%',
          ]}
        />
        <AchievementField
          label="Teaching Workload"
          description="Required workload undertaken as per job description during performance appraisal period"
          value={form.teachingAssessment.teachingWorkload}
          onChange={(v) => updateField('teachingAssessment.teachingWorkload', v)}
          criteria={[
            'Fully: 100% workload',
            'Largely: 85-100%',
            'Partially: 70-85%',
            'Not: Below 70%',
          ]}
        />
        <AchievementField
          label="Course Completion"
          description="100% completion of courses with timely classroom teaching, comprehensive coverage, student records, quizzes, assignments, exams"
          value={form.teachingAssessment.courseCompletion}
          onChange={(v) => updateField('teachingAssessment.courseCompletion', v)}
          criteria={[
            'Fully: All courses completed on time with complete course files',
            'Largely: All completed, some files submitted late',
            'Partially: Completed, all files submitted late',
            'Not: Incomplete course files',
          ]}
        />
      </TabsContent>

      <TabsContent value="research" className="space-y-4 mt-4">
        <AchievementField
          label="FYP Supervision / Academic Activities"
          description="Supervise Final Year Projects meeting departmental average, or conduct workshops/seminars, obtain project funding"
          value={form.fypSupervision}
          onChange={(v) => updateField('fypSupervision', v)}
          criteria={[
            'Fully: Meets departmental average (100%)',
            'Largely: Approaches 70% of departmental standard',
            'Partially: Around 50% of departmental average',
            'Not: Below 50%',
          ]}
        />
        <AchievementField
          label="MS/PhD Thesis Supervision"
          description="Supervision according to departmental average"
          value={form.msPhDSupervision}
          onChange={(v) => updateField('msPhDSupervision', v)}
          criteria={[
            'Fully: Meets departmental average (100%)',
            'Largely: Approaches 70% of standard',
            'Partially: Around 50%',
            'Not: Below 50%',
          ]}
        />
        <AchievementField
          label="Research Publications"
          description="Publication in HEC Recognized (W, X, Y) or Impact Factor Journals as Principal/Co-Author"
          value={form.researchPublications}
          onChange={(v) => updateField('researchPublications', v)}
          criteria={[
            'Fully (Mastery): All publications published/accepted in recognized journals',
            'Largely (Proficiency): 50% published/accepted, 50% submitted',
            'Partially (Submission): Target publications submitted',
            'Not: No publications',
          ]}
        />
        <AchievementField
          label="Research Funding Achievement"
          description="Accepted funding proposal from external agency and amount secured"
          value={form.researchFunding}
          onChange={(v) => updateField('researchFunding', v)}
          criteria={[
            'Fully: Meets target (proposals accepted)',
            'Largely: Proposals submitted but not yet accepted',
            'Partially: Developing proposals',
            'Not: No proposals submitted',
          ]}
        />
      </TabsContent>

      <TabsContent value="service" className="space-y-4 mt-4">
        <AchievementField
          label="Administrative Duties"
          description="Departmental/University level duties: Course File Coordinator, Batch Advisor, Lab Coordinator, Society Advisor, Focal Person (QEC/ORIC/OBE/CPD/CDC), Committee Member"
          value={form.administrativeDuties}
          onChange={(v) => updateField('administrativeDuties', v)}
          criteria={[
            'Fully: Meets target based on designation',
            'Largely: Meets 70% of target',
            'Partially: Meets 50% of target',
            'Not: Below 50%',
          ]}
        />
        <AchievementField
          label="Service to Community"
          description="Professional organization membership, panels/programs participation, committee assignments, professional meetings, consultation, presentations, civic boards, MS/PhD thesis evaluation as external examiner"
          value={form.serviceToCommunity}
          onChange={(v) => updateField('serviceToCommunity', v)}
          criteria={[
            'Fully: Meets target based on designation',
            'Largely: 70% of target',
            'Partially: 50% of target',
            'Not: Below 50%',
          ]}
        />
      </TabsContent>

      <TabsContent value="attachments" className="space-y-3 mt-4">
        <FileUpload
          label="Supporting documents"
          value={form.attachments}
          onChange={(files) => updateField('attachments', files)}
          helper="Attach course files, SETE reports, publication proofs, grant proposals, evidence of service activities"
          maxFiles={10}
          maxSizeMB={15}
        />
      </TabsContent>
    </Tabs>
  );
}

function HODPAMSForm({ form, updateField, activeTab, setActiveTab }) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="leadership">Leadership</TabsTrigger>
        <TabsTrigger value="curriculum">Curriculum & Instruction</TabsTrigger>
        <TabsTrigger value="management">Management & Admin</TabsTrigger>
        <TabsTrigger value="personnel">Personnel</TabsTrigger>
        <TabsTrigger value="promotion">Promotion & Tenure</TabsTrigger>
        <TabsTrigger value="attachments">Attachments</TabsTrigger>
      </TabsList>

      <TabsContent value="leadership" className="space-y-4 mt-4">
        <div className="space-y-4">
          <HODAchievementField
            label="Department Mission & Vision Leadership"
            description="Ensures faculty work together to develop mission, vision, goals, objectives and strategic priorities aligned with campus strategic plan"
            value={form.leadership}
            onChange={(v) => updateField('leadership', v)}
            section="mission"
          />
          <HODAchievementField
            label="Overall Leadership & Initiative"
            description="Provides leadership by initiating discussion of needed changes and supporting appropriate initiatives from colleagues"
            value={form.leadership}
            onChange={(v) => updateField('leadership', v)}
            section="initiative"
          />
          <HODAchievementField
            label="Communication & Advocacy"
            description="Communicates departmental priorities to Dean and institutional priorities to department; effective advocate for department"
            value={form.leadership}
            onChange={(v) => updateField('leadership', v)}
            section="communication"
          />
        </div>
      </TabsContent>

      <TabsContent value="curriculum" className="space-y-4 mt-4">
        <HODAchievementField
          label="Curriculum Development & Standards"
          description="Ensures curricula are current, support strategic priorities, meet accreditation standards, responsive to student demands and regional needs"
          value={form.curriculumInstruction}
          onChange={(v) => updateField('curriculumInstruction', v)}
          section="development"
        />
        <HODAchievementField
          label="Course Offerings & Delivery Methods"
          description="Establishes departmental priorities for offering and funding courses by various delivery methods (on-campus, online, remote, weekend)"
          value={form.curriculumInstruction}
          onChange={(v) => updateField('curriculumInstruction', v)}
          section="delivery"
        />
        <HODAchievementField
          label="Teaching Best Practices & Faculty Development"
          description="Ensures faculty awareness of best practices, access to training, opportunities for peer review, encourages teaching effectiveness documentation"
          value={form.curriculumInstruction}
          onChange={(v) => updateField('curriculumInstruction', v)}
          section="bestPractices"
        />
      </TabsContent>

      <TabsContent value="management" className="space-y-4 mt-4">
        <HODAchievementField
          label="Collegial Work Climate"
          description="Fosters collegial work climate based on open communication, trust, and shared responsibility for achieving strategic goals"
          value={form.managementAdministration}
          onChange={(v) => updateField('managementAdministration', v)}
          section="climate"
        />
        <HODAchievementField
          label="Reporting & Documentation"
          description="Ensures productivity and planning reports submitted to dean in timely fashion"
          value={form.managementAdministration}
          onChange={(v) => updateField('managementAdministration', v)}
          section="reporting"
        />
        <HODAchievementField
          label="Course Scheduling & Staffing"
          description="Ensures needed courses are scheduled and staffed each semester, monitors enrollments, makes schedule adjustments"
          value={form.managementAdministration}
          onChange={(v) => updateField('managementAdministration', v)}
          section="scheduling"
        />
        <HODAchievementField
          label="Budget & Resources Management"
          description="Manages and monitors department's budget, facilities, equipment; requests new resources to support enrollments and strategic priorities"
          value={form.managementAdministration}
          onChange={(v) => updateField('managementAdministration', v)}
          section="budget"
        />
        <HODAchievementField
          label="Grant & Contract Proposals"
          description="Tracks and signs off on all grant and contract proposals on behalf of department"
          value={form.managementAdministration}
          onChange={(v) => updateField('managementAdministration', v)}
          section="grants"
        />
      </TabsContent>

      <TabsContent value="personnel" className="space-y-4 mt-4">
        <HODAchievementField
          label="Professional Development"
          description="Encourages faculty and staff to take advantage of professional development opportunities and rewards demonstrated improvement"
          value={form.personnel}
          onChange={(v) => updateField('personnel', v)}
          section="development"
        />
        <HODAchievementField
          label="Junior Faculty Support"
          description="Ensures junior faculty receive necessary training, integration, access to professional development, and proper evaluation"
          value={form.personnel}
          onChange={(v) => updateField('personnel', v)}
          section="juniorFaculty"
        />
        <HODAchievementField
          label="Staff Work Assignments"
          description="Establishes office schedules and work assignments for departmental administrative, clerical, and service staff"
          value={form.personnel}
          onChange={(v) => updateField('personnel', v)}
          section="staffing"
        />
        <HODAchievementField
          label="Performance Reviews"
          description="Ensures all faculty and staff receive annual performance reviews with formative and summative feedback"
          value={form.personnel}
          onChange={(v) => updateField('personnel', v)}
          section="reviews"
        />
        <HODAchievementField
          label="Conflict Resolution"
          description="Serves as mediator in resolving conflicts among employees or between faculty and students"
          value={form.personnel}
          onChange={(v) => updateField('personnel', v)}
          section="conflict"
        />
      </TabsContent>

      <TabsContent value="promotion" className="space-y-4 mt-4">
        <HODAchievementField
          label="Promotion & Tenure Documents"
          description="Ensures department's P&T documents are consistent with college/campus policies, criteria appropriate to discipline and mission"
          value={form.promotionTenure}
          onChange={(v) => updateField('promotionTenure', v)}
          section="documents"
        />
        <HODAchievementField
          label="Research/Creative Endeavor Plans"
          description="Assists faculty in preparing and implementing research/creative endeavor plans appropriate to rank, service length, responsibilities"
          value={form.promotionTenure}
          onChange={(v) => updateField('promotionTenure', v)}
          section="research"
        />
        <HODAchievementField
          label="Research Support"
          description="Supports faculty research/creative endeavor through flexible schedules or appropriate accommodations for significant projects"
          value={form.promotionTenure}
          onChange={(v) => updateField('promotionTenure', v)}
          section="support"
        />
        <HODAchievementField
          label="Promotion & Tenure Recommendations"
          description="In recommending faculty for reappointment, promotion, tenure, ensures relevant criteria met and standards upheld"
          value={form.promotionTenure}
          onChange={(v) => updateField('promotionTenure', v)}
          section="recommendations"
        />
      </TabsContent>

      <TabsContent value="attachments" className="space-y-3 mt-4">
        <FileUpload
          label="Supporting documents"
          value={form.attachments}
          onChange={(files) => updateField('attachments', files)}
          helper="Attach strategic plans, reports, budget documents, faculty development records, evaluation evidence"
          maxFiles={10}
          maxSizeMB={15}
        />
      </TabsContent>
    </Tabs>
  );
}

function AchievementField({ label, description, value, onChange, criteria }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <label className="block text-sm font-semibold text-gray-900 mb-1">{label}</label>
      <p className="text-xs text-gray-600 mb-3">{description}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        {achievementLevels.map((level) => (
          <label
            key={level.value}
            className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${
              value === level.value
                ? 'border-[hsl(var(--color-primary))] bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name={label}
              value={level.value}
              checked={value === level.value}
              onChange={(e) => onChange(e.target.value)}
              className="text-[hsl(var(--color-primary))]"
            />
            <div className="text-xs">
              <div className="font-medium text-gray-900">{level.label}</div>
              <div className="text-gray-500">({level.marks} marks)</div>
            </div>
          </label>
        ))}
      </div>
      {criteria && (
        <div className="text-xs text-gray-600 space-y-1 mt-2 pl-4">
          {criteria.map((c, i) => (
            <div key={i}>• {c}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function HODAchievementField({ label, description, value, onChange, section }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <label className="block text-sm font-semibold text-gray-900 mb-1">{label}</label>
      <p className="text-xs text-gray-600 mb-3">{description}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {achievementLevels.map((level) => (
          <label
            key={level.value}
            className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${
              value === level.value
                ? 'border-[hsl(var(--color-primary))] bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name={`${section}-${label}`}
              value={level.value}
              checked={value === level.value}
              onChange={(e) => onChange(e.target.value)}
              className="text-[hsl(var(--color-primary))]"
            />
            <div className="text-xs">
              <div className="font-medium text-gray-900">{level.label}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
