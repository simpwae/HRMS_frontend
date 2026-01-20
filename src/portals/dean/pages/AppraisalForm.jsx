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
  { key: 'teaching', label: 'Teaching Leadership' },
  { key: 'research', label: 'Research & Funding' },
  { key: 'fypSupervision', label: 'Project Supervision' },
  { key: 'service', label: 'Service & Engagement' },
];

export default function DeanAppraisalForm({ pamsId, employeeId, pamsData, onClose }) {
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
  const [assessmentComments, setAssessmentComments] = useState({
    teaching: '',
    research: '',
    fypSupervision: '',
    service: '',
  });
  const [meetingDate, setMeetingDate] = useState('');
  const [feedback, setFeedback] = useState('');
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
      deanReview: {
        status: 'dean-confirmed',
        meetingDate,
        comment: feedback,
        decidedAt: new Date().toISOString().split('T')[0],
        assessment,
        assessmentComments,
      },
      status: 'dean-confirmed',
    });
    setSubmitting(false);
    setSubmitted(true);

    setTimeout(() => {
      onClose?.();
    }, 2000);
  };

  if (!pams || !employee) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-96">
          <p className="text-gray-600">Loading appraisal form...</p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-96 text-center p-6">
          <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="font-semibold text-green-700">Appraisal Submitted Successfully</p>
          <p className="text-sm text-gray-600 mt-2">Redirecting...</p>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">HOD Appraisal Meeting Form</h2>
      </div>

      <div className="space-y-6">
        {/* HOD Info */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">HOD Information</h3>
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
              <p className="text-xs text-gray-500">Faculty</p>
              <p className="font-semibold text-gray-900">{employee.faculty}</p>
            </div>
          </div>
        </Card>

        {/* Submitted PAMS (Read-Only) */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">
            HOD PAMS Data (Period: {pams.period})
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Leadership Workload</p>
              <div className="mt-2 p-3 bg-gray-50 rounded border text-sm text-gray-700 space-y-2">
                <p>
                  <strong>Teaching Leadership:</strong> {pams.workload?.teachingLoad}
                </p>
                <p>
                  <strong>Project Oversight:</strong> {pams.workload?.projectSupervision}
                </p>
                <p>
                  <strong>Faculty Advisory:</strong> {pams.workload?.advisory}
                </p>
                <p>
                  <strong>Administrative:</strong> {pams.workload?.admin}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Performance Achievements</p>
              <div className="mt-2 p-3 bg-gray-50 rounded border text-sm text-gray-700 space-y-2">
                <p>
                  <strong>Teaching Leadership:</strong> {pams.rubric?.teaching}
                </p>
                <p>
                  <strong>Research & Funding:</strong> {pams.rubric?.research}
                </p>
                <p>
                  <strong>Service & Engagement:</strong> {pams.rubric?.service}
                </p>
              </div>
            </div>
          </div>
        </Card>

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
              <h3 className="font-semibold text-gray-900">
                Research Publications ({publications.length})
              </h3>
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

        {/* Research Grants */}
        {researchGrants.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                Research Grants ({researchGrants.length})
              </h3>
              <Badge variant="info" className="text-xs">
                Fall {currentYear} data from employee profile
              </Badge>
            </div>
            <div className="space-y-2">
              {researchGrants.map((grant, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{grant.period}</Badge>
                    {grant.outcome && (
                      <Badge
                        variant={
                          grant.outcome === 'approved' || grant.outcome === 'awarded'
                            ? 'success'
                            : grant.outcome === 'rejected'
                              ? 'destructive'
                              : 'info'
                        }
                      >
                        {grant.outcome}
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">{grant.grantName}</p>
                  <p className="text-xs text-gray-600">Agency: {grant.fundingAgency}</p>
                  <p className="text-xs text-gray-600">
                    Amount: PKR {Number(grant.amount).toLocaleString()}
                  </p>
                  {grant.amountObtained && (
                    <p className="text-xs text-gray-600">
                      Amount Obtained: PKR {Number(grant.amountObtained).toLocaleString()}
                    </p>
                  )}
                  {grant.approvedDate && (
                    <p className="text-xs text-gray-600">Approved: {grant.approvedDate}</p>
                  )}
                  <p className="text-xs text-gray-600">Status: {grant.status}</p>
                  {grant.notes && (
                    <p className="text-xs text-gray-600 mt-1">Notes: {grant.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* FYP & Thesis Supervisions */}
        {(fypSupervisions.length > 0 || thesisSupervisions.length > 0) && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Project & Thesis Supervisions</h3>
              <Badge variant="info" className="text-xs">
                Fall {currentYear} data from employee profile
              </Badge>
            </div>
            <div className="space-y-4">
              {fypSupervisions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    FYP Supervised ({fypSupervisions.length})
                  </p>
                  {fypSupervisions.map((fyp, idx) => (
                    <div key={idx} className="text-xs text-gray-600 p-2 bg-blue-50 rounded mb-1">
                      <Badge className="mb-1">{fyp.period}</Badge>
                      <p className="font-semibold">{fyp.projectTitle}</p>
                      <p>
                        Students: {fyp.studentNames} • Status: {fyp.status}
                      </p>
                      {fyp.numberOfStudents && <p>Number of Students: {fyp.numberOfStudents}</p>}
                      {fyp.awards && <p className="mt-1">Awards: {fyp.awards}</p>}
                      {fyp.technicalPapers && <p>Technical Papers: {fyp.technicalPapers}</p>}
                      {fyp.productsDevloped && <p>Products: {fyp.productsDevloped}</p>}
                      {fyp.prototypeCompleted && (
                        <p>Prototype/Feasibility: {fyp.prototypeCompleted}</p>
                      )}
                      {fyp.otherInfo && <p>Other Info: {fyp.otherInfo}</p>}
                    </div>
                  ))}
                </div>
              )}
              {thesisSupervisions.length > 0 && (
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
            </div>
          </Card>
        )}

        {/* Achievement Assessment */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">HOD Performance Assessment & Review</h3>
          <p className="text-sm text-gray-600 mb-4">
            Review what the HOD submitted and their HOD review, then mark your assessment
          </p>
          <div className="space-y-6">
            {categories.map((cat) => {
              // Map category keys to HOD submission data
              const categoryData = {
                teaching: {
                  submitted: pams.rubric?.teaching,
                  hodAssessment: pams.hodReview?.assessment?.teaching,
                  hodComments: pams.hodReview?.assessmentComments?.teaching,
                  profile: (
                    <div className="space-y-1">
                      {publications.length > 0 && (
                        <p className="text-xs text-gray-600">
                          📚 {publications.length} publication(s)
                        </p>
                      )}
                      {pams.workload?.teachingLoad && (
                        <p className="text-xs text-gray-600">
                          📖 Workload: {pams.workload.teachingLoad}
                        </p>
                      )}
                    </div>
                  ),
                },
                research: {
                  submitted: pams.rubric?.research,
                  hodAssessment: pams.hodReview?.assessment?.research,
                  hodComments: pams.hodReview?.assessmentComments?.research,
                  profile: (
                    <div className="space-y-1">
                      {publications.length > 0 && (
                        <p className="text-xs text-gray-600">
                          📄 {publications.length} publication(s) this period
                        </p>
                      )}
                      {researchGrants.length > 0 && (
                        <p className="text-xs text-gray-600">
                          💰 {researchGrants.length} research grant(s)
                        </p>
                      )}
                    </div>
                  ),
                },
                fypSupervision: {
                  submitted: pams.workload?.projectSupervision,
                  hodAssessment: pams.hodReview?.assessment?.fypSupervision,
                  hodComments: pams.hodReview?.assessmentComments?.fypSupervision,
                  profile: (
                    <div className="space-y-1">
                      {fypSupervisions.length > 0 && (
                        <p className="text-xs text-gray-600">
                          🎓 {fypSupervisions.length} FYP(s) supervised
                        </p>
                      )}
                      {thesisSupervisions.length > 0 && (
                        <p className="text-xs text-gray-600">
                          📖 {thesisSupervisions.length} thesis/theses supervised
                        </p>
                      )}
                    </div>
                  ),
                },
                service: {
                  submitted: pams.rubric?.service,
                  hodAssessment: pams.hodReview?.assessment?.service,
                  hodComments: pams.hodReview?.assessmentComments?.service,
                  profile: (
                    <div className="space-y-1">
                      {pams.workload?.admin && (
                        <p className="text-xs text-gray-600">⚙️ Admin: {pams.workload.admin}</p>
                      )}
                      {adminDuties.length > 0 && (
                        <p className="text-xs text-gray-600">
                          📋 {adminDuties.length} admin duty/duties
                        </p>
                      )}
                    </div>
                  ),
                },
              };

              const data = categoryData[cat.key] || {};
              const hodLevel = data.hodAssessment ? achievementLevels[data.hodAssessment] : null;

              return (
                <div key={cat.key} className="border-2 rounded-lg p-4 bg-white">
                  <p className="text-base font-bold text-gray-900 mb-3">{cat.label}</p>

                  {/* What HOD Submitted */}
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs font-semibold text-blue-900 mb-1">HOD Submission:</p>
                    <p className="text-sm text-gray-800 whitespace-pre-line">
                      {data.submitted || 'No submission provided'}
                    </p>
                    {data.profile && (
                      <div className="mt-2 pt-2 border-t border-blue-200">{data.profile}</div>
                    )}
                  </div>

                  {/* HOD's Assessment */}
                  {pams.hodReview && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs font-semibold text-green-900 mb-1">HOD Assessment:</p>
                      {hodLevel && (
                        <p className="text-sm font-semibold text-gray-800">
                          {hodLevel.label} ({hodLevel.marks} marks)
                        </p>
                      )}
                      {data.hodComments && (
                        <p className="text-sm text-gray-700 mt-1">{data.hodComments}</p>
                      )}
                    </div>
                  )}

                  {/* Dean Assessment Selection */}
                  <p className="text-sm font-semibold text-gray-700 mb-2">Your Assessment:</p>
                  <div className="space-y-2 mb-3">
                    {Object.values(achievementLevels).map((level) => (
                      <label
                        key={level.value}
                        className="flex items-center gap-3 p-3 rounded border bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={assessment[cat.key] === level.value}
                          onChange={() => setAssessment({ ...assessment, [cat.key]: level.value })}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{level.label}</span>
                          <span className="text-sm font-semibold text-indigo-600">
                            {level.marks} marks
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Comments */}
                  <label className="text-sm font-medium text-gray-700 block">
                    Your Comments:
                    <textarea
                      rows={2}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={assessmentComments[cat.key]}
                      onChange={(e) =>
                        setAssessmentComments({ ...assessmentComments, [cat.key]: e.target.value })
                      }
                      placeholder={`Add specific feedback about ${cat.label.toLowerCase()} performance...`}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Meeting & Feedback */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Appraisal Meeting</h3>
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 block">
              Meeting Date *
              <input
                type="date"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                required
              />
            </label>
            <label className="text-sm font-medium text-gray-700 block">
              Dean's Feedback
              <textarea
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide strategic feedback on department's performance and leadership..."
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
            Submit Assessment
          </Button>
          <Button variant="outline" className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </Card>
  );
}
