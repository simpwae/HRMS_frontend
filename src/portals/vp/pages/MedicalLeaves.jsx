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
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Recommended' },
  { id: 'rejected', label: 'Rejected' },
];

export default function MedicalLeaves() {
  const employees = useDataStore((s) => s.employees);
  const leaves = useDataStore((s) => s.leaves);
  const updateLeaveStatus = useDataStore((s) => s.updateLeaveStatus);
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [comment, setComment] = useState('');
  const [paidDays, setPaidDays] = useState(0);
  const [unpaidDays, setUnpaidDays] = useState(0);
  const [leaveCategory, setLeaveCategory] = useState(null);
  const [daysError, setDaysError] = useState('');

  // Get only medical leaves
  const medicalLeaves = useMemo(
    () =>
      leaves
        .filter((l) => l.type === 'medical')
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
    [leaves, employees],
  );

  // Filter leaves for President/VP approval (shared portal)
  const filteredLeaves = useMemo(() => {
    return medicalLeaves.filter((leave) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = leave.employee?.name?.toLowerCase().includes(searchLower);
        const matchesCode = leave.employee?.code?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesCode) return false;
      }

      // Check President approval status (VP acts as President)
      const presidentStep = leave.approvalChain?.find((s) => s.role === 'president');
      if (!presidentStep) return false;

      // Tab filter
      if (activeTab === 'pending') return presidentStep.status === 'pending';
      if (activeTab === 'approved') return presidentStep.status === 'approved';
      if (activeTab === 'rejected') return presidentStep.status === 'rejected';

      return false;
    });
  }, [medicalLeaves, activeTab, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const allMedicalLeaves = medicalLeaves.filter((l) =>
      l.approvalChain?.some((s) => s.role === 'president'),
    );
    return {
      total: allMedicalLeaves.length,
      pending: allMedicalLeaves.filter(
        (l) => l.approvalChain?.find((s) => s.role === 'president')?.status === 'pending',
      ).length,
      approved: allMedicalLeaves.filter(
        (l) => l.approvalChain?.find((s) => s.role === 'president')?.status === 'approved',
      ).length,
      rejected: allMedicalLeaves.filter(
        (l) => l.approvalChain?.find((s) => s.role === 'president')?.status === 'rejected',
      ).length,
    };
  }, [medicalLeaves]);

  const handleAction = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setComment('');
    setPaidDays(leave.days || 0);
    setUnpaidDays(0);
    setLeaveCategory(null);
    setDaysError('');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!selectedLeave || !actionType) {
      console.log('Missing selectedLeave or actionType');
      return;
    }

    // For approval, validate paid/unpaid split and category
    if (actionType === 'approve') {
      const paid = Number(paidDays) || 0;
      const unpaid = Number(unpaidDays) || 0;
      const total = paid + unpaid;
      const requiredDays = selectedLeave.days || 0;

      console.log('Validation:', { paid, unpaid, total, requiredDays, leaveCategory });

      // Validate paid/unpaid split
      if (total !== requiredDays) {
        const errorMsg = `Days don't match: ${paid} + ${unpaid} = ${total}, but leave is ${requiredDays} days`;
        console.log('Days validation failed:', errorMsg);
        setDaysError(errorMsg);
        return;
      }

      // Validate categorization
      if (!leaveCategory) {
        const errorMsg =
          'Please select a classification for this medical leave (Paid Medical or Unpaid Medical)';
        console.log('Category validation failed');
        setDaysError(errorMsg);
        return;
      }

      console.log('Validation passed, updating leave status');
      setDaysError('');

      updateLeaveStatus(
        selectedLeave.id,
        'Approved',
        'president',
        user.name,
        comment || undefined,
        {
          paidDays: paid,
          unpaidDays: unpaid,
          leaveCategory: leaveCategory,
        },
      );
    } else {
      // For rejection, no need for paid/unpaid split
      console.log('Rejecting leave');
      updateLeaveStatus(selectedLeave.id, 'Rejected', 'president', user.name, comment || undefined);
    }

    setShowModal(false);
    setSelectedLeave(null);
    setActionType(null);
    setComment('');
    setPaidDays(0);
    setUnpaidDays(0);
    setLeaveCategory(null);
    setDaysError('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Recommended</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Medical Leave Requests - Final Approval
        </h2>
        <p className="text-gray-500 mt-1">
          Review, classify, and approve medical leave applications with paid/unpaid split
        </p>
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
              <p className="text-xs text-gray-500">Recommended</p>
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

      {/* Search & List */}
      <Card>
        <div className="mb-4">
          <InputWithIcon
            type="text"
            placeholder="Search by employee name or code..."
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
              <p className="text-gray-500">No medical leave requests found</p>
            </div>
          ) : (
            filteredLeaves.map((leave) => {
              const vcStep = leave.approvalChain?.find((s) => s.role === 'president');
              const hodStep = leave.approvalChain?.find((s) => s.role === 'hod');

              return (
                <div
                  key={leave.id}
                  className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

                    <div className="flex flex-wrap items-center gap-4">
                      <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-medium">
                        Medical Leave
                      </span>
                      <span className="text-sm text-gray-600">
                        {leave.startDate ? format(parseISO(leave.startDate), 'MMM d') : 'N/A'} →{' '}
                        {leave.endDate ? format(parseISO(leave.endDate), 'MMM d, yyyy') : 'N/A'}
                        <span className="text-gray-400 ml-2">
                          ({leave.days} day{leave.days > 1 ? 's' : ''})
                        </span>
                      </span>
                      {getStatusBadge(vcStep?.status)}
                    </div>

                    {vcStep?.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(leave, 'approve')}
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          Recommend
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
                        <span className="font-medium text-gray-700">Reason: </span>
                        {leave.reason}
                      </p>
                    </div>
                  )}

                  {hodStep && hodStep.comment && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">HOD Recommendation: </span>
                        {hodStep.comment}
                      </p>
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
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${actionType === 'approve' ? 'Recommend' : 'Reject'} Medical Leave Request`}
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
                  <span className="ml-2 font-medium">Medical Leave</span>
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

            {/* Documents Section */}
            {selectedLeave.documents && selectedLeave.documents.length > 0 && (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <DocumentIcon className="w-5 h-5 text-slate-600" />
                  <p className="font-semibold text-slate-900">Medical Documents</p>
                </div>
                <div className="space-y-2">
                  {selectedLeave.documents.map((doc, index) => (
                    <div
                      key={doc.id || index}
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

            {/* HOD Recommendation */}
            {selectedLeave.approvalChain?.find((s) => s.role === 'hod')?.comment && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">HOD Recommendation:</p>
                <p className="text-sm text-blue-700">
                  {selectedLeave.approvalChain.find((s) => s.role === 'hod').comment}
                </p>
              </div>
            )}

            {/* VC Recommendation */}
            {selectedLeave.approvalChain?.find((s) => s.role === 'vc')?.comment && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">VC Recommendation:</p>
                <p className="text-sm text-blue-700">
                  {selectedLeave.approvalChain.find((s) => s.role === 'vc').comment}
                </p>
              </div>
            )}

            {/* Paid/Unpaid Split Section - Only for Approval */}
            {actionType === 'approve' && (
              <div className="space-y-4 bg-linear-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-300 rounded-xl p-5 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                    <DocumentIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-purple-900 text-lg">
                      🏥 Final Medical Leave Decision
                    </p>
                    <p className="text-sm text-purple-700">
                      Classify days and categorize this medical leave
                    </p>
                  </div>
                </div>

                {/* Step 1: Paid/Unpaid Classification */}
                <div className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-sm">
                  <p className="font-bold text-purple-900 mb-1">Step 1: Classify Leave Days</p>
                  <p className="text-sm text-purple-700 mb-3">
                    Total days to classify:{' '}
                    <span className="font-bold text-lg">{selectedLeave.days}</span> days
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        💚 Paid Days
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={selectedLeave.days}
                        value={paidDays}
                        onChange={(e) => {
                          setPaidDays(e.target.value);
                          setDaysError('');
                        }}
                        className="w-full px-3 py-2 border-2 border-green-300 rounded-lg text-lg font-bold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50"
                        placeholder="0"
                      />
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        ✓ Employee receives full salary
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        🧡 Unpaid Days
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={selectedLeave.days}
                        value={unpaidDays}
                        onChange={(e) => {
                          setUnpaidDays(e.target.value);
                          setDaysError('');
                        }}
                        className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg text-lg font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50"
                        placeholder="0"
                      />
                      <p className="text-xs text-amber-600 mt-1 font-medium">
                        ⚠️ No salary for these days
                      </p>
                    </div>
                  </div>

                  {/* Days Calculation Display */}
                  {(() => {
                    const paid = Number(paidDays) || 0;
                    const unpaid = Number(unpaidDays) || 0;
                    const total = paid + unpaid;
                    const isValid = total === selectedLeave.days;
                    const isOver = total > selectedLeave.days;

                    return (
                      <div
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          isValid
                            ? 'bg-linear-to-r from-green-50 to-emerald-50 border-green-400'
                            : isOver
                              ? 'bg-linear-to-r from-red-50 to-rose-50 border-red-400'
                              : 'bg-linear-to-r from-yellow-50 to-amber-50 border-yellow-400'
                        }`}
                      >
                        <div className="text-center flex-1">
                          <p className="text-2xl font-bold text-green-600">{paid}</p>
                          <p className="text-xs text-green-700 font-bold uppercase">Paid</p>
                        </div>
                        <div className="text-3xl text-gray-300 font-bold">+</div>
                        <div className="text-center flex-1">
                          <p className="text-2xl font-bold text-amber-600">{unpaid}</p>
                          <p className="text-xs text-amber-700 font-bold uppercase">Unpaid</p>
                        </div>
                        <div className="text-3xl text-gray-300 font-bold">=</div>
                        <div className="text-center flex-1">
                          <p
                            className={`text-2xl font-bold ${
                              isValid
                                ? 'text-green-600'
                                : isOver
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                            }`}
                          >
                            {total}
                          </p>
                          <p className="text-xs text-gray-700 font-bold uppercase">
                            of {selectedLeave.days}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {daysError && (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-2 mt-2">
                      <p className="text-sm text-red-700 font-semibold">⚠️ {daysError}</p>
                    </div>
                  )}
                </div>

                {/* Step 2: Medical Leave Category */}
                <div className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-sm">
                  <p className="font-bold text-purple-900 mb-1">
                    Step 2: Final Medical Leave Category
                  </p>
                  <p className="text-sm text-purple-700 mb-3">
                    Based on submitted medical documentation and paid days allocation:
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLeaveCategory('medical')}
                      className={`group p-4 rounded-lg border-2 transition-all text-left ${
                        leaveCategory === 'medical'
                          ? 'border-green-500 bg-linear-to-br from-green-50 to-emerald-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            leaveCategory === 'medical' ? 'bg-green-500' : 'bg-gray-100'
                          }`}
                        >
                          <CheckCircleIcon
                            className={`w-5 h-5 ${leaveCategory === 'medical' ? 'text-white' : 'text-gray-400'}`}
                          />
                        </div>
                        <p className="font-bold text-gray-900">✅ Paid Medical</p>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Approved with medical benefits. Employee receives full salary for paid days.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLeaveCategory('unpaid')}
                      className={`group p-4 rounded-lg border-2 transition-all text-left ${
                        leaveCategory === 'unpaid'
                          ? 'border-amber-500 bg-linear-to-br from-amber-50 to-orange-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            leaveCategory === 'unpaid' ? 'bg-amber-500' : 'bg-gray-100'
                          }`}
                        >
                          <XCircleIcon
                            className={`w-5 h-5 ${leaveCategory === 'unpaid' ? 'text-white' : 'text-gray-400'}`}
                          />
                        </div>
                        <p className="font-bold text-gray-900">❌ Unpaid Medical</p>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Not eligible for medical benefits. Employee receives no salary.
                      </p>
                    </button>
                  </div>

                  {leaveCategory && (
                    <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg p-3 mt-3">
                      <p className="text-sm text-blue-900 font-bold">
                        ✓ Classification:{' '}
                        {leaveCategory === 'medical'
                          ? 'Paid Medical Leave'
                          : 'Unpaid Medical Leave'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === 'approve' ? 'Additional Comments (Optional)' : 'Rejection Reason'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? 'Add any additional notes or comments...'
                    : 'Reason for rejection...'
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                {actionType === 'approve' ? 'Approve & Finalize' : 'Reject Request'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
