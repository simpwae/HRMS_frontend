import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import FormField from '../../../components/FormField';
import {
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * AttendanceCorrections (HOD) - HOD portal for reviewing and approving
 * attendance correction requests from their department employees
 */
export default function AttendanceCorrections() {
  const user = useAuthStore((s) => s.user);
  const { employees, attendanceCorrections, getEmployeesByDepartment, reviewAttendanceCorrection } =
    useDataStore();

  const currentUser = useMemo(
    () => employees.find((e) => e.id === user?.id || e.email === user?.email),
    [employees, user],
  );

  const departmentEmployees = useMemo(
    () => getEmployeesByDepartment(currentUser?.department),
    [getEmployeesByDepartment, currentUser?.department],
  );

  const departmentEmployeeIds = departmentEmployees.map((e) => e.id);

  // Get corrections for department employees
  const departmentCorrections = useMemo(
    () => attendanceCorrections.filter((c) => departmentEmployeeIds.includes(c.employeeId)) || [],
    [attendanceCorrections, departmentEmployeeIds],
  );

  const pendingCorrections = departmentCorrections.filter((c) => c.status === 'Pending');
  const resolvedCorrections = departmentCorrections.filter((c) => c.status !== 'Pending');

  const [selectedCorrection, setSelectedCorrection] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    decision: '',
    comments: '',
  });
  const [reviewErrors, setReviewErrors] = useState({});

  const getEmployeeName = (employeeId) => {
    return employees.find((e) => e.id === employeeId)?.name || 'Unknown Employee';
  };

  const handleOpenReview = (correction) => {
    setSelectedCorrection(correction);
    setReviewForm({ decision: '', comments: '' });
    setReviewErrors({});
    setReviewModalOpen(true);
  };

  const validateReview = () => {
    const errors = {};
    if (!reviewForm.decision) errors.decision = 'Decision is required';
    if (!reviewForm.comments || reviewForm.comments.trim().length === 0)
      errors.comments = 'Comments are required';
    setReviewErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitReview = () => {
    if (!validateReview()) return;

    reviewAttendanceCorrection(selectedCorrection.id, {
      status: reviewForm.decision === 'approve' ? 'Approved' : 'Rejected',
      reviewer: currentUser?.name || 'HOD',
      notes: reviewForm.comments,
    });

    setReviewModalOpen(false);
    setSelectedCorrection(null);
    setReviewForm({ decision: '', comments: '' });
  };

  const getCorrectionStatusColor = (status) => {
    if (status === 'Pending') return 'bg-yellow-50 border-yellow-200';
    if (status === 'Approved') return 'bg-green-50 border-green-200';
    if (status === 'Rejected') return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getCorrectionStatusBadge = (status) => {
    if (status === 'Pending') return 'warning';
    if (status === 'Approved') return 'success';
    if (status === 'Rejected') return 'error';
    return 'default';
  };

  const getAttendanceStatusBadge = (status) => {
    if (status === 'Present' || status === 'Approved Leave' || status === 'Official Duty')
      return 'success';
    if (status === 'Late') return 'warning';
    if (status === 'Absent') return 'error';
    return 'default';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Corrections</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve attendance correction requests from your department
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <ChevronDownIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCorrections.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {resolvedCorrections.filter((c) => c.status === 'Approved').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {resolvedCorrections.filter((c) => c.status === 'Rejected').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Corrections Table */}
      {pendingCorrections.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Current Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Requested
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingCorrections.map((correction) => (
                  <tr key={correction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {getEmployeeName(correction.employeeId)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">
                        {format(parseISO(correction.originalAttendance.date), 'MMM d, yyyy')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={getAttendanceStatusBadge(correction.originalAttendance.status)}
                      >
                        {correction.originalAttendance.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getAttendanceStatusBadge(correction.requestedChange.status)}>
                        {correction.requestedChange.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700 max-w-xs truncate">{correction.reason}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">
                        {format(parseISO(correction.submittedOn), 'MMM d, yyyy h:mm a')}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        onClick={() => handleOpenReview(correction)}
                        variant="secondary"
                        size="sm"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No pending corrections to review</p>
        </Card>
      )}

      {/* Resolved Corrections */}
      {resolvedCorrections.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resolved Requests</h2>
          <div className="space-y-3">
            {resolvedCorrections.map((correction) => (
              <div
                key={correction.id}
                className={`border rounded-lg p-4 ${getCorrectionStatusColor(correction.status)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-900">
                        {getEmployeeName(correction.employeeId)}
                      </p>
                      <Badge variant={getCorrectionStatusBadge(correction.status)}>
                        {correction.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <span className="font-medium">Date:</span>{' '}
                        {format(parseISO(correction.originalAttendance.date), 'MMM d, yyyy')}
                      </p>
                      <p>
                        <span className="font-medium">Current:</span>{' '}
                        <Badge
                          variant={getAttendanceStatusBadge(correction.originalAttendance.status)}
                        >
                          {correction.originalAttendance.status}
                        </Badge>
                        {' → '}
                        <Badge
                          variant={getAttendanceStatusBadge(correction.requestedChange.status)}
                        >
                          {correction.requestedChange.status}
                        </Badge>
                      </p>
                      <p>
                        <span className="font-medium">Reason:</span> {correction.reason}
                      </p>
                      {correction.audit?.length > 1 && (
                        <p className="text-gray-500 text-xs mt-2">
                          <span className="font-medium">Reviewed:</span>{' '}
                          {correction.audit[correction.audit.length - 1].by} on{' '}
                          {correction.audit[correction.audit.length - 1].date}
                          {correction.audit[correction.audit.length - 1].comment &&
                            `: ${correction.audit[correction.audit.length - 1].comment}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {correction.documents?.length > 0 && (
                    <div className="shrink-0">
                      <p className="text-xs text-gray-600 mb-2">Supporting docs:</p>
                      <div className="space-y-1">
                        {correction.documents.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
                          >
                            <DocumentTextIcon className="w-3 h-3" />
                            {doc.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Review Modal */}
      <Modal
        open={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedCorrection(null);
          setReviewForm({ decision: '', comments: '' });
        }}
        title={`Review Correction Request - ${selectedCorrection ? getEmployeeName(selectedCorrection.employeeId) : ''}`}
        size="lg"
      >
        {selectedCorrection && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Correction Details */}
            <Card className="p-4 bg-gray-50 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Correction Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Date:</span>{' '}
                  <span className="text-gray-600">
                    {format(parseISO(selectedCorrection.originalAttendance.date), 'MMMM d, yyyy')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Employee:</span>{' '}
                  <span className="text-gray-600">
                    {getEmployeeName(selectedCorrection.employeeId)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Current Status:</span>{' '}
                  <Badge
                    variant={getAttendanceStatusBadge(selectedCorrection.originalAttendance.status)}
                  >
                    {selectedCorrection.originalAttendance.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Requested Status:</span>{' '}
                  <Badge
                    variant={getAttendanceStatusBadge(selectedCorrection.requestedChange.status)}
                  >
                    {selectedCorrection.requestedChange.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Reason:</span>
                  <p className="text-gray-600 mt-1">{selectedCorrection.reason}</p>
                </div>
                {selectedCorrection.documents?.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700 mb-2 block">
                      Supporting Documents:
                    </span>
                    <div className="space-y-1">
                      {selectedCorrection.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                        >
                          <DocumentTextIcon className="w-4 h-4" />
                          {doc.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Decision */}
            <FormField label="Decision*" error={reviewErrors.decision}>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="decision"
                    value="approve"
                    checked={reviewForm.decision === 'approve'}
                    onChange={(e) => {
                      setReviewForm((prev) => ({ ...prev, decision: e.target.value }));
                      setReviewErrors((prev) => ({ ...prev, decision: '' }));
                    }}
                    className="w-4 h-4"
                  />
                  <span>
                    <span className="font-medium text-green-700">Approve</span>
                    <p className="text-xs text-gray-600">Accept this correction request</p>
                  </span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="decision"
                    value="reject"
                    checked={reviewForm.decision === 'reject'}
                    onChange={(e) => {
                      setReviewForm((prev) => ({ ...prev, decision: e.target.value }));
                      setReviewErrors((prev) => ({ ...prev, decision: '' }));
                    }}
                    className="w-4 h-4"
                  />
                  <span>
                    <span className="font-medium text-red-700">Reject</span>
                    <p className="text-xs text-gray-600">Deny this correction request</p>
                  </span>
                </label>
              </div>
            </FormField>

            {/* Comments */}
            <FormField label="Comments*" error={reviewErrors.comments}>
              <textarea
                value={reviewForm.comments}
                onChange={(e) => {
                  setReviewForm((prev) => ({ ...prev, comments: e.target.value }));
                  setReviewErrors((prev) => ({ ...prev, comments: '' }));
                }}
                placeholder="Provide your review comments or reason for rejection..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-6 border-t">
          <Button
            onClick={() => {
              setReviewModalOpen(false);
              setSelectedCorrection(null);
              setReviewForm({ decision: '', comments: '' });
            }}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            icon={reviewForm.decision === 'approve' ? CheckIcon : XMarkIcon}
            className={`flex-1 ${
              reviewForm.decision === 'approve'
                ? 'bg-linear-to-r from-green-600 to-green-700'
                : 'bg-linear-to-r from-red-600 to-red-700'
            }`}
          >
            {reviewForm.decision === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
