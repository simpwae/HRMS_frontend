import { useState, useMemo } from 'react';
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import FileUpload from '../../../components/FileUpload';
import FormField from '../../../components/FormField';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

/**
 * AttendanceCorrection - Employee portal for submitting attendance corrections
 * Employees can request corrections for missed check-ins, late arrivals, etc.
 * with supporting documentation
 */
export default function AttendanceCorrection() {
  const user = useAuthStore((s) => s.user);
  const dataStore = useDataStore();
  const {
    employees = [],
    attendance = [],
    attendanceCorrections = [],
    submitAttendanceCorrection,
  } = dataStore;

  const employee = useMemo(
    () => employees.find((e) => e.id === user?.id || e.email === user?.email),
    [employees, user],
  );
  const employeeId = employee?.id || user?.id;

  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    originalStatus: '',
    requestedStatus: '',
    reason: '',
    attachments: [],
  });
  const [formErrors, setFormErrors] = useState({});

  // Get employee's attendance
  const employeeAttendance = useMemo(
    () => attendance.filter((a) => a.employeeId === employeeId),
    [attendance, employeeId],
  );

  // Get employee's corrections
  const myCorrections = useMemo(
    () => attendanceCorrections.filter((c) => c.employeeId === employeeId),
    [attendanceCorrections, employeeId],
  );

  // Pending corrections
  const pendingCorrections = myCorrections.filter((c) => c.status === 'Pending');

  // Resolved corrections
  const resolvedCorrections = myCorrections.filter((c) => c.status !== 'Pending');

  const statusOptions = ['Present', 'Late', 'Absent', 'Approved Leave', 'Official Duty'];

  const getStatusBadgeVariant = (status) => {
    if (status === 'Present' || status === 'Approved Leave' || status === 'Official Duty')
      return 'success';
    if (status === 'Late') return 'warning';
    if (status === 'Absent') return 'error';
    return 'default';
  };

  const getCorrectionBadgeVariant = (status) => {
    if (status === 'Approved') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'Rejected') return 'error';
    return 'default';
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.date) errors.date = 'Date is required';
    if (!formData.originalStatus) errors.originalStatus = 'Current status is required';
    if (!formData.requestedStatus) errors.requestedStatus = 'Requested status is required';
    if (!formData.reason || formData.reason.trim().length < 10)
      errors.reason = 'Reason must be at least 10 characters';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCorrection = () => {
    if (!validateForm()) return;

    const originalAttendance = employeeAttendance.find((a) => a.date === formData.date);

    submitAttendanceCorrection(employeeId, {
      originalAttendance: {
        date: formData.date,
        status: formData.originalStatus,
        clockIn: originalAttendance?.clockIn || null,
        clockOut: originalAttendance?.clockOut || null,
      },
      requestedChange: {
        status: formData.requestedStatus,
      },
      reason: formData.reason,
      documents: formData.attachments,
    });

    // Reset form
    setFormData({
      date: '',
      originalStatus: '',
      requestedStatus: '',
      reason: '',
      attachments: [],
    });
    setShowNewRequestModal(false);
  };

  const handleAddAttachment = (file) => {
    setFormData((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        {
          id: `doc-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
        },
      ],
    }));
  };

  const handleRemoveAttachment = (docId) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== docId),
    }));
  };

  // Safety check - return early if critical data is missing
  if (!user) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-700">Please log in to view attendance corrections.</p>
        </Card>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-700">Unable to load employee information.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Corrections</h1>
          <p className="text-sm text-gray-600 mt-1">
            Submit corrections for missed check-ins or incorrect attendance records
          </p>
        </div>
        <Button
          onClick={() => setShowNewRequestModal(true)}
          icon={PlusIcon}
          className="bg-linear-to-r from-blue-600 to-blue-700"
        >
          New Correction Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
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

      {/* Pending Corrections */}
      {pendingCorrections.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h2>
          <div className="space-y-3">
            {pendingCorrections.map((correction) => (
              <div
                key={correction.id}
                className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-900">
                        {format(parseISO(correction.originalAttendance.date), 'MMM d, yyyy')}
                      </p>
                      <Badge variant="warning" size="sm">
                        {correction.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <span className="font-medium">Original:</span>{' '}
                        <Badge
                          variant={getStatusBadgeVariant(correction.originalAttendance.status)}
                        >
                          {correction.originalAttendance.status}
                        </Badge>
                      </p>
                      <p>
                        <span className="font-medium">Requested:</span>{' '}
                        <Badge variant={getStatusBadgeVariant(correction.requestedChange.status)}>
                          {correction.requestedChange.status}
                        </Badge>
                      </p>
                      <p>
                        <span className="font-medium">Reason:</span> {correction.reason}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Submitted: {format(parseISO(correction.submittedOn), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  {correction.documents && correction.documents.length > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">Supporting docs:</p>
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

      {/* Resolved Corrections */}
      {resolvedCorrections.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resolved Requests</h2>
          <div className="space-y-3">
            {resolvedCorrections.map((correction) => (
              <div
                key={correction.id}
                className={`border rounded-lg p-4 ${
                  correction.status === 'Approved'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-gray-900">
                        {format(parseISO(correction.originalAttendance.date), 'MMM d, yyyy')}
                      </p>
                      <Badge variant={getCorrectionBadgeVariant(correction.status)} size="sm">
                        {correction.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <span className="font-medium">Original:</span>{' '}
                        <Badge
                          variant={getStatusBadgeVariant(correction.originalAttendance.status)}
                        >
                          {correction.originalAttendance.status}
                        </Badge>
                      </p>
                      <p>
                        <span className="font-medium">Requested:</span>{' '}
                        <Badge variant={getStatusBadgeVariant(correction.requestedChange.status)}>
                          {correction.requestedChange.status}
                        </Badge>
                      </p>
                      {correction.audit?.length > 0 && (
                        <p className="text-gray-500 text-xs mt-2">
                          Reviewed by: {correction.audit[correction.audit.length - 1].by} on{' '}
                          {correction.audit[correction.audit.length - 1].date}
                          {correction.audit[correction.audit.length - 1].comment &&
                            `: ${correction.audit[correction.audit.length - 1].comment}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {correction.documents && correction.documents.length > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">Supporting docs:</p>
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

      {/* Empty State */}
      {myCorrections.length === 0 && (
        <Card className="p-12 text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No correction requests yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Submit a correction request if there's an error in your attendance record
          </p>
        </Card>
      )}

      {/* New Correction Request Modal */}
      <Modal
        open={showNewRequestModal}
        onClose={() => {
          setShowNewRequestModal(false);
          setFormData({
            date: '',
            originalStatus: '',
            requestedStatus: '',
            reason: '',
            attachments: [],
          });
          setFormErrors({});
        }}
        title="Submit Attendance Correction Request"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Date Selector */}
          <FormField label="Date of Attendance*" error={formErrors.date}>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, date: e.target.value }));
                setFormErrors((prev) => ({ ...prev, date: '' }));
              }}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.date && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Original Record:</span>{' '}
                  {employeeAttendance.find((a) => a.date === formData.date)?.status || 'No record'}{' '}
                  {employeeAttendance.find((a) => a.date === formData.date)?.clockIn &&
                    `(Check-in: ${employeeAttendance.find((a) => a.date === formData.date)?.clockIn})`}
                </p>
              </div>
            )}
          </FormField>

          {/* Original Status */}
          <FormField label="Current Status*" error={formErrors.originalStatus}>
            <select
              value={formData.originalStatus}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, originalStatus: e.target.value }));
                setFormErrors((prev) => ({ ...prev, originalStatus: '' }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select current status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormField>

          {/* Requested Status */}
          <FormField label="Requested Status*" error={formErrors.requestedStatus}>
            <select
              value={formData.requestedStatus}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, requestedStatus: e.target.value }));
                setFormErrors((prev) => ({ ...prev, requestedStatus: '' }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select requested status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormField>

          {/* Reason */}
          <FormField label="Reason for Correction*" error={formErrors.reason}>
            <textarea
              value={formData.reason}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, reason: e.target.value }));
                setFormErrors((prev) => ({ ...prev, reason: '' }));
              }}
              placeholder="Explain why this correction is needed. Minimum 10 characters."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.reason.length} / 10 characters minimum
            </p>
          </FormField>

          {/* Document Upload */}
          <FormField label="Supporting Documents (Optional)">
            <FileUpload
              onFilesSelected={(files) => {
                files.forEach((file) => handleAddAttachment(file));
              }}
              accept="image/*,.pdf,.doc,.docx"
              multiple
              className="border-2 border-dashed border-gray-300 rounded-lg p-4"
            />
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Attached Documents:</p>
                {formData.attachments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <DocumentTextIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {(doc.size / 1024).toFixed(1)} KB • {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAttachment(doc.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormField>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Note:</span> Your correction request will be reviewed
              by your HOD. Please provide accurate information and supporting documents if
              available. The review process typically takes 2-3 working days.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t">
          <Button
            onClick={() => {
              setShowNewRequestModal(false);
              setFormData({
                date: '',
                originalStatus: '',
                requestedStatus: '',
                reason: '',
                attachments: [],
              });
              setFormErrors({});
            }}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCorrection}
            className="flex-1 bg-linear-to-r from-blue-600 to-blue-700"
          >
            Submit Request
          </Button>
        </div>
      </Modal>
    </div>
  );
}
