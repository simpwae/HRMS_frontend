import { useMemo } from 'react';
import { useDataStore } from '../../../state/data';
import Card from '../../../components/Card';
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import InputWithIcon from '../../../components/InputWithIcon';
import { format, parseISO } from 'date-fns';
import { useAuthStore } from '../../../state/auth';
import { useState } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import DocumentIcon from '../../../components/DocumentIcon';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

export default function Analytics() {
  const { leaves, employees } = useDataStore();
  const analytics = useMemo(() => {
    const medicalLeaves = leaves.filter((l) => l.type === 'medical');
    const vcReviewed = medicalLeaves.filter((l) => {
      const vcStep = l.approvalChain?.find((s) => s.role === 'vc');
      return vcStep && vcStep.status !== 'pending';
    });
    const approvalRate =
      vcReviewed.length > 0
        ? (vcReviewed.filter(
            (l) => l.approvalChain.find((s) => s.role === 'vc')?.status === 'approved',
          ).length /
            vcReviewed.length) *
          100
        : 0;
    return {
      totalMedical: medicalLeaves.length,
      reviewed: vcReviewed.length,
      approvalRate: approvalRate.toFixed(1),
      avgProcessingDays: 2.5, // Mock data
    };
  }, [leaves]);
  const filtered = useMemo(() => {
    return leaves
      .filter((l) => l.type === 'medical')
      .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
  }, [leaves]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState('');
  const [comment, setComment] = useState('');

  const user = useAuthStore((s) => s.user);

  const TABS = [
    { id: 'pending', label: 'Pending Review', color: 'amber' },
    { id: 'approved', label: 'Recommended', color: 'emerald' },
    { id: 'rejected', label: 'Ejected', color: 'rose' },
    { id: 'all', label: 'All', color: 'blue' },
  ];

  const handleAction = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
  };

  const closeModal = () => {
    setSelectedLeave(null);
    setActionType('');
    setComment('');
  };

  const submitAction = () => {
    if (!selectedLeave || !actionType) return;
    if (actionType === 'reject' && !comment.trim()) return;

    // Call the API or perform the action here

    closeModal();
  };

  const statusBadge = (status) => {
    if (status === 'approved') return <Badge variant="success">Recommended</Badge>;
    if (status === 'rejected') return <Badge variant="danger">Rejected</Badge>;
    return <Badge variant="warning">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-linear-to-r from-indigo-600 to-blue-600 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <DocumentIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Medical Leave Reviews</h1>
            <p className="text-indigo-100 mt-1">Review and recommend medical leaves to President</p>
          </div>
        </div>
      </Card>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DocumentIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalMedical}</p>
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-700">Pending Review</p>
              <p className="text-2xl font-bold text-amber-900">{analytics.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-emerald-700">Recommended</p>
              <p className="text-2xl font-bold text-emerald-900">{analytics.reviewed}</p>
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <XCircleIcon className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-rose-700">Rejected</p>
              <p className="text-2xl font-bold text-rose-900">{analytics.rejected}</p>
            </div>
          </div>
        </Card>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:shadow-sm'
            }`}
          >
            {t.label}
            {t.id !== 'all' && analytics[t.id] > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === t.id ? 'bg-white/20' : 'bg-gray-100'
                }`}
              >
                {analytics[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Search & Filter */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <InputWithIcon
              type="text"
              placeholder="Search by employee name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              inputClassName="pr-4 py-2.5"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <FunnelIcon className="w-5 h-5" /> Filters
          </Button>
        </div>
      </Card>
      {/* Leave Requests List */}
      <Card>
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No medical leave requests found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm ? 'Try adjusting your search' : 'All requests are processed'}
              </p>
            </div>
          ) : (
            filtered.map((leave) => {
              const vcStep = leave.approvalChain?.find((s) => s.role === 'vc');
              const hodStep = leave.approvalChain?.find((s) => s.role === 'hod');
              return (
                <div
                  key={leave.id}
                  className="p-5 border border-gray-200 rounded-xl bg-linear-to-r from-white to-gray-50 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Employee Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-600 to-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                        {leave.employee?.name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate text-lg">
                          {leave.employee?.name || leave.employeeName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <UserCircleIcon className="w-4 h-4" />
                          {leave.employee?.code || leave.employeeCode} •{' '}
                          {leave.employee?.department || leave.department}
                        </p>
                      </div>
                    </div>
                    {/* Leave Details */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1.5 rounded-lg bg-teal-100 text-teal-700 text-xs font-bold">
                        Medical Leave
                      </span>
                      <div className="text-sm">
                        {leave.startDate && leave.endDate ? (
                          <p className="font-semibold text-gray-700">
                            {format(parseISO(leave.startDate), 'MMM d')} →{' '}
                            {format(parseISO(leave.endDate), 'MMM d, yyyy')}
                          </p>
                        ) : (
                          <p className="text-gray-500">Dates N/A</p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">
                          {leave.days} day{leave.days > 1 ? 's' : ''}
                        </p>
                      </div>
                      {statusBadge(vcStep?.status)}
                    </div>
                    {/* Actions */}
                    {vcStep?.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAction(leave, 'approve')}
                          className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          Recommend
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(leave, 'reject')}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                  {/* Reason */}
                  {leave.reason && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Reason:</span> {leave.reason}
                      </p>
                    </div>
                  )}
                  {/* HOD Comment */}
                  {hodStep?.comment && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                        <UserCircleIcon className="w-4 h-4" /> HOD's Recommendation:
                      </p>
                      <p className="text-sm text-blue-800">{hodStep.comment}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        by {hodStep.by} on{' '}
                        {hodStep.date && format(parseISO(hodStep.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                  {/* VC Comment (if reviewed) */}
                  {vcStep?.comment && vcStep.status !== 'pending' && (
                    <div
                      className={`mt-3 p-3 rounded-lg border ${
                        vcStep.status === 'approved'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-rose-50 border-rose-200'
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold mb-1 ${
                          vcStep.status === 'approved' ? 'text-emerald-900' : 'text-rose-900'
                        }`}
                      >
                        Your {vcStep.status === 'approved' ? 'Recommendation' : 'Rejection'}:
                      </p>
                      <p
                        className={`text-sm ${
                          vcStep.status === 'approved' ? 'text-emerald-800' : 'text-rose-800'
                        }`}
                      >
                        {vcStep.comment}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          vcStep.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        on {vcStep.date && format(parseISO(vcStep.date), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                  {/* Documents */}
                  {leave.documents && leave.documents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {leave.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                        >
                          <DocumentIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">{doc.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
      {/* Action Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={closeModal}
        title={actionType === 'approve' ? '✅ Recommend Medical Leave' : '❌ Reject Medical Leave'}
      >
        {selectedLeave && (
          <div className="space-y-4">
            {/* Employee Info */}
            <div className="p-4 bg-linear-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                  {selectedLeave.employee?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-bold text-indigo-900">
                    {selectedLeave.employee?.name || selectedLeave.employeeName}
                  </p>
                  <p className="text-sm text-indigo-700">
                    {selectedLeave.employee?.department || selectedLeave.department} •{' '}
                    {selectedLeave.employee?.code || selectedLeave.employeeCode}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-indigo-200">
                <p className="text-sm text-indigo-900">
                  <span className="font-semibold">Duration:</span>{' '}
                  {selectedLeave.startDate && format(parseISO(selectedLeave.startDate), 'MMM dd')} →{' '}
                  {selectedLeave.endDate && format(parseISO(selectedLeave.endDate), 'MMM dd, yyyy')}{' '}
                  ({selectedLeave.days} days)
                </p>
              </div>
            </div>
            {/* Comment Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                {actionType === 'approve'
                  ? '💬 Recommendation Note (Optional)'
                  : '⚠️ Rejection Reason (Required)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none"
                placeholder={
                  actionType === 'approve'
                    ? 'Add your recommendation notes for the President (optional)...'
                    : 'Provide a clear reason for rejection (required)...'
                }
                required={actionType === 'reject'}
              />
              <p className="text-xs text-gray-500 mt-1">
                {actionType === 'approve'
                  ? 'This will be forwarded to the President for final decision'
                  : 'Employee will be notified of the rejection reason'}
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={submitAction}
                className={
                  actionType === 'approve'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-rose-600 text-white hover:bg-rose-700'
                }
                disabled={actionType === 'reject' && !comment.trim()}
              >
                {actionType === 'approve' ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" /> Recommend to President
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-5 h-5" /> Confirm Rejection
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
