import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useDataStore, faculties } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import EmptyState from '../../../components/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import InputWithIcon from '../../../components/InputWithIcon';
import {
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function HRPromotions() {
  const user = useAuthStore((s) => s.user);
  const { promotions, updatePromotionStatus, approvePromotion } = useDataStore();

  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newSalary, setNewSalary] = useState('');

  // Filter promotions
  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      // Status filter
      if (activeTab === 'pending' && p.status !== 'Pending') return false;
      if (activeTab === 'review' && p.status !== 'Under Review') return false;
      if (activeTab === 'completed' && !['Approved', 'Rejected'].includes(p.status)) return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (
          !p.employeeName?.toLowerCase().includes(search) &&
          !p.department?.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      // Department filter
      if (departmentFilter !== 'all' && p.department !== departmentFilter) return false;

      return true;
    });
  }, [promotions, activeTab, searchTerm, departmentFilter]);

  const handleAction = (promotion, type) => {
    setSelectedPromotion(promotion);
    setActionType(type);
    setShowActionModal(true);
    setReviewNotes('');
    setMeetingDate('');
    setEffectiveDate(promotion.effectiveDate || format(new Date(), 'yyyy-MM-dd'));
    setNewSalary(promotion.proposedSalary || promotion.currentSalary || promotion.salaryBase || '');
  };

  const handleSubmitAction = () => {
    if (!selectedPromotion) return;

    if (actionType === 'approve') {
      approvePromotion(selectedPromotion.id, {
        decidedBy: user?.name,
        notes: reviewNotes,
        newSalary: newSalary ? parseInt(newSalary, 10) : selectedPromotion.proposedSalary,
        effectiveDate,
      });
    } else if (actionType === 'reject') {
      updatePromotionStatus(selectedPromotion.id, 'Rejected', {
        type: 'hr',
        notes: reviewNotes,
        decidedBy: user?.name,
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }

    setShowActionModal(false);
    setSelectedPromotion(null);
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

  const allDepartments = Object.values(faculties).flat();

  const stats = {
    pending: promotions.filter((p) => p.status === 'Pending').length,
    underReview: promotions.filter((p) => p.status === 'Under Review').length,
    approved: promotions.filter((p) => p.status === 'Approved').length,
    rejected: promotions.filter((p) => p.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Promotion Management</h1>
        <p className="text-gray-600">Review and process promotion requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: stats.pending, color: 'amber', icon: ClockIcon },
          { label: 'Under Review', value: stats.underReview, color: 'blue', icon: UserGroupIcon },
          { label: 'Approved', value: stats.approved, color: 'green', icon: CheckCircleIcon },
          { label: 'Rejected', value: stats.rejected, color: 'red', icon: XCircleIcon },
        ].map((stat) => (
          <Card key={stat.label} className={`bg-${stat.color}-50 border-${stat.color}-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm text-${stat.color}-600`}>{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="review">Under Review ({stats.underReview})</TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({stats.approved + stats.rejected})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-3">
          <InputWithIcon
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
            inputClassName="pr-4 py-2 text-sm"
          />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Departments</option>
            {allDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Box for HR */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <UserGroupIcon className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
          <div>
            <p className="font-medium text-blue-900">Committee Meeting Scheduling</p>
            <p className="text-sm text-blue-700 mt-1">
              As HR, you can monitor promotion requests. Committee meeting scheduling is handled by
              the Dean, who serves as the convener for promotion reviews.
            </p>
          </div>
        </div>
      </Card>

      {/* Promotions List */}
      <Card>
        {filteredPromotions.length === 0 ? (
          <EmptyState
            icon={SparklesIcon}
            title="No Promotions Found"
            description={
              activeTab === 'pending'
                ? 'No pending promotion requests'
                : activeTab === 'review'
                  ? 'No promotions under review'
                  : 'No completed promotions'
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredPromotions.map((promotion) => (
              <div
                key={promotion.id}
                className="border rounded-xl p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Employee Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {promotion.employeeName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{promotion.employeeName}</h4>
                      <p className="text-sm text-gray-500">
                        {promotion.department} • {promotion.faculty}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-indigo-600">
                        <span>{promotion.currentDesignation}</span>
                        <ArrowUpIcon className="w-4 h-4" />
                        <span className="font-medium">{promotion.requestedDesignation}</span>
                        {promotion.proposedSalary && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                            Proposed Salary: {promotion.proposedSalary.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-sm text-gray-500">
                      <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                      {format(parseISO(promotion.appliedOn), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {promotion.yearsInService} years service
                    </div>
                    {getStatusBadge(promotion.status)}
                  </div>

                  {/* Actions */}
                  {promotion.status === 'Pending' && (
                    <div className="flex gap-2">
                      <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                        ℹ️ Committee scheduling is handled by Dean
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(promotion, 'reject')}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {promotion.status === 'Under Review' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAction(promotion, 'approve')}
                        className="bg-green-600 hover:bg-green-700 gap-1"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(promotion, 'reject')}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">{promotion.reason}</p>
                  {promotion.documents?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {promotion.documents.map((doc, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          📄 {doc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Committee Review Info */}
                {promotion.committeeReview && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Committee Meeting</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Scheduled: {promotion.committeeReview.meetingDate} by{' '}
                      {promotion.committeeReview.scheduledBy}
                    </p>
                    {promotion.committeeReview.notes && (
                      <p className="text-sm text-blue-600 mt-1">
                        {promotion.committeeReview.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={actionType === 'approve' ? 'Approve Promotion' : 'Reject Promotion'}
      >
        {selectedPromotion && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedPromotion.employeeName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedPromotion.currentDesignation} → {selectedPromotion.requestedDesignation}
              </p>
            </div>

            {actionType === 'approve' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Salary (PKR)
                  </label>
                  <input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 180000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder={
                  actionType === 'reject'
                    ? 'Please provide reason for rejection...'
                    : 'Add any notes...'
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowActionModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAction}
                className={
                  actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }
              >
                {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
