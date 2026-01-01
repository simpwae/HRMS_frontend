import { useState, useMemo } from 'react';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { format, parseISO, differenceInDays } from 'date-fns';
import InputWithIcon from '../../../components/InputWithIcon';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

export default function DeptLeaves() {
  const employees = useDataStore((s) => s.employees);
  const leaves = useDataStore((s) => s.leaves);
  const updateLeaveStatus = useDataStore((s) => s.updateLeaveStatus); // Use the correct approval chain function
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [comment, setComment] = useState('');

  // Get department employees
  const deptEmployees = useMemo(
    () => employees.filter((e) => e.department === user.department),
    [employees, user.department],
  );

  const deptEmployeeIds = useMemo(() => new Set(deptEmployees.map((e) => e.id)), [deptEmployees]);

  // Get department leaves
  const deptLeaves = useMemo(
    () =>
      leaves
        .filter((l) => deptEmployeeIds.has(l.employeeId))
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
    [leaves, employees, deptEmployeeIds],
  );

  // Filter leaves
  const filteredLeaves = useMemo(() => {
    return deptLeaves.filter((leave) => {
      if (activeTab !== 'all' && leave.status.toLowerCase() !== activeTab) {
        return false;
      }
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          leave.employee?.name?.toLowerCase().includes(search) ||
          leave.employee?.code?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [deptLeaves, activeTab, searchTerm]);

  // Statistics
  const stats = useMemo(
    () => ({
      total: deptLeaves.length,
      pending: deptLeaves.filter((l) => l.status === 'Pending').length,
      approved: deptLeaves.filter((l) => l.status === 'Approved').length,
      rejected: deptLeaves.filter((l) => l.status === 'Rejected').length,
    }),
    [deptLeaves],
  );

  const handleAction = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setComment('');
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!selectedLeave || !actionType) return;

    // For medical leaves, HOD just forwards to VC (no paid/unpaid split)
    updateLeaveStatus(
      selectedLeave.id,
      actionType === 'approve' ? 'Approved' : 'Rejected',
      'hod',
      user.name,
      comment || undefined,
    );

    setShowModal(false);
    setSelectedLeave(null);
    setActionType(null);
    setComment('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success">{status}</Badge>;
      case 'Rejected':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="warning">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Department Leave Requests</h2>
        <p className="text-gray-500 mt-1">Manage leave requests for {user.department}</p>
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
              <p className="text-xs text-gray-500">Total</p>
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
                ? 'bg-emerald-600 text-white'
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

      {/* Search & List */}
      <Card>
        <div className="mb-4">
          <InputWithIcon
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            inputClassName="pr-4 py-2 text-sm"
          />
        </div>

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
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white font-bold">
                      {leave.employee?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{leave.employee?.name}</h4>
                      <p className="text-sm text-gray-500">
                        {leave.employee?.code} • {leave.employee?.designation}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      {leave.type}
                    </span>
                    <span className="text-sm text-gray-600">
                      {leave.startDate ? format(parseISO(leave.startDate), 'MMM d') : 'N/A'} →{' '}
                      {leave.endDate ? format(parseISO(leave.endDate), 'MMM d, yyyy') : 'N/A'}
                      <span className="text-gray-400 ml-2">
                        ({leave.days} day{leave.days > 1 ? 's' : ''})
                      </span>
                    </span>
                    {getStatusBadge(leave.status)}
                  </div>

                  {leave.status === 'Pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(leave, 'approve')}
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(leave, 'reject')}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {leave.reason && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reason:</span> {leave.reason}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request`}
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedLeave.employee?.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedLeave.type} • {selectedLeave.days} day(s)
              </p>
              <p className="text-sm text-gray-500">
                {selectedLeave.startDate
                  ? format(parseISO(selectedLeave.startDate), 'MMM d')
                  : 'N/A'}{' '}
                -{' '}
                {selectedLeave.endDate
                  ? format(parseISO(selectedLeave.endDate), 'MMM d, yyyy')
                  : 'N/A'}
              </p>
            </div>

            {/* Medical Leave Info */}
            {selectedLeave.type === 'Medical' && actionType === 'approve' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  🏥 Medical Leave Approval Flow
                </p>
                <p className="text-sm text-blue-700">
                  After your approval, this request will be forwarded to:
                </p>
                <ol className="text-sm text-blue-700 mt-2 ml-4 list-decimal space-y-1">
                  <li>Vice Chancellor for recommendation</li>
                  <li>President for final approval and paid/unpaid classification</li>
                </ol>
              </div>
            )}

            {/* Documents Section */}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? selectedLeave.type === 'Medical'
                      ? 'Add recommendation for Vice Chancellor...'
                      : 'Add any notes...'
                    : 'Reason for rejection...'
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'approve' ? 'primary' : 'danger'}
                onClick={handleSubmit}
              >
                {actionType === 'approve' ? 'Approve & Forward' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
