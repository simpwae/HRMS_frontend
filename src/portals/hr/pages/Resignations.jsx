import { useState, useMemo } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
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
  ArrowRightOnRectangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  UserMinusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function HRResignations() {
  const user = useAuthStore((s) => s.user);
  const { resignations, employees, updateResignationStatus, processResignation } = useDataStore();

  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [comments, setComments] = useState('');

  // Filter resignations
  const filteredResignations = useMemo(() => {
    return resignations.filter((r) => {
      // Status filter
      if (activeTab === 'pending' && r.status !== 'Pending') return false;
      if (activeTab === 'approved' && r.status !== 'Approved') return false;
      if (activeTab === 'completed' && r.status !== 'Completed') return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (
          !r.employeeName?.toLowerCase().includes(search) &&
          !r.department?.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      // Department filter
      if (departmentFilter !== 'all' && r.department !== departmentFilter) return false;

      return true;
    });
  }, [resignations, activeTab, searchTerm, departmentFilter]);

  const handleAction = (resignation, type) => {
    setSelectedResignation(resignation);
    setActionType(type);
    setShowActionModal(true);
    setComments('');
  };

  const handleSubmitAction = () => {
    if (!selectedResignation) return;

    if (actionType === 'approve') {
      updateResignationStatus(selectedResignation.id, 'Approved', {
        hrApproval: {
          approvedBy: user?.name,
          date: format(new Date(), 'yyyy-MM-dd'),
          comments,
        },
      });
    } else if (actionType === 'reject') {
      updateResignationStatus(selectedResignation.id, 'Rejected', {
        hrApproval: {
          rejectedBy: user?.name,
          date: format(new Date(), 'yyyy-MM-dd'),
          comments,
        },
      });
    } else if (actionType === 'process') {
      processResignation(selectedResignation.id);
    }

    setShowActionModal(false);
    setSelectedResignation(null);
  };

  const getStatusBadge = (status) => {
    const variants = {
      Pending: 'warning',
      Approved: 'info',
      Completed: 'success',
      Rejected: 'error',
      Withdrawn: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getDaysRemaining = (lastWorkingDate) => {
    const days = differenceInDays(parseISO(lastWorkingDate), new Date());
    return days > 0 ? days : 0;
  };

  const allDepartments = Object.values(faculties).flat();

  const stats = {
    pending: resignations.filter((r) => r.status === 'Pending').length,
    approved: resignations.filter((r) => r.status === 'Approved').length,
    completed: resignations.filter((r) => r.status === 'Completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resignation Management</h1>
        <p className="text-gray-600">Process employee resignations and exit procedures</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: stats.pending, color: 'amber', icon: ClockIcon },
          {
            label: 'In Process',
            value: stats.approved,
            color: 'blue',
            icon: ArrowRightOnRectangleIcon,
          },
          { label: 'Completed', value: stats.completed, color: 'green', icon: CheckCircleIcon },
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
            <TabsTrigger value="approved">In Process ({stats.approved})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
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

      {/* Resignations List */}
      <Card>
        {filteredResignations.length === 0 ? (
          <EmptyState
            icon={UserMinusIcon}
            title="No Resignations Found"
            description={
              activeTab === 'pending'
                ? 'No pending resignation requests'
                : activeTab === 'approved'
                  ? 'No resignations in process'
                  : 'No completed resignations'
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredResignations.map((resignation) => (
              <div
                key={resignation.id}
                className="border rounded-xl p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Employee Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-400 to-orange-400 flex items-center justify-center text-white font-bold">
                      {resignation.employeeName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{resignation.employeeName}</h4>
                      <p className="text-sm text-gray-500">
                        {resignation.designation} • {resignation.department}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Reason: {resignation.reason}</p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Applied:</span>{' '}
                      {format(parseISO(resignation.appliedOn), 'MMM d')}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Last Day:</span>{' '}
                      <span className="font-medium text-red-600">
                        {format(parseISO(resignation.lastWorkingDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {resignation.status === 'Approved' && (
                      <div className="px-3 py-1 bg-amber-100 rounded-full text-sm text-amber-700">
                        {getDaysRemaining(resignation.lastWorkingDate)} days left
                      </div>
                    )}
                    {getStatusBadge(resignation.status)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedResignation(resignation);
                        setShowDetailsModal(true);
                      }}
                    >
                      View Details
                    </Button>
                    {resignation.status === 'Pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAction(resignation, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(resignation, 'reject')}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {resignation.status === 'Approved' && resignation.exitSurvey && (
                      <Button
                        size="sm"
                        onClick={() => handleAction(resignation, 'process')}
                        className="gap-1"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Complete Exit
                      </Button>
                    )}
                  </div>
                </div>

                {/* Exit Survey Status */}
                <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    {resignation.exitSurvey ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">Exit Survey</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {resignation.handoverStatus === 'completed' ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">Handover</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {resignation.status === 'Completed' ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">Clearance</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={
          actionType === 'approve'
            ? 'Approve Resignation'
            : actionType === 'reject'
              ? 'Reject Resignation'
              : 'Complete Exit Process'
        }
      >
        {selectedResignation && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedResignation.employeeName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedResignation.designation} • {selectedResignation.department}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Last Working Day:{' '}
                {format(parseISO(selectedResignation.lastWorkingDate), 'MMM d, yyyy')}
              </p>
            </div>

            {actionType === 'process' && (
              <div className="p-4 bg-amber-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Confirm Exit Completion</p>
                    <p className="text-sm text-amber-700 mt-1">
                      This will move the employee to ex-employee records and remove them from active
                      employees. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {actionType !== 'process' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  placeholder={
                    actionType === 'reject' ? 'Reason for rejection...' : 'Add any notes...'
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowActionModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAction}
                className={
                  actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : ''
                }
              >
                {actionType === 'approve'
                  ? 'Approve Resignation'
                  : actionType === 'reject'
                    ? 'Reject Request'
                    : 'Complete Exit'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Resignation Details"
        size="lg"
      >
        {selectedResignation && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-red-400 to-orange-400 flex items-center justify-center text-white text-2xl font-bold">
                {selectedResignation.employeeName?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedResignation.employeeName}</h3>
                <p className="text-gray-500">
                  {selectedResignation.designation} • {selectedResignation.department}
                </p>
              </div>
              {getStatusBadge(selectedResignation.status)}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Applied On</p>
                <p className="font-medium">
                  {format(parseISO(selectedResignation.appliedOn), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last Working Day</p>
                <p className="font-medium text-red-600">
                  {format(parseISO(selectedResignation.lastWorkingDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Notice Period</p>
                <p className="font-medium">{selectedResignation.noticePeriod} days</p>
              </div>
              <div>
                <p className="text-gray-500">Reason</p>
                <p className="font-medium">{selectedResignation.reason}</p>
              </div>
            </div>

            {selectedResignation.detailedReason && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Detailed Explanation</p>
                <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                  {selectedResignation.detailedReason}
                </p>
              </div>
            )}

            {/* Exit Survey */}
            {selectedResignation.exitSurvey && (
              <div className="border rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-500" />
                  Exit Survey Responses
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Primary Reason</p>
                    <p className="font-medium">{selectedResignation.exitSurvey.reason}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Job Satisfaction</p>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                            i <= selectedResignation.exitSurvey.satisfaction
                              ? 'bg-yellow-400 text-white'
                              : 'bg-gray-200'
                          }`}
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500">Would Recommend</p>
                    <p className="font-medium">
                      {selectedResignation.exitSurvey.wouldRecommend ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Would Return</p>
                    <p className="font-medium">
                      {selectedResignation.exitSurvey.wouldReturn ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>
                </div>
                {selectedResignation.exitSurvey.feedback && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">Feedback</p>
                    <p className="text-sm text-gray-700">
                      {selectedResignation.exitSurvey.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
