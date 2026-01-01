import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import {
  useDataStore,
  leaveTypes,
  specialLeaveTypes,
  validateMaternityEligibility,
  validateAdvanceNotice,
  sendLeaveNotification,
} from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import FileUpload from '../../../components/FileUpload';
import FormField from '../../../components/FormField';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import {
  DocumentTextIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export default function Leave() {
  const user = useAuthStore((s) => s.user);
  const { employees, leaves, addLeave, getLeaveRecommendations } = useDataStore();

  const employee = useMemo(
    () => employees.find((e) => e.id === user?.id || e.email === user?.email),
    [employees, user],
  );
  const employeeId = employee?.id || user?.id;

  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [leaveCategory, setLeaveCategory] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      type: 'annual',
      startDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      reason: '',
      expectedDeliveryDate: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const selectedType = watch('type');

  const isDocumentRequired = selectedType === 'medical' || selectedType === 'study';
  const uploadLabel =
    selectedType === 'medical'
      ? 'Medical Documents'
      : selectedType === 'study'
        ? 'Study Documents'
        : 'Supporting Documents (optional)';
  const uploadHelper =
    selectedType === 'medical'
      ? "Upload medical certificates, prescriptions, or doctor's reports (PDF, DOC, DOCX, JPG)"
      : selectedType === 'study'
        ? 'Upload course details, admission letters, or study plans (PDF, DOC, DOCX, JPG)'
        : 'Upload any supporting documents if applicable (PDF, DOC, DOCX, JPG)';

  // Calculate days
  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const days = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
    return days > 0 ? days : 0;
  }, [startDate, endDate]);

  // safer balance lookup with fallback to leave type days
  const getAvailableBalance = (type) => {
    const lt = leaveTypes.find((t) => t.id === type);
    const fallback = lt?.days ?? lt?.defaultDays ?? 0;
    return employee?.leaveBalance?.[type] ?? fallback;
  };

  // Leave balance (show all known types)
  const leaveBalance = useMemo(() => {
    const acc = {};
    leaveTypes.forEach((lt) => {
      acc[lt.id] = getAvailableBalance(lt.id);
    });
    return acc;
  }, [employee]);

  // Check if enough balance (allow medical using fallback days)
  const hasEnoughBalance = useMemo(() => {
    const balance = getAvailableBalance(selectedType);
    return calculatedDays <= balance;
  }, [selectedType, calculatedDays, getAvailableBalance]);

  // Check maternity leave eligibility
  const maternityEligibility = useMemo(() => {
    return validateMaternityEligibility(employee);
  }, [employee]);

  const canApplyMaternity = maternityEligibility.eligible;

  // Get leave recommendations
  const leaveRecommendation = useMemo(() => {
    if (!startDate || !endDate) return null;
    return getLeaveRecommendations({
      employeeId,
      type: selectedType,
      startDate,
      endDate,
      days: calculatedDays,
    });
  }, [startDate, endDate, selectedType, calculatedDays, employeeId, getLeaveRecommendations]);

  // My leaves
  const myLeaves = useMemo(
    () =>
      leaves
        .filter((l) => l.employeeId === employeeId)
        .sort((a, b) => parseISO(b.appliedOn) - parseISO(a.appliedOn)),
    [leaves, employeeId],
  );

  const pendingLeaves = myLeaves.filter((l) => l.status === 'Pending');
  const approvedLeaves = myLeaves.filter((l) => l.status === 'Approved');
  const rejectedLeaves = myLeaves.filter((l) => l.status === 'Rejected');

  const handleDownload = (doc) => {
    const blobUrl = doc?.file ? URL.createObjectURL(doc.file) : doc?.fileUrl || doc?.url;
    if (!blobUrl) return;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = doc?.name || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (doc?.file) URL.revokeObjectURL(blobUrl);
  };

  const onSubmit = (data) => {
    // Maternity leave comprehensive eligibility check
    if (data.type === 'maternity') {
      if (!canApplyMaternity) {
        alert(`Maternity Leave Eligibility Issue:\n\n${maternityEligibility.reason}`);
        return;
      }

      // Validate expected delivery date
      if (!data.expectedDeliveryDate) {
        alert('Please enter your expected delivery date');
        return;
      }

      // Validate 60-day advance notice
      const advanceNoticeCheck = validateAdvanceNotice(
        data.expectedDeliveryDate,
        format(new Date(), 'yyyy-MM-dd'),
      );
      if (!advanceNoticeCheck.valid) {
        alert(`Maternity Leave - Advance Notice Requirement:\n\n${advanceNoticeCheck.reason}`);
        return;
      }
    }

    // Medical leave document requirement
    if ((data.type === 'medical' || data.type === 'study') && uploadedFiles.length === 0) {
      alert(`Please upload supporting documents for ${data.type} leave`);
      return;
    }

    const isMedical = data.type === 'medical';

    const newLeave = {
      id: `l-${Date.now()}`,
      employeeId: employeeId,
      employeeName: employee?.name || user?.name,
      department: employee?.department || user?.department,
      faculty: employee?.faculty || user?.faculty,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      days: calculatedDays,
      reason: data.reason,
      documents: uploadedFiles,
      leaveCategory: leaveCategory,
      status: 'Pending',
      appliedOn: format(new Date(), 'yyyy-MM-dd'),
      approvalChain: isMedical
        ? [
            { role: 'hod', status: 'pending', by: null, date: null, comment: null },
            { role: 'vc', status: 'pending', by: null, date: null, comment: null },
            { role: 'president', status: 'pending', by: null, date: null, comment: null },
          ]
        : [
            { role: 'hod', status: 'pending', by: null, date: null, comment: null },
            { role: 'dean', status: 'pending', by: null, date: null, comment: null },
            { role: 'hr', status: 'pending', by: null, date: null, comment: null },
          ],
      paidDays: null,
      unpaidDays: null,
    };

    addLeave(newLeave);

    // Send email notifications to all employees except current user
    sendLeaveNotification(
      {
        employeeName: employee?.name || user?.name,
        leaveType: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        days: calculatedDays,
        reason: data.reason,
        status: 'Pending',
      },
      user?.email,
    );

    reset();
    setUploadedFiles([]);
    setLeaveCategory(null);
    setShowModal(false);
  };

  const getBadgeVariant = (status) => {
    if (status === 'Approved') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'Rejected') return 'error';
    return 'info';
  };

  const getLeaveTypeName = (typeId) => {
    return leaveTypes.find((lt) => lt.id === typeId)?.name || typeId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Apply for leave and track your requests</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <PlusIcon className="w-5 h-5" />
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {leaveTypes.map((lt) => {
          const days = leaveBalance[lt.id];
          const maxDays = lt.days ?? lt.defaultDays ?? days ?? 0;
          const usedDays = Math.max(0, maxDays - days);

          return (
            <Card key={lt.id} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8">
                <div
                  className={`w-full h-full rounded-full opacity-10 ${
                    lt.id === 'annual'
                      ? 'bg-blue-500'
                      : lt.id === 'sick'
                        ? 'bg-red-500'
                        : 'bg-green-500'
                  }`}
                />
              </div>
              <div className="relative">
                <p className="text-sm font-medium text-gray-500 capitalize">{lt.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{days}</p>
                <p className="text-xs text-gray-500 mt-1">of {maxDays} days remaining</p>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      days > maxDays * 0.5
                        ? 'bg-green-500'
                        : days > maxDays * 0.2
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${(days / maxDays) * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
        <Card className="bg-gray-50 border-dashed border-2">
          <div className="flex flex-col items-center justify-center h-full text-center py-2">
            <DocumentTextIcon className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{myLeaves.length}</p>
          </div>
        </Card>
      </div>

      {/* Leave Requests */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Requests ({myLeaves.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingLeaves.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedLeaves.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedLeaves.length})</TabsTrigger>
        </TabsList>

        {['all', 'pending', 'approved', 'rejected'].map((tab) => {
          const filteredLeaves =
            tab === 'all'
              ? myLeaves
              : tab === 'pending'
                ? pendingLeaves
                : tab === 'approved'
                  ? approvedLeaves
                  : rejectedLeaves;

          return (
            <TabsContent key={tab} value={tab}>
              <Card>
                {filteredLeaves.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No {tab === 'all' ? '' : tab} leave requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLeaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="border rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedLeave(leave)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {getLeaveTypeName(leave.type)}
                              </h4>
                              <Badge variant={getBadgeVariant(leave.status)}>{leave.status}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                {format(parseISO(leave.startDate), 'MMM d')} -{' '}
                                {format(parseISO(leave.endDate), 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {leave.days} day{leave.days > 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                              {leave.reason}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            Applied {format(parseISO(leave.appliedOn), 'MMM d, yyyy')}
                          </div>
                        </div>

                        {/* Approval Chain */}
                        {leave.approvalChain && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                              Approval Status
                            </p>
                            <div className="flex items-center gap-2">
                              {leave.approvalChain.map((step, idx) => (
                                <div key={idx} className="flex items-center">
                                  <div
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                      step.status === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : step.status === 'rejected'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {step.status === 'approved' ? (
                                      <CheckCircleIcon className="w-3.5 h-3.5" />
                                    ) : step.status === 'rejected' ? (
                                      <XCircleIcon className="w-3.5 h-3.5" />
                                    ) : (
                                      <ClockIcon className="w-3.5 h-3.5" />
                                    )}
                                    <span className="uppercase">{step.role}</span>
                                  </div>
                                  {idx < leave.approvalChain.length - 1 && (
                                    <div className="w-4 h-0.5 bg-gray-200 mx-1" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setUploadedFiles([]);
          setLeaveCategory(null);
        }}
        title="Apply for Leave"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Maternity Leave Warning */}
          {selectedType === 'maternity' && !canApplyMaternity && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Not Eligible for Maternity Leave</p>
                <p className="text-sm text-red-700 mt-1">{maternityEligibility.reason}</p>
              </div>
            </div>
          )}

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('type', { required: 'Please select a leave type' })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <optgroup label="Regular Leaves">
                {leaveTypes.map((lt) => {
                  // Hide maternity leave from non-female employees, disable for ineligible females
                  const isMaternitityLeave = lt.id === 'maternity';
                  const isHidden =
                    isMaternitityLeave && employee?.gender?.toLowerCase() !== 'female';
                  const isDisabled = isMaternitityLeave && !canApplyMaternity;

                  if (isHidden) return null;

                  return (
                    <option key={lt.id} value={lt.id} disabled={isDisabled}>
                      {lt.name} ({leaveBalance[lt.id] || 0} days available)
                      {isDisabled ? ' - Not eligible' : ''}
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="Special Leaves">
                {specialLeaveTypes.map((sl) => (
                  <option key={sl.id} value={sl.id}>
                    {sl.name} ({sl.days} days)
                  </option>
                ))}
              </optgroup>
            </select>
            {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
          </div>

          {/* Date Range */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('endDate', { required: 'End date is required' })}
                min={startDate || format(new Date(), 'yyyy-MM-dd')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {calculatedDays > 0 && (
            <div className={`p-3 rounded-lg ${hasEnoughBalance ? 'bg-blue-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${hasEnoughBalance ? 'text-blue-700' : 'text-red-700'}`}>
                  Total Duration
                </span>
                <span
                  className={`font-semibold ${hasEnoughBalance ? 'text-blue-900' : 'text-red-900'}`}
                >
                  {calculatedDays} day{calculatedDays > 1 ? 's' : ''}
                </span>
              </div>
              {!hasEnoughBalance && (
                <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Insufficient leave balance
                </div>
              )}
            </div>
          )}

          {/* Leave Recommendations */}
          {leaveRecommendation && (
            <div
              className={`p-3 rounded-lg border flex gap-3 ${
                leaveRecommendation.recommended
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <InformationCircleIcon
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  leaveRecommendation.recommended ? 'text-green-600' : 'text-yellow-600'
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {leaveRecommendation.recommendation}
                </p>
                {leaveRecommendation.details && leaveRecommendation.details.length > 0 && (
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    {leaveRecommendation.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="shrink-0">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Medical Leave - guidance and category */}
          {selectedType === 'medical' && (
            <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Medical Leave Requirements</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Upload supporting medical documents; HR will review and categorize this as
                    medical or unpaid leave.
                  </p>
                </div>
              </div>

              <FormField label="Requested Leave Category">
                <select
                  value={leaveCategory || ''}
                  onChange={(e) => setLeaveCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category (HR will finalize)</option>
                  <option value="medical">Medical Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </FormField>
            </div>
          )}

          {/* Study Leave - guidance */}
          {selectedType === 'study' && (
            <div className="space-y-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <InformationCircleIcon className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Study Leave Documentation</p>
                  <p className="text-sm text-green-700 mt-1">
                    Upload supporting documents such as course enrollment letters, admission
                    documents, or study plans. Documents are required for study leave.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Universal File Upload - always visible */}
          <div className="space-y-2">
            <FileUpload
              value={uploadedFiles}
              onChange={setUploadedFiles}
              label={uploadLabel}
              required={isDocumentRequired}
              helper={
                isDocumentRequired
                  ? `${uploadHelper} (required for ${selectedType} leave)`
                  : `${uploadHelper}`
              }
              allowedTypes={['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']}
              maxFiles={5}
              maxSizeMB={10}
            />
            {isDocumentRequired && (
              <p className="text-xs text-red-600">
                Documents are required for {selectedType} leave.
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('reason', {
                required: 'Please provide a reason',
                minLength: { value: 10, message: 'Reason must be at least 10 characters' },
              })}
              rows={3}
              placeholder="Please provide a reason for your leave request..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.reason && <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>}
          </div>

          {/* Maternity Leave - Expected Delivery Date */}
          {selectedType === 'maternity' && (
            <div className="space-y-3 bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="flex gap-3">
                <InformationCircleIcon className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-pink-900">Maternity Leave Information</p>
                  <p className="text-sm text-pink-700 mt-1">
                    You are entitled to 30 days of paid maternity leave. Applications must be
                    submitted at least 2 months (60 days) before your expected delivery date.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('expectedDeliveryDate', {
                    required: 'Expected delivery date is required for maternity leave',
                  })}
                  min={format(addDays(new Date(), 60), 'yyyy-MM-dd')}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.expectedDeliveryDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.expectedDeliveryDate.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 60 days from today (
                  {format(addDays(new Date(), 60), 'MMM d, yyyy')})
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!hasEnoughBalance || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Leave Detail Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
        title="Leave Request Details"
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={getBadgeVariant(selectedLeave.status)} size="lg">
                {selectedLeave.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Leave Type</p>
                <p className="font-medium">{getLeaveTypeName(selectedLeave.type)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Duration</p>
                <p className="font-medium">
                  {selectedLeave.days} day{selectedLeave.days > 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">From</p>
                <p className="font-medium">
                  {format(parseISO(selectedLeave.startDate), 'MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">To</p>
                <p className="font-medium">
                  {format(parseISO(selectedLeave.endDate), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Reason</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedLeave.reason}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Applied On</p>
              <p className="font-medium">
                {format(parseISO(selectedLeave.appliedOn), 'MMMM d, yyyy')}
              </p>
            </div>

            {(selectedLeave.paidDays !== null || selectedLeave.unpaidDays !== null) && (
              <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                {selectedLeave.paidDays !== null && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Paid Days</p>
                    <p className="font-medium text-green-700">{selectedLeave.paidDays}</p>
                  </div>
                )}
                {selectedLeave.unpaidDays !== null && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Unpaid Days</p>
                    <p className="font-medium text-amber-700">{selectedLeave.unpaidDays}</p>
                  </div>
                )}
              </div>
            )}

            {/* Uploaded Documents */}
            {selectedLeave.documents && selectedLeave.documents.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" /> Supporting Documents
                </p>
                <div className="space-y-2">
                  {selectedLeave.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <DocumentTextIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          {doc.size && (
                            <p className="text-xs text-gray-500">
                              {(doc.size / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors ml-2"
                        title="Download document"
                        type="button"
                        onClick={() => handleDownload(doc)}
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLeave.approvalChain && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Approval Chain</p>
                <div className="space-y-2">
                  {selectedLeave.approvalChain.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {step.status === 'approved' ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : step.status === 'rejected' ? (
                          <XCircleIcon className="w-5 h-5 text-red-500" />
                        ) : (
                          <ClockIcon className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="font-medium uppercase">{step.role}</span>
                      </div>
                      <span
                        className={`text-sm capitalize ${
                          step.status === 'approved'
                            ? 'text-green-600'
                            : step.status === 'rejected'
                              ? 'text-red-600'
                              : 'text-gray-500'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedLeave(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
