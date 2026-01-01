import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import { useDataStore, promotionPath } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import FormField from '../../../components/FormField';
import EmptyState from '../../../components/EmptyState';
import {
  ArrowUpIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function Promotions() {
  const user = useAuthStore((s) => s.user);
  const { employees, promotions, addPromotion } = useDataStore();

  const employee = useMemo(
    () => employees.find((e) => e.id === user?.id || e.email === user?.email),
    [employees, user],
  );
  const employeeId = employee?.id || user?.id;

  const [showModal, setShowModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      effectiveDate: format(new Date(), 'yyyy-MM-dd'),
      expectedSalary: '',
    },
  });

  // Get next possible designation
  const nextDesignation = promotionPath[employee?.designation] || null;

  // Calculate years of service
  const yearsOfService = useMemo(() => {
    if (!employee?.joinDate) return 0;
    return Math.floor((new Date() - new Date(employee.joinDate)) / (365.25 * 24 * 60 * 60 * 1000));
  }, [employee?.joinDate]);

  // My promotion requests
  const myPromotions = useMemo(
    () =>
      promotions
        .filter((p) => p.employeeId === employeeId)
        .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)),
    [promotions, employeeId],
  );

  const pendingPromotion = myPromotions.find(
    (p) => p.status === 'Pending' || p.status === 'Under Review',
  );

  const onSubmit = (data) => {
    addPromotion({
      employeeId,
      requestedDesignation: nextDesignation,
      reason: data.reason,
      achievements: data.achievements,
      qualifications: data.qualifications,
      yearsInService: yearsOfService,
      effectiveDate: data.effectiveDate,
      proposedSalary: data.expectedSalary ? parseInt(data.expectedSalary, 10) : undefined,
      documents:
        data.documents
          ?.split(',')
          .map((d) => d.trim())
          .filter(Boolean) || [],
    });
    reset();
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    const variants = {
      Pending: 'warning',
      'Under Review': 'info',
      Approved: 'success',
      Rejected: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'Rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotion Requests</h1>
          <p className="text-gray-600">Apply for career advancement</p>
        </div>
        {nextDesignation && !pendingPromotion && (
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <PlusIcon className="w-5 h-5" />
            Request Promotion
          </Button>
        )}
      </div>

      {/* Current Status Card */}
      <Card className="bg-linear-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            <AcademicCapIcon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Current Position</h3>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              {employee?.designation || 'Not Available'}
            </p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <BriefcaseIcon className="w-4 h-4" />
                {employee?.department} Department
              </span>
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="w-4 h-4" />
                {yearsOfService} years of service
              </span>
            </div>
          </div>
          {nextDesignation && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Next Level</p>
              <div className="flex items-center gap-2 mt-1">
                <ArrowUpIcon className="w-5 h-5 text-green-500" />
                <span className="text-lg font-semibold text-green-600">{nextDesignation}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Pending Promotion Alert */}
      {pendingPromotion && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800">Promotion Request In Progress</h4>
              <p className="text-sm text-amber-700 mt-1">
                Your request for promotion to {pendingPromotion.requestedDesignation} is currently{' '}
                {pendingPromotion.status.toLowerCase()}. Applied on{' '}
                {format(parseISO(pendingPromotion.appliedOn), 'MMM d, yyyy')}.
              </p>
            </div>
            {getStatusBadge(pendingPromotion.status)}
          </div>
        </Card>
      )}

      {/* Promotion History */}
      <Card title="Promotion History" subtitle="Your career advancement journey">
        {myPromotions.length === 0 ? (
          <EmptyState
            icon={SparklesIcon}
            title="No Promotion Requests"
            description="You haven't applied for any promotions yet. Start your career advancement journey!"
          />
        ) : (
          <div className="space-y-4">
            {myPromotions.map((promotion) => (
              <div
                key={promotion.id}
                className="border rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedPromotion(promotion)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(promotion.status)}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {promotion.currentDesignation} → {promotion.requestedDesignation}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied on {format(parseISO(promotion.appliedOn), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{promotion.reason}</p>
                    </div>
                  </div>
                  {getStatusBadge(promotion.status)}
                </div>
                {promotion.committeeReview && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-gray-500 uppercase">Committee Review</p>
                    <p className="text-sm text-gray-600 mt-1">{promotion.committeeReview.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Apply Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Request Promotion"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Promotion Preview */}
          <div className="p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Position</p>
                <p className="font-semibold text-gray-900">{employee?.designation}</p>
              </div>
              <ArrowUpIcon className="w-6 h-6 text-indigo-500" />
              <div className="text-right">
                <p className="text-sm text-gray-500">Requested Position</p>
                <p className="font-semibold text-indigo-600">{nextDesignation}</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <FormField label="Reason for Promotion" error={errors.reason?.message} required>
            <textarea
              {...register('reason', {
                required: 'Please provide your reason for requesting promotion',
                minLength: { value: 50, message: 'Please provide at least 50 characters' },
              })}
              rows={4}
              placeholder="Explain why you believe you deserve this promotion..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </FormField>

          {/* Achievements */}
          <FormField label="Key Achievements" error={errors.achievements?.message} required>
            <textarea
              {...register('achievements', {
                required: 'Please list your key achievements',
              })}
              rows={3}
              placeholder="List your significant achievements, projects, and contributions..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </FormField>

          {/* Qualifications */}
          <FormField label="Additional Qualifications" error={errors.qualifications?.message}>
            <textarea
              {...register('qualifications')}
              rows={2}
              placeholder="Any new degrees, certifications, or training completed..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </FormField>

          {/* Documents */}
          <FormField label="Supporting Documents (comma separated)">
            <input
              {...register('documents')}
              type="text"
              placeholder="e.g., PhD Certificate, Research Papers, Performance Reviews"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </FormField>

          {/* Effective Date */}
          <FormField label="Effective Date" error={errors.effectiveDate?.message}>
            <input
              type="date"
              {...register('effectiveDate')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </FormField>

          {/* Expected Salary */}
          <FormField label="Expected Salary (PKR)" error={errors.expectedSalary?.message}>
            <input
              type="number"
              min={0}
              step="1000"
              {...register('expectedSalary')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional"
            />
          </FormField>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
            <p className="font-medium">Note:</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-blue-600">
              <li>Your request will be reviewed by a committee</li>
              <li>The process typically takes 2-4 weeks</li>
              <li>You may be called for an interview</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
        title="Promotion Request Details"
      >
        {selectedPromotion && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-500">Requested Promotion</p>
                <p className="font-semibold">
                  {selectedPromotion.currentDesignation} → {selectedPromotion.requestedDesignation}
                </p>
              </div>
              {getStatusBadge(selectedPromotion.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Applied On</p>
                <p className="font-medium">
                  {format(parseISO(selectedPromotion.appliedOn), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Years of Service</p>
                <p className="font-medium">{selectedPromotion.yearsInService} years</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Reason</p>
              <p className="text-sm text-gray-700">{selectedPromotion.reason}</p>
            </div>

            {selectedPromotion.achievements && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Achievements</p>
                <p className="text-sm text-gray-700">{selectedPromotion.achievements}</p>
              </div>
            )}

            {selectedPromotion.documents?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Supporting Documents</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPromotion.documents.map((doc, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedPromotion.committeeReview && (
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-medium text-blue-800">Committee Review</p>
                <p className="text-sm text-blue-700 mt-1">
                  {selectedPromotion.committeeReview.notes}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Reviewed on {selectedPromotion.committeeReview.date}
                </p>
              </div>
            )}

            {selectedPromotion.hrDecision && (
              <div
                className={`p-4 rounded-xl ${
                  selectedPromotion.status === 'Approved'
                    ? 'bg-green-50'
                    : selectedPromotion.status === 'Rejected'
                      ? 'bg-red-50'
                      : 'bg-gray-50'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    selectedPromotion.status === 'Approved'
                      ? 'text-green-800'
                      : selectedPromotion.status === 'Rejected'
                        ? 'text-red-800'
                        : 'text-gray-800'
                  }`}
                >
                  HR Decision
                </p>
                <p
                  className={`text-sm mt-1 ${
                    selectedPromotion.status === 'Approved'
                      ? 'text-green-700'
                      : selectedPromotion.status === 'Rejected'
                        ? 'text-red-700'
                        : 'text-gray-700'
                  }`}
                >
                  {selectedPromotion.hrDecision.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
