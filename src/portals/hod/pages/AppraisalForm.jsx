import { useMemo, useState } from 'react';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { useDataStore } from '../../../state/data';

const achievementLevels = {
  fully: { label: 'Fully Achieved', value: 'fully', marks: 100 },
  largely: { label: 'Largely Achieved', value: 'largely', marks: 85 },
  partially: { label: 'Partially Achieved', value: 'partially', marks: 70 },
  not: { label: 'Not Achieved', value: 'not', marks: 0 },
};

const categories = [
  { key: 'teaching', label: 'Teaching' },
  { key: 'research', label: 'Research' },
  { key: 'fypSupervision', label: 'FYP Supervision' },
  { key: 'service', label: 'Service' },
];

export default function HODAppraisalForm({ pamsId, employeeId, pamsData, onClose }) {
  const getPamsForEmployee = useDataStore((s) => s.getPamsForEmployee);
  const getEmployee = useDataStore((s) => s.getEmployee);
  const getEmployeePublications = useDataStore((s) => s.getEmployeePublications);
  const getEmployeeFYPSupervisions = useDataStore((s) => s.getEmployeeFYPSupervisions);
  const getEmployeeThesisSupervisions = useDataStore((s) => s.getEmployeeThesisSupervisions);
  const getEmployeeResearchGrants = useDataStore((s) => s.getEmployeeResearchGrants);
  const getEmployeeAttendanceSummary = useDataStore((s) => s.getEmployeeAttendanceSummary);
  const getEmployeeAdminDuties = useDataStore((s) => s.getEmployeeAdminDuties);
  const updatePamsSubmission = useDataStore((s) => s.updatePamsSubmission);

  const pams = useMemo(
    () => pamsData || getPamsForEmployee(employeeId)?.find((p) => p.id === pamsId),
    [pamsData, pamsId, employeeId, getPamsForEmployee],
  );

  const employee = useMemo(() => getEmployee(employeeId), [employeeId, getEmployee]);

  // Get current fall semester year for filtering
  const currentYear = new Date().getFullYear();

  const publications = useMemo(
    () => getEmployeePublications(employeeId).filter((pub) => pub.year === currentYear),
    [employeeId, getEmployeePublications, currentYear],
  );
  const fypSupervisions = useMemo(
    () =>
      getEmployeeFYPSupervisions(employeeId).filter((fyp) => fyp.period === `Fall ${currentYear}`),
    [employeeId, getEmployeeFYPSupervisions, currentYear],
  );
  const thesisSupervisions = useMemo(
    () =>
      getEmployeeThesisSupervisions(employeeId).filter(
        (thesis) => thesis.period === `Fall ${currentYear}`,
      ),
    [employeeId, getEmployeeThesisSupervisions, currentYear],
  );
  const researchGrants = useMemo(
    () =>
      getEmployeeResearchGrants(employeeId).filter(
        (grant) => grant.period === `Fall ${currentYear}`,
      ),
    [employeeId, getEmployeeResearchGrants, currentYear],
  );
  const adminDuties = useMemo(
    () => getEmployeeAdminDuties(employeeId),
    [employeeId, getEmployeeAdminDuties],
  );
  const attendance = useMemo(
    () => getEmployeeAttendanceSummary(employeeId),
    [employeeId, getEmployeeAttendanceSummary],
  );

  const [assessment, setAssessment] = useState({
    teaching: 'largely',
    research: 'largely',
    fypSupervision: 'largely',
    service: 'largely',
  });
  const [meetingDate, setMeetingDate] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitAppraisal = () => {
    if (!meetingDate || !pams) {
      alert('Please fill in all required fields');
      return;
    }
    // Meeting date validation: must be today or future, within next 365 days
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const md = new Date(meetingDate);
      md.setHours(0, 0, 0, 0);
      const oneYearAhead = new Date();
      oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);
      oneYearAhead.setHours(0, 0, 0, 0);
      if (isNaN(md.getTime())) {
        alert('Invalid meeting date.');
        return;
      }
      if (md < today) {
        alert('Meeting date cannot be in the past.');
        return;
      }
      if (md > oneYearAhead) {
        alert('Meeting date is too far in the future.');
        return;
      }
    } catch (e) {
      alert('Invalid meeting date.');
      return;
    }

    setSubmitting(true);
    updatePamsSubmission(pamsId, {
      hodReview: {
        status: 'hod-confirmed',
        meetingDate,
        comment: comments,
        decidedAt: new Date().toISOString().split('T')[0],
        assessment,
      },
      status: 'hod-confirmed',
    });
    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      onClose?.();
    }, 2000);
  };

  if (!pams || !employee) {
    return (
      <Card className="w-full">
        <p className="text-gray-600">Loading appraisal form...</p>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="w-full text-center p-6">
        <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="font-semibold text-green-700">Appraisal Submitted Successfully</p>
        <p className="text-sm text-gray-600 mt-2">Redirecting...</p>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Faculty Appraisal Meeting Form</h2>
      </div>

      <div className="space-y-6">
        {/* Employee Info */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Employee Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-semibold text-gray-900">{employee.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ID</p>
              <p className="font-semibold text-gray-900">{employee.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Department</p>
              <p className="font-semibold text-gray-900">{employee.department}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Designation</p>
              <p className="font-semibold text-gray-900">{employee.designation}</p>
            </div>
          </div>
        </Card>

        {/* Submitted PAMS (Read-Only) */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">
            Submitted PAMS Data (Period: {pams.period})
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Workload Description</p>
              <div className="mt-2 p-3 bg-gray-50 rounded border text-sm text-gray-700 space-y-2">
                <p>
                  <strong>Teaching:</strong> {pams.workload?.teachingLoad}
                </p>
                <p>
                  <strong>Project Supervision:</strong> {pams.workload?.projectSupervision}
                </p>
                <p>
                  <strong>Advisory:</strong> {pams.workload?.advisory}
                </p>
                <p>
                  <strong>Admin:</strong> {pams.workload?.admin}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Performance Rubric</p>
              <div className="mt-2 p-3 bg-gray-50 rounded border text-sm text-gray-700 space-y-2">
                <p>
                  <strong>Teaching:</strong> {pams.rubric?.teaching}
                </p>
                <p>
                  <strong>Research:</strong> {pams.rubric?.research}
                </p>
                <p>
                  <strong>Service:</strong> {pams.rubric?.service}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Research Data */}
        {/* Research Activities from Profile */}
        {(fypSupervisions?.length > 0 ||
          thesisSupervisions?.length > 0 ||
          researchGrants?.length > 0) && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Research Activities (from Profile)</h3>
              <Badge variant="info" className="text-xs">
                Fall {currentYear} data from employee profile
              </Badge>
            </div>
            <div className="space-y-3">
              {fypSupervisions?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    FYP Supervised ({fypSupervisions.length})
                  </p>
                  {fypSupervisions.map((fyp, idx) => (
                    <div key={idx} className="text-xs text-gray-600 p-2 bg-blue-50 rounded mb-1">
                      <Badge className="mb-1">{fyp.period}</Badge>
                      <p className="font-semibold">{fyp.projectTitle}</p>
                      <p>Students: {fyp.studentNames}</p>
                      {fyp.numberOfStudents && <p>Number of Students: {fyp.numberOfStudents}</p>}
                      {fyp.awards && <p className="mt-1">Awards: {fyp.awards}</p>}
                      {fyp.technicalPapers && <p>Technical Papers: {fyp.technicalPapers}</p>}
                      {fyp.productsDevloped && <p>Products: {fyp.productsDevloped}</p>}
                      {fyp.prototypeCompleted && (
                        <p>Prototype/Feasibility: {fyp.prototypeCompleted}</p>
                      )}
                      {fyp.otherInfo && <p>Other Info: {fyp.otherInfo}</p>}
                      <p>Status: {fyp.status}</p>
                    </div>
                  ))}
                </div>
              )}
              {thesisSupervisions?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Thesis Supervised ({thesisSupervisions.length})
                  </p>
                  {thesisSupervisions.map((thesis, idx) => (
                    <div key={idx} className="text-xs text-gray-600 p-2 bg-green-50 rounded mb-1">
                      <div className="flex gap-2 mb-1">
                        <Badge>{thesis.period}</Badge>
                        <Badge variant={thesis.level === 'PhD' ? 'primary' : 'secondary'}>
                          {thesis.level}
                        </Badge>
                      </div>
                      <p className="font-semibold">{thesis.thesisTitle}</p>
                      <p>
                        Student: {thesis.studentName} • Status: {thesis.status}
                      </p>
                      {thesis.conferencePapers && (
                        <p className="mt-1">Conference Papers: {thesis.conferencePapers}</p>
                      )}
                      {thesis.researchPaperCategory && (
                        <p>Research Category/IF: {thesis.researchPaperCategory}</p>
                      )}
                      {thesis.presentStatus && <p>Present Status: {thesis.presentStatus}</p>}
                    </div>
                  ))}
                </div>
              )}
              {researchGrants?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Research Grants ({researchGrants.length})
                  </p>
                  {researchGrants.map((grant, idx) => (
                    <div key={idx} className="text-xs text-gray-600 p-2 bg-orange-50 rounded mb-1">
                      <Badge className="mb-1">{grant.period}</Badge>
                      <p className="font-semibold">{grant.grantName}</p>
                      <p>
                        Agency: {grant.fundingAgency} • Amount: PKR{' '}
                        {Number(grant.amount).toLocaleString()}
                      </p>
                      {grant.amountObtained && (
                        <p>Amount Obtained: PKR {Number(grant.amountObtained).toLocaleString()}</p>
                      )}
                      {grant.approvedDate && <p>Approved: {grant.approvedDate}</p>}
                      <p>
                        Status: {grant.status}
                        {grant.outcome && <span className="ml-2">Outcome: {grant.outcome}</span>}
                      </p>
                      {grant.notes && <p className="mt-1">Notes: {grant.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Administrative Duties */}
        {adminDuties?.length > 0 && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">
              Administrative Duties ({adminDuties.length})
            </h3>
            <div className="space-y-3">
              {adminDuties.map((duty) => (
                <div key={duty.id} className="text-sm text-gray-600 p-3 bg-purple-50 rounded">
                  <div className="flex gap-2 mb-2">
                    <Badge className="bg-purple-200 text-purple-900">{duty.dutyLevel}</Badge>
                    <Badge className="bg-purple-200 text-purple-900">{duty.dutyType}</Badge>
                  </div>
                  <p className="font-semibold text-gray-900">Assigned by: {duty.assignedBy}</p>
                  <p className="mt-1">{duty.roleDescription}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    {duty.creditHourExemption && (
                      <Badge className="bg-green-100 text-green-800">Credit Hour Exemption</Badge>
                    )}
                    {duty.extraAllowance && (
                      <Badge className="bg-blue-100 text-blue-800">Extra Allowance</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Attendance Data */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Attendance Summary (Past Month)</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-700">{attendance.present}</p>
              <p className="text-xs text-gray-600">Present</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <p className="text-2xl font-bold text-yellow-700">{attendance.late}</p>
              <p className="text-xs text-gray-600">Late</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <p className="text-2xl font-bold text-red-700">{attendance.absent}</p>
              <p className="text-xs text-gray-600">Absent</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-700">{attendance.total}</p>
              <p className="text-xs text-gray-600">Total Days</p>
            </div>
          </div>
        </Card>

        {/* Publications */}
        {publications.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Publications ({publications.length})</h3>
              <Badge variant="info" className="text-xs">
                Fall {currentYear} data from employee profile
              </Badge>
            </div>
            <div className="space-y-2">
              {publications.map((pub, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded text-sm">
                  <p className="font-semibold text-gray-900">{pub.title}</p>
                  <p className="text-xs text-gray-600">{pub.authors}</p>
                  <p className="text-xs text-gray-600">
                    {pub.journalName} ({pub.year})
                  </p>
                  {pub.hecCategory && <Badge className="mt-1">{pub.hecCategory}</Badge>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Achievement Assessment */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Achievement Assessment</h3>
          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat.key} className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900 mb-3">{cat.label}</p>
                <div className="space-y-2">
                  {Object.values(achievementLevels).map((level) => (
                    <label
                      key={level.value}
                      className="flex items-center gap-3 p-3 rounded border bg-white hover:bg-gray-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={assessment[cat.key] === level.value}
                        onChange={() => setAssessment({ ...assessment, [cat.key]: level.value })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{level.label}</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {level.marks} marks
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Meeting & Comments */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Appraisal Meeting</h3>
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 block">
              Meeting Date *
              <input
                type="date"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                required
              />
            </label>
            <label className="text-sm font-medium text-gray-700 block">
              Comments & Feedback
              <textarea
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Provide constructive feedback on the employee's performance..."
              />
            </label>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 border-t pt-4 mt-4">
          <Button
            onClick={handleSubmitAppraisal}
            disabled={submitting || !meetingDate}
            className="flex items-center gap-2 flex-1"
          >
            {submitting ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircleIcon className="w-4 h-4" />
            )}
            Submit Appraisal
          </Button>
          <Button variant="outline" className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </Card>
  );
}
