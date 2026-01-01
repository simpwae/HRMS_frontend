import { useState, useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import InputWithIcon from '../../../components/InputWithIcon';
import { useDataStore, leaveTypes } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import Avatar from '../../../components/Avatar';
import StatCard from '../../../components/StatCard';
import FormField from '../../../components/FormField';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserCircleIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

export default function LeavesList() {
  const user = useAuthStore((s) => s.user);
  const { employees, leaves, updateLeaveStatus } = useDataStore();
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [approvalComment, setApprovalComment] = useState('');
  const [paidDays, setPaidDays] = useState(0);
  const [unpaidDays, setUnpaidDays] = useState(0);
  const [daysError, setDaysError] = useState('');
  const [leaveCategory, setLeaveCategory] = useState(null);
  const [approvalAction, setApprovalAction] = useState(null);

  // Stats
  const stats = useMemo(
    () => ({
      total: leaves.length,
      pending: leaves.filter((l) => l.status === 'Pending').length,
      approved: leaves.filter((l) => l.status === 'Approved').length,
      rejected: leaves.filter((l) => l.status === 'Rejected').length,
    }),
    [leaves],
  );

  // Enrich leaves with employee data
  const enrichedLeaves = useMemo(() => {
    return leaves.map((leave) => {
      const employee = employees.find((e) => e.id === leave.employeeId);
      return {
        ...leave,
        employee,
        employeeName: leave.employeeName || employee?.name,
        department: leave.department || employee?.department,
        faculty: leave.faculty || employee?.faculty,
      };
    });
  }, [leaves, employees]);

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return enrichedLeaves
      .filter((leave) => {
        const matchesSearch =
          leave.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          leave.department?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === 'all' || leave.type === filterType;
        const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => parseISO(b.appliedOn) - parseISO(a.appliedOn));
  }, [enrichedLeaves, searchQuery, filterType, filterStatus]);

  // Group by status
  const pendingLeaves = filteredLeaves.filter((l) => l.status === 'Pending');
  const approvedLeaves = filteredLeaves.filter((l) => l.status === 'Approved');
  const rejectedLeaves = filteredLeaves.filter((l) => l.status === 'Rejected');

  // Determine user role - maps to approval chain roles
  const getUserApprovalRole = () => {
    const role = (user?.primaryRole || user?.role)?.toLowerCase() || 'hr';
    const roleMap = {
      hod: 'hod',
      dean: 'dean',
      hr: 'hr',
      'manager-hr': 'hr',
      vc: 'vc',
      'vice-chancellor': 'vc',
      president: 'president',
    };
    return roleMap[role] || 'hr';
  };

  const currentUserRole = getUserApprovalRole();

  // Reset paid/unpaid inputs and category when selecting a leave
  useEffect(() => {
    if (!selectedLeave) {
      setLeaveCategory(null);
      return;
    }
    const defaultPaid = selectedLeave.paidDays ?? selectedLeave.days ?? 0;
    const defaultUnpaid = selectedLeave.unpaidDays ?? 0;
    setPaidDays(defaultPaid);
    setUnpaidDays(defaultUnpaid);
    setDaysError('');
    setLeaveCategory(selectedLeave.leaveCategory || null);
  }, [selectedLeave]);

  // Check maternity leave eligibility with gender validation
  const checkMaternityEligibility = (leave) => {
    if (leave.type !== 'maternity') return { eligible: true, reason: '' };

    const employee = employees.find((e) => e.id === leave.employeeId);
    if (!employee) return { eligible: false, reason: 'Employee not found' };

    // Check gender - maternity leave is only for females
    // Fix: Ensure consistent casing and add null check
    const isFemale = employee.gender && employee.gender.toLowerCase() === 'female';
    if (!isFemale) {
      return {
        eligible: false,
        reason: 'Maternity leave is only available for female employees',
      };
    }

    // Check if employee is confirmed (not on probation)
    const isConfirmed =
      employee.status === 'confirmed' || employee.employmentStatus === 'confirmed';

    if (!isConfirmed) {
      return {
        eligible: false,
        reason:
          'Probationary employees are not eligible for maternity leave. Only confirmed female employees can apply.',
      };
    }

    return { eligible: true, reason: '' };
  };

  const handleAction = (leaveId, status, comment = '') => {
    // Check maternity leave eligibility before approval
    if (selectedLeave?.type === 'maternity' && status === 'Approved') {
      const eligibility = checkMaternityEligibility(selectedLeave);
      if (!eligibility.eligible) {
        alert(`Cannot approve: ${eligibility.reason}`);
        return;
      }
    }

    // President approval for medical leaves requires paid/unpaid split AND categorization
    if (
      selectedLeave?.type === 'medical' &&
      currentUserRole === 'president' &&
      status === 'Approved'
    ) {
      const paid = Number(paidDays) || 0;
      const unpaid = Number(unpaidDays) || 0;
      const total = paid + unpaid;
      const requiredDays = selectedLeave?.days || 0;

      // Validate paid/unpaid split
      if (total !== requiredDays) {
        setDaysError(
          `Days don't match: ${paid} + ${unpaid} = ${total}, but leave is ${requiredDays} days`,
        );
        return;
      }

      // Validate categorization
      if (!leaveCategory) {
        alert(
          'Please select a classification for this medical leave (Paid Medical or Unpaid Medical)',
        );
        return;
      }

      setDaysError('');
      updateLeaveStatus(leaveId, status, currentUserRole, user?.name || 'System', comment, {
        paidDays: paid,
        unpaidDays: unpaid,
        leaveCategory: leaveCategory,
      });
      setSelectedLeave(null);
      setLeaveCategory(null);
      setPaidDays(0);
      setUnpaidDays(0);
      return;
    }

    // Dean approval requires paid/unpaid split validation (non-medical leaves)
    if (currentUserRole === 'dean' && status === 'Approved') {
      const paid = Number(paidDays) || 0;
      const unpaid = Number(unpaidDays) || 0;
      const total = paid + unpaid;
      const requiredDays = selectedLeave?.days || 0;

      if (total !== requiredDays) {
        setDaysError(
          `Days don't match: ${paid} + ${unpaid} = ${total}, but leave is ${requiredDays} days`,
        );
        return;
      }

      setDaysError('');
      updateLeaveStatus(leaveId, status, currentUserRole, user?.name || 'System', comment, {
        paidDays: paid,
        unpaidDays: unpaid,
      });
      setSelectedLeave(null);
      setPaidDays(0);
      setUnpaidDays(0);
      return;
    }

    // HOD, VC, HR, or Rejection
    updateLeaveStatus(leaveId, status, currentUserRole, user?.name || 'System', comment);
    setSelectedLeave(null);
  };

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

  // Check if current user can approve this leave
  const canApproveLeave = (leave) => {
    if (leave.status !== 'Pending' && leave.status !== 'Forwarded') return false;
    const currentStep = leave.approvalChain?.find((s) => s.role === currentUserRole);
    return currentStep?.status === 'pending';
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

  const renderLeaveCard = (leave) => (
    <div
      key={leave.id}
      className="border rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => setSelectedLeave(leave)}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <Avatar name={leave.employeeName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{leave.employeeName}</h4>
            <Badge variant={getBadgeVariant(leave.status)}>{leave.status}</Badge>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            {leave.department} • {getLeaveTypeName(leave.type)}
          </p>
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
          <p className="text-sm text-gray-500 mt-2 line-clamp-1">{leave.reason}</p>

          {(leave.paidDays !== null || leave.unpaidDays !== null) && (
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              {leave.paidDays !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                  Paid: {leave.paidDays}
                </span>
              )}
              {leave.unpaidDays !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  Unpaid: {leave.unpaidDays}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Applied</p>
          <p className="font-medium">{format(parseISO(leave.appliedOn), 'MMM d')}</p>
        </div>
      </div>

      {canApproveLeave(leave) && (
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (currentUserRole === 'dean') {
                setSelectedLeave(leave);
                setPaidDays(leave.paidDays ?? leave.days ?? 0);
                setUnpaidDays(leave.unpaidDays ?? 0);
                setDaysError('');
              } else {
                handleAction(leave.id, 'Approved');
              }
            }}
            className="gap-1"
          >
            <CheckCircleIcon className="w-4 h-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(leave.id, 'Rejected');
            }}
            className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircleIcon className="w-4 h-4" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLeave(leave);
            }}
            className="gap-1"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Details & Comments
          </Button>
        </div>
      )}
      {!canApproveLeave(leave) && leave.status !== 'Pending' && (
        <div className="mt-3 pt-3 border-t">
          <Badge variant="info" size="sm">
            Awaiting {leave.approvalChain?.find((s) => s.status === 'pending')?.role.toUpperCase()}{' '}
            approval
          </Badge>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
        <p className="text-gray-600">Review and manage employee leave applications</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={stats.total}
          icon={DocumentTextIcon}
          color="primary"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          subtitle="Awaiting approval"
          icon={ClockIcon}
          color="warning"
        />
        <StatCard title="Approved" value={stats.approved} icon={CheckCircleIcon} color="success" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircleIcon} color="error" />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <InputWithIcon
              type="text"
              placeholder="Search by employee name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              inputClassName="pr-4 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </select>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Leave Requests Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingLeaves.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedLeaves.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedLeaves.length})</TabsTrigger>
          <TabsTrigger value="all">All ({filteredLeaves.length})</TabsTrigger>
        </TabsList>

        {[
          { key: 'pending', data: pendingLeaves },
          { key: 'approved', data: approvedLeaves },
          { key: 'rejected', data: rejectedLeaves },
          { key: 'all', data: filteredLeaves },
        ].map(({ key, data }) => (
          <TabsContent key={key} value={key}>
            <Card>
              {data.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No {key === 'all' ? '' : key} leave requests</p>
                </div>
              ) : (
                <div className="space-y-4">{data.map(renderLeaveCard)}</div>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Leave Detail Modal */}
      <Modal
        isOpen={!!selectedLeave}
        onClose={() => {
          setSelectedLeave(null);
          setApprovalComment('');
          setPaidDays(0);
          setUnpaidDays(0);
          setDaysError('');
          setLeaveCategory(null);
          setApprovalAction(null);
        }}
        title="Leave Request Details"
        size="lg"
      >
        {selectedLeave && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="flex items-center gap-4">
              <Avatar name={selectedLeave.employeeName} size="lg" />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedLeave.employeeName}</h3>
                <p className="text-sm text-gray-500">
                  {selectedLeave.department} • {selectedLeave.faculty}
                </p>
                <Badge variant={getBadgeVariant(selectedLeave.status)} className="mt-1">
                  {selectedLeave.status}
                </Badge>
              </div>
            </div>

            {/* Maternity Leave Eligibility with Gender Check */}
            {selectedLeave.type === 'maternity' &&
              (() => {
                const eligibility = checkMaternityEligibility(selectedLeave);
                if (!eligibility.eligible) {
                  return (
                    <div className="bg-linear-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-5">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                          <XCircleIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-red-900 text-lg mb-2">
                            ❌ Maternity Leave Ineligible
                          </p>
                          <div className="space-y-2 text-sm">
                            <p className="text-red-700">
                              <span className="font-semibold">Reason:</span> {eligibility.reason}
                            </p>
                            <div className="bg-white p-3 rounded-lg border border-red-200">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">Gender</p>
                                  <p className="font-medium text-gray-900">
                                    {selectedLeave.employee?.gender || 'Not specified'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">Status</p>
                                  <p className="font-medium text-gray-900">
                                    {selectedLeave.employee?.status ||
                                      selectedLeave.employee?.employmentStatus ||
                                      'Unknown'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg border border-red-200">
                              <p className="text-xs text-red-800 font-semibold">
                                ⚠️ Policy Requirement: Maternity leave is available only for
                                confirmed female employees
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-green-900 text-lg mb-2">
                          ✅ Maternity Leave Eligible
                        </p>
                        <p className="text-sm text-green-700 mb-3">
                          Employee meets all eligibility criteria for maternity leave benefits.
                        </p>
                        <div className="bg-white p-3 rounded-lg border border-green-200">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Gender</p>
                              <p className="font-semibold text-green-700">
                                {selectedLeave.employee?.gender || 'Female'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Status</p>
                              <p className="font-semibold text-green-700">
                                {selectedLeave.employee?.status ||
                                  selectedLeave.employee?.employmentStatus ||
                                  'Confirmed'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Leave Details */}
            <div className="grid sm:grid-cols-2 gap-4">
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
                <p className="text-xs text-gray-500 uppercase">Employee Status</p>
                <p className="font-medium">
                  {selectedLeave.employee?.status ||
                    selectedLeave.employee?.employmentStatus ||
                    'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Days Allowed</p>
                <p className="font-medium">
                  {selectedLeave.employee?.leaveBalance?.[selectedLeave.type] ?? 'N/A'} days
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Remaining After</p>
                <p className="font-medium">
                  {(selectedLeave.employee?.leaveBalance?.[selectedLeave.type] ?? 0) -
                    selectedLeave.days >=
                  0 ? (
                    (selectedLeave.employee?.leaveBalance?.[selectedLeave.type] ?? 0) -
                    selectedLeave.days +
                    ' days'
                  ) : (
                    <span className="text-red-600">Insufficient balance</span>
                  )}
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
                  <DocumentTextIcon className="w-4 h-4" />
                  Supporting Documents
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
                          <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
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

            {/* Medical Leave - President's Paid/Unpaid Split & Categorization */}
            {canApproveLeave(selectedLeave) &&
              selectedLeave.type === 'medical' &&
              currentUserRole === 'president' && (
                <div className="space-y-5 bg-linear-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <DocumentIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-900 text-xl">
                        🏥 President's Final Medical Leave Decision
                      </p>
                      <p className="text-sm text-purple-700">
                        As the final authority, classify days and categorize this medical leave
                      </p>
                    </div>
                  </div>

                  {/* Step 1: Paid/Unpaid Classification */}
                  <div className="bg-white border-2 border-purple-200 rounded-xl p-5 shadow-sm">
                    <p className="font-bold text-purple-900 mb-1 text-lg">
                      Step 1: Classify Leave Days
                    </p>
                    <p className="text-sm text-purple-700 mb-4">
                      Total days to classify:{' '}
                      <span className="font-bold text-xl">{selectedLeave.days}</span> days
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
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
                          className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-lg font-bold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50"
                          placeholder="0"
                        />
                        <p className="text-xs text-green-600 mt-2 font-medium">
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
                          className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl text-lg font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50"
                          placeholder="0"
                        />
                        <p className="text-xs text-amber-600 mt-2 font-medium">
                          ✗ Employee receives no salary
                        </p>
                      </div>
                    </div>

                    {/* Real-time Validation Display */}
                    {(() => {
                      const paid = Number(paidDays) || 0;
                      const unpaid = Number(unpaidDays) || 0;
                      const total = paid + unpaid;
                      const isValid = total === selectedLeave.days;
                      const isOver = total > selectedLeave.days;
                      const remaining = selectedLeave.days - total;

                      return (
                        <div
                          className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                            isValid
                              ? 'bg-linear-to-r from-green-50 to-emerald-50 border-green-400'
                              : isOver
                                ? 'bg-linear-to-r from-red-50 to-rose-50 border-red-400'
                                : 'bg-linear-to-r from-yellow-50 to-amber-50 border-yellow-400'
                          }`}
                        >
                          <div className="text-center flex-1">
                            <p className="text-3xl font-bold text-green-600">{paid}</p>
                            <p className="text-xs text-green-700 font-bold uppercase">Paid</p>
                          </div>
                          <div className="text-4xl text-gray-300 font-bold">+</div>
                          <div className="text-center flex-1">
                            <p className="text-3xl font-bold text-amber-600">{unpaid}</p>
                            <p className="text-xs text-amber-700 font-bold uppercase">Unpaid</p>
                          </div>
                          <div className="text-4xl text-gray-300 font-bold">=</div>
                          <div className="text-center flex-1">
                            <p
                              className={`text-3xl font-bold ${
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
                      <div className="bg-red-100 border border-red-300 rounded-lg p-3 mt-3">
                        <p className="text-sm text-red-700 font-semibold">⚠️ {daysError}</p>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Medical Leave Category */}
                  <div className="bg-white border-2 border-purple-200 rounded-xl p-5 shadow-sm">
                    <p className="font-bold text-purple-900 mb-1 text-lg">
                      Step 2: Final Medical Leave Category
                    </p>
                    <p className="text-sm text-purple-700 mb-4">
                      Based on submitted medical documentation and paid days allocation, select
                      final classification:
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setLeaveCategory('medical')}
                        className={`group p-5 rounded-xl border-3 transition-all text-left ${
                          leaveCategory === 'medical'
                            ? 'border-green-500 bg-linear-to-br from-green-50 to-emerald-50 shadow-lg scale-105'
                            : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              leaveCategory === 'medical' ? 'bg-green-500' : 'bg-gray-100'
                            }`}
                          >
                            <CheckCircleIcon
                              className={`w-6 h-6 ${leaveCategory === 'medical' ? 'text-white' : 'text-gray-400'}`}
                            />
                          </div>
                          <p className="font-bold text-gray-900 text-lg">✅ Paid Medical Leave</p>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Approved with medical benefits. Employee receives full salary for paid
                          days. Deducted from medical leave balance.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLeaveCategory('unpaid')}
                        className={`group p-5 rounded-xl border-3 transition-all text-left ${
                          leaveCategory === 'unpaid'
                            ? 'border-amber-500 bg-linear-to-br from-amber-50 to-orange-50 shadow-lg scale-105'
                            : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              leaveCategory === 'unpaid' ? 'bg-amber-500' : 'bg-gray-100'
                            }`}
                          >
                            <XCircleIcon
                              className={`w-6 h-6 ${leaveCategory === 'unpaid' ? 'text-white' : 'text-gray-400'}`}
                            />
                          </div>
                          <p className="font-bold text-gray-900 text-lg">❌ Unpaid Medical Leave</p>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Not eligible for medical benefits. Employee receives no salary. No balance
                          deduction.
                        </p>
                      </button>
                    </div>

                    {leaveCategory && (
                      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg p-4 mt-4">
                        <p className="text-sm text-blue-900 font-bold">
                          ✓ Final Classification Selected:{' '}
                          <span className="text-lg">
                            {leaveCategory === 'medical'
                              ? 'Paid Medical Leave'
                              : 'Unpaid Medical Leave'}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* VC Recommendation Display */}
                  {selectedLeave.approvalChain?.find((s) => s.role === 'vc')?.comment && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <InformationCircleIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-blue-900 mb-1">
                            📋 Vice Chancellor's Recommendation:
                          </p>
                          <p className="text-sm text-blue-700 leading-relaxed">
                            {selectedLeave.approvalChain.find((s) => s.role === 'vc').comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Approval Chain */}
            {selectedLeave.approvalChain && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Approval Chain</p>
                <div className="space-y-2">
                  {selectedLeave.approvalChain.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        {step.status === 'approved' ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : step.status === 'rejected' ? (
                          <XCircleIcon className="w-5 h-5 text-red-500" />
                        ) : (
                          <ClockIcon className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <span className="font-medium uppercase text-sm">{step.role}</span>
                          {step.date && (
                            <p className="text-xs text-gray-500">
                              {format(parseISO(step.date), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        {step.by && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">By:</span> {step.by}
                          </p>
                        )}
                        {step.comment && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Comment:</span> {step.comment}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium capitalize whitespace-nowrap ${
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

            {/* Comment Section for Approval */}
            {canApproveLeave(selectedLeave) && (
              <div>
                <FormField label="Comments (Optional)">
                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    placeholder="Add comments for this approval (e.g., medical documents verified, alternative arrangements made, etc.)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
              </div>
            )}

            {/* Dean Paid/Unpaid Split - Prominent Section */}
            {canApproveLeave(selectedLeave) && currentUserRole === 'dean' && (
              <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div>
                  <p className="font-semibold text-blue-900 mb-3">
                    Classify Leave Days as Paid or Unpaid
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
                        setPaidDays(e.target.value);
                        setDaysError('');
                      }}
                      className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
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
                        setUnpaidDays(e.target.value);
                        setDaysError('');
                      }}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      placeholder="0"
                    />
                    <p className="text-xs text-blue-600 mt-1">Employee receives no pay</p>
                  </div>
                </div>

                {/* Summary Display */}
                <div className="flex gap-3 p-3 bg-white rounded-lg border border-blue-100">
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold text-green-600">{paidDays}</p>
                    <p className="text-xs text-green-700 font-medium">PAID</p>
                  </div>
                  <div className="text-center text-2xl text-gray-300 font-bold">+</div>
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold text-amber-600">{unpaidDays}</p>
                    <p className="text-xs text-amber-700 font-medium">UNPAID</p>
                  </div>
                  <div className="text-center text-2xl text-gray-300 font-bold">=</div>
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold text-blue-600">{selectedLeave.days}</p>
                    <p className="text-xs text-blue-700 font-medium">TOTAL</p>
                  </div>
                </div>

                {daysError && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    ⚠️ {daysError}
                  </p>
                )}
              </div>
            )}

            {/* Medical Leave Categorization - ONLY after Dean approval */}
            {approvalAction === 'approve' &&
              selectedLeave.type === 'Medical' &&
              selectedLeave.approvalChain?.dean?.status === 'Approved' && (
                <div className="space-y-4 bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <div>
                    <p className="font-semibold text-teal-900 mb-3">
                      💼 Final Medical Leave Classification
                    </p>
                    <p className="text-sm text-teal-700 mb-4">
                      Based on Dean's assessment and submitted documentation, select the final
                      category:
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setLeaveCategory('medical')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        leaveCategory === 'medical'
                          ? 'bg-green-100 border-green-500'
                          : 'bg-white border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 mb-1">✅ Paid Medical Leave</p>
                      <p className="text-sm text-gray-600">Employee receives full salary</p>
                    </button>

                    <button
                      onClick={() => setLeaveCategory('unpaid')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        leaveCategory === 'unpaid'
                          ? 'bg-red-100 border-red-500'
                          : 'bg-white border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 mb-1">❌ Unpaid Medical Leave</p>
                      <p className="text-sm text-gray-600">Employee receives no salary</p>
                    </button>
                  </div>

                  {leaveCategory && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                      ✓ Selected:{' '}
                      {leaveCategory === 'medical' ? 'Paid Medical Leave' : 'Unpaid Medical Leave'}
                    </div>
                  )}
                </div>
              )}

            {/* Actions */}
            {canApproveLeave(selectedLeave) && (
              <div className="flex justify-end gap-3 pt-6 border-t-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleAction(selectedLeave.id, 'Rejected', approvalComment);
                    setApprovalComment('');
                    setPaidDays(0);
                    setUnpaidDays(0);
                    setDaysError('');
                    setLeaveCategory(null);
                    setApprovalAction(null);
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50 px-6 py-2"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleAction(selectedLeave.id, 'Approved', approvalComment);
                    setApprovalComment('');
                    setPaidDays(0);
                    setUnpaidDays(0);
                    setDaysError('');
                    setLeaveCategory(null);
                    setApprovalAction(null);
                  }}
                  disabled={
                    (selectedLeave.type === 'maternity' &&
                      !checkMaternityEligibility(selectedLeave).eligible) ||
                    (selectedLeave.type === 'medical' &&
                      currentUserRole === 'president' &&
                      (!leaveCategory ||
                        Number(paidDays) + Number(unpaidDays) !== selectedLeave.days))
                  }
                  className="bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-2"
                >
                  Approve
                </Button>
              </div>
            )}

            {!canApproveLeave(selectedLeave) && (
              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedLeave(null);
                    setApprovalComment('');
                    setPaidDays(0);
                    setUnpaidDays(0);
                    setDaysError('');
                    setLeaveCategory(null);
                    setApprovalAction(null);
                  }}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
