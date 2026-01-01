import { useState, useMemo, useEffect } from 'react';
import { useDataStore, leaveTypes } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import InputWithIcon from '../../../components/InputWithIcon';
import Modal from '../../../components/Modal';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO, differenceInDays } from 'date-fns';

const TABS = [
  { id: 'all', label: 'All Requests' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

export default function FacultyLeaves() {
  const employees = useDataStore((s) => s.employees);
  const leaves = useDataStore((s) => s.leaves);
  const updateLeaveStatus = useDataStore((s) => s.updateLeaveStatus);
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('all');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [paidDays, setPaidDays] = useState(0);
  const [unpaidDays, setUnpaidDays] = useState(0);
  const [daysError, setDaysError] = useState('');

  // Get faculty employees
  const facultyEmployees = useMemo(
    () => employees.filter((e) => e.faculty === user.faculty),
    [employees, user.faculty],
  );

  const facultyEmployeeIds = useMemo(
    () => new Set(facultyEmployees.map((e) => e.id)),
    [facultyEmployees],
  );

  // Get faculty leaves with employee info
  const facultyLeaves = useMemo(
    () =>
      leaves
        .filter((l) => facultyEmployeeIds.has(l.employeeId))
        .map((leave) => ({
          ...leave,
          employee: employees.find((e) => e.id === leave.employeeId),
          days:
            leave.days ||
            (leave.startDate && leave.endDate
              ? differenceInDays(parseISO(leave.endDate), parseISO(leave.startDate)) + 1
              : 0),
        }))
        .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)),
    [leaves, employees, facultyEmployeeIds],
  );

  // Get unique leave types
  const leaveTypes = useMemo(
    () => [...new Set(facultyLeaves.map((l) => l.type))].sort(),
    [facultyLeaves],
  );

  // Filter leaves
  const filteredLeaves = useMemo(() => {
    return facultyLeaves.filter((leave) => {
      // Tab filter
      if (activeTab !== 'all' && leave.status.toLowerCase() !== activeTab) {
        return false;
      }
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = leave.employee?.name?.toLowerCase().includes(searchLower);
        const matchesCode = leave.employee?.code?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesCode) return false;
      }
      // Leave type filter
      if (selectedLeaveType !== 'all' && leave.type !== selectedLeaveType) {
        return false;
      }
      return true;
    });
  }, [facultyLeaves, activeTab, searchTerm, selectedLeaveType]);

  // Statistics
  const stats = useMemo(
    () => ({
      total: facultyLeaves.length,
      pending: facultyLeaves.filter((l) => l.status === 'Pending').length,
      approved: facultyLeaves.filter((l) => l.status === 'Approved').length,
      rejected: facultyLeaves.filter((l) => l.status === 'Rejected').length,
    }),
    [facultyLeaves],
  );

  const handleOpenApproval = (leave, action) => {
    setSelectedLeave(leave);
    setApprovalAction(action);
    setApprovalComment('');
    setPaidDays(leave.paidDays ?? leave.days ?? 0);
    setUnpaidDays(leave.unpaidDays ?? 0);
    setDaysError('');
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = () => {
    if (!selectedLeave || !approvalAction) return;

    // Validate paid/unpaid split for approvals
    if (approvalAction === 'approve') {
      const paid = Number(paidDays) || 0;
      const unpaid = Number(unpaidDays) || 0;
      const total = paid + unpaid;
      const requiredDays = selectedLeave.days || 0;

      if (total !== requiredDays) {
        setDaysError(
          `Days don't match: ${paid} + ${unpaid} = ${total}, but leave is ${requiredDays} days`,
        );
        return;
      }

      setDaysError('');
    }

    // Use the proper updateLeaveStatus function for approval chain
    if (approvalAction === 'approve') {
      // Call updateLeaveStatus with dean role and paid/unpaid metadata
      updateLeaveStatus(selectedLeave.id, 'Approved', 'dean', user.name, approvalComment, {
        paidDays: Number(paidDays) || 0,
        unpaidDays: Number(unpaidDays) || 0,
      });
    } else {
      // Rejection
      updateLeaveStatus(selectedLeave.id, 'Rejected', 'dean', user.name, approvalComment);
    }

    setShowApprovalModal(false);
    setSelectedLeave(null);
    setApprovalAction(null);
    setApprovalComment('');
    setPaidDays(0);
    setUnpaidDays(0);
    setDaysError('');
  };

  const getLeaveTypeName = (typeId) => {
    const type = leaveTypes.find((t) => t.id === typeId);
    return type ? type.name : typeId;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success">{status}</Badge>;
      case 'Rejected':
        return <Badge variant="danger">{status}</Badge>;
      case 'Pending':
        return <Badge variant="warning">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getLeaveTypeBadge = (type) => {
    const colors = {
      Annual: 'bg-blue-100 text-blue-700',
      Sick: 'bg-red-100 text-red-700',
      Casual: 'bg-purple-100 text-purple-700',
      Maternity: 'bg-pink-100 text-pink-700',
      Paternity: 'bg-cyan-100 text-cyan-700',
      Unpaid: 'bg-gray-100 text-gray-700',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Faculty Leave Requests</h2>
        <p className="text-gray-500 mt-1">Manage leave requests for {user.faculty}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <ClockIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
              <p className="text-xs text-gray-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <XCircleIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-xs text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {tab.id === 'pending' && stats.pending > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <InputWithIcon
              type="text"
              placeholder="Search by employee name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              inputClassName="pr-4 py-2 text-sm"
            />
          </div>
          <select
            value={selectedLeaveType}
            onChange={(e) => setSelectedLeaveType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Leave Types</option>
            {leaveTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Leave Requests List */}
        <div className="space-y-4">
          {filteredLeaves.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No leave requests found</p>
            </div>
          ) : (
            filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Employee Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {leave.employee?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{leave.employee?.name}</h4>
                      <p className="text-sm text-gray-500">
                        {leave.employee?.code} • {leave.employee?.department}
                      </p>
                    </div>
                  </div>

                  {/* Leave Details */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-sm">{getLeaveTypeBadge(leave.type)}</div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">
                        {leave.startDate ? format(parseISO(leave.startDate), 'MMM d') : 'N/A'}
                      </span>
                      <span className="mx-1">→</span>
                      <span className="font-medium">
                        {leave.endDate ? format(parseISO(leave.endDate), 'MMM d, yyyy') : 'N/A'}
                      </span>
                      <span className="text-gray-400 ml-2">
                        ({leave.days} day{leave.days > 1 ? 's' : ''})
                      </span>
                    </div>
                    {getStatusBadge(leave.status)}
                  </div>

                  {/* Actions */}
                  {leave.status === 'Pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenApproval(leave, 'approve')}
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenApproval(leave, 'reject')}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {/* Reason */}
                {leave.reason && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Reason: </span>
                      {leave.reason}
                    </p>
                  </div>
                )}

                {/* Review Info */}
                {leave.reviewedBy && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <UserIcon className="w-4 h-4" />
                    <span>
                      {leave.status} by {leave.reviewedBy}
                      {leave.reviewedOn &&
                        ` on ${format(parseISO(leave.reviewedOn), 'MMM d, yyyy')}`}
                    </span>
                    {leave.comments && (
                      <>
                        <ChatBubbleLeftRightIcon className="w-4 h-4 ml-2" />
                        <span>"{leave.comments}"</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title={`${approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Request`}
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {selectedLeave.employee?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedLeave.employee?.name}</p>
                  <p className="text-sm text-gray-500">{selectedLeave.employee?.department}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium">{selectedLeave.type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2 font-medium">{selectedLeave.days} day(s)</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Period:</span>
                  <span className="ml-2 font-medium">
                    {selectedLeave.startDate
                      ? format(parseISO(selectedLeave.startDate), 'MMM d')
                      : 'N/A'}{' '}
                    -{' '}
                    {selectedLeave.endDate
                      ? format(parseISO(selectedLeave.endDate), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Section */}
            {selectedLeave.documents && selectedLeave.documents.length > 0 && (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <DocumentIcon className="w-5 h-5 text-slate-600" />
                  <p className="font-semibold text-slate-900">Supporting Documents</p>
                </div>
                <div className="space-y-2">
                  {selectedLeave.documents.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <DocumentIcon className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                          <p className="text-xs text-slate-500">
                            {(doc.size / 1024).toFixed(1)} KB • Uploaded{' '}
                            {doc.uploadedAt
                              ? format(parseISO(doc.uploadedAt), 'MMM d, yyyy')
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = doc.file;
                          link.download = doc.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paid/Unpaid Split Section - ONLY for Medical Leaves and Approvals */}
            {approvalAction === 'approve' && selectedLeave.type === 'Medical' && (
              <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div>
                  <p className="font-semibold text-blue-900 mb-3">
                    🏥 Medical Leave - Classify Days as Paid or Unpaid
                  </p>
                  <p className="text-sm text-blue-700 mb-4">
                    Based on submitted medical documentation, classify the leave days:
                  </p>
                  <p className="text-sm text-blue-700 mb-4">
                    Total days to classify: <span className="font-bold">{selectedLeave.days}</span>
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid Days
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={selectedLeave.days}
                      value={paidDays}
                      onChange={(e) => {
                        const value = Number(e.target.value) || 0;
                        setPaidDays(value);
                        setDaysError('');
                      }}
                      className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white font-semibold text-green-700"
                      placeholder="0"
                    />
                    <p className="text-xs text-blue-600 mt-1">Employee receives full pay</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unpaid Days
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={selectedLeave.days}
                      value={unpaidDays}
                      onChange={(e) => {
                        const value = Number(e.target.value) || 0;
                        setUnpaidDays(value);
                        setDaysError('');
                      }}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-semibold text-amber-700"
                      placeholder="0"
                    />
                    <p className="text-xs text-blue-600 mt-1">Employee receives no pay</p>
                  </div>
                </div>

                {/* Dynamic Summary Display with Real-time Calculation */}
                {(() => {
                  const paid = Number(paidDays) || 0;
                  const unpaid = Number(unpaidDays) || 0;
                  const total = paid + unpaid;
                  const remaining = selectedLeave.days - total;
                  const isValid = total === selectedLeave.days;
                  const isOver = total > selectedLeave.days;

                  return (
                    <>
                      <div
                        className={`flex gap-3 p-4 rounded-lg border-2 transition-all ${
                          isValid
                            ? 'bg-green-50 border-green-300'
                            : isOver
                              ? 'bg-red-50 border-red-300'
                              : 'bg-yellow-50 border-yellow-300'
                        }`}
                      >
                        <div className="text-center flex-1">
                          <p className="text-2xl font-bold text-green-600">{paid}</p>
                          <p className="text-xs text-green-700 font-medium">PAID</p>
                        </div>
                        <div className="text-center text-3xl text-gray-400 font-bold">+</div>
                        <div className="text-center flex-1">
                          <p className="text-2xl font-bold text-amber-600">{unpaid}</p>
                          <p className="text-xs text-amber-700 font-medium">UNPAID</p>
                        </div>
                        <div className="text-center text-3xl text-gray-400 font-bold">=</div>
                        <div className="text-center flex-1">
                          <p
                            className={`text-2xl font-bold ${
                              isValid ? 'text-green-600' : isOver ? 'text-red-600' : 'text-gray-600'
                            }`}
                          >
                            {total}
                          </p>
                          <p className="text-xs text-gray-700 font-medium">
                            of {selectedLeave.days}
                          </p>
                        </div>
                      </div>

                      {/* Status Message */}
                      {remaining > 0 && (
                        <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
                          📊 You have <span className="font-bold">{remaining}</span> more day
                          {remaining > 1 ? 's' : ''} to classify
                        </div>
                      )}
                      {isOver && (
                        <div className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                          ❌ Total days exceed leave duration by{' '}
                          <span className="font-bold">{Math.abs(remaining)}</span> day
                          {Math.abs(remaining) > 1 ? 's' : ''}
                        </div>
                      )}
                      {isValid && (
                        <div className="text-sm text-green-700 bg-green-50 p-3 rounded border border-green-200">
                          ✅ Perfect! Days are correctly classified and ready for approval
                        </div>
                      )}
                    </>
                  );
                })()}

                {daysError && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    ⚠️ {daysError}
                  </p>
                )}
              </div>
            )}

            {/* For Non-Medical Leaves - Simple Approval */}
            {approvalAction === 'approve' && selectedLeave.type !== 'Medical' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  ℹ️ This is a standard leave request. No day classification required.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder={
                  approvalAction === 'approve' ? 'Add any notes...' : 'Reason for rejection...'
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowApprovalModal(false)}>
                Cancel
              </Button>
              <Button
                variant={approvalAction === 'approve' ? 'primary' : 'danger'}
                onClick={handleApprovalSubmit}
              >
                {approvalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
