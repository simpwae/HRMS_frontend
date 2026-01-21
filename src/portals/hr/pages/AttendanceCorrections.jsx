import { useState, useMemo } from 'react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { useDataStore } from '../../../state/data';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import FormField from '../../../components/FormField';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

/**
 * AttendanceCorrections (HR) - HR portal for auditing all attendance
 * correction requests across the organization with filtering and reporting
 */
export default function AttendanceCorrections() {
  const { employees, departments, attendanceCorrections, reviewAttendanceCorrection } =
    useDataStore();

  const [filters, setFilters] = useState({
    status: '', // '', 'Pending', 'Approved', 'Rejected'
    department: '',
    dateFrom: '',
    dateTo: '',
    searchEmployee: '',
  });

  const [expandedCorrection, setExpandedCorrection] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedForOverride, setSelectedForOverride] = useState(null);
  const [overrideForm, setOverrideForm] = useState({
    newStatus: '',
    reason: '',
  });
  const [overrideErrors, setOverrideErrors] = useState({});

  // Apply filters
  const filteredCorrections = useMemo(() => {
    return (attendanceCorrections || []).filter((correction) => {
      // Status filter
      if (filters.status && correction.status !== filters.status) return false;

      // Department filter
      if (filters.department) {
        const employee = employees.find((e) => e.id === correction.employeeId);
        if (!employee || employee.department !== filters.department) return false;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const correctionDate = parseISO(correction.originalAttendance.date);
        if (filters.dateFrom) {
          const fromDate = startOfDay(parseISO(filters.dateFrom));
          if (isBefore(correctionDate, fromDate)) return false;
        }
        if (filters.dateTo) {
          const toDate = endOfDay(parseISO(filters.dateTo));
          if (isAfter(correctionDate, toDate)) return false;
        }
      }

      // Employee search filter
      if (filters.searchEmployee) {
        const employee = employees.find((e) => e.id === correction.employeeId);
        const searchLower = filters.searchEmployee.toLowerCase();
        if (
          !employee?.name?.toLowerCase().includes(searchLower) &&
          !employee?.email?.toLowerCase().includes(searchLower) &&
          !correction.employeeId?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [attendanceCorrections, filters, employees]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: filteredCorrections.length,
      pending: filteredCorrections.filter((c) => c.status === 'Pending').length,
      approved: filteredCorrections.filter((c) => c.status === 'Approved').length,
      rejected: filteredCorrections.filter((c) => c.status === 'Rejected').length,
    };
  }, [filteredCorrections]);

  const getEmployeeName = (employeeId) => {
    return employees.find((e) => e.id === employeeId)?.name || 'Unknown Employee';
  };

  const getEmployeeDepartment = (employeeId) => {
    return employees.find((e) => e.id === employeeId)?.department || 'Unknown';
  };

  const handleOpenOverride = (correction) => {
    setSelectedForOverride(correction);
    setOverrideForm({
      newStatus: correction.status,
      reason: '',
    });
    setOverrideErrors({});
    setOverrideModalOpen(true);
  };

  const validateOverride = () => {
    const errors = {};
    if (!overrideForm.reason || overrideForm.reason.trim().length === 0)
      errors.reason = 'Reason is required';
    if (overrideForm.newStatus === selectedForOverride.status)
      errors.newStatus = 'Select a different status';
    setOverrideErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOverride = () => {
    if (!validateOverride()) return;

    reviewAttendanceCorrection(selectedForOverride.id, {
      status: overrideForm.newStatus,
      reviewer: 'HR Override',
      notes: `HR Override: ${overrideForm.reason}`,
    });

    setOverrideModalOpen(false);
    setSelectedForOverride(null);
    setOverrideForm({ newStatus: '', reason: '' });
  };

  const handleExportCSV = () => {
    if (filteredCorrections.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Date',
      'Original Status',
      'Requested Status',
      'Current Status',
      'Submitted On',
      'Reason',
    ];

    const rows = filteredCorrections.map((correction) => [
      correction.employeeId,
      getEmployeeName(correction.employeeId),
      getEmployeeDepartment(correction.employeeId),
      format(parseISO(correction.originalAttendance.date), 'MMM d, yyyy'),
      correction.originalAttendance.status,
      correction.requestedChange.status,
      correction.status,
      format(parseISO(correction.submittedOn), 'MMM d, yyyy HH:mm'),
      `"${correction.reason.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-corrections-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCorrectionStatusColor = (status) => {
    if (status === 'Pending') return 'bg-yellow-50 border-yellow-200';
    if (status === 'Approved') return 'bg-green-50 border-green-200';
    if (status === 'Rejected') return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getCorrectionStatusBadge = (status) => {
    if (status === 'Pending') return 'warning';
    if (status === 'Approved') return 'success';
    if (status === 'Rejected') return 'error';
    return 'default';
  };

  const getAttendanceStatusBadge = (status) => {
    if (status === 'Present' || status === 'Approved Leave' || status === 'Official Duty')
      return 'success';
    if (status === 'Late') return 'warning';
    if (status === 'Absent') return 'error';
    return 'default';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Corrections Audit</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review and manage all attendance correction requests across the organization
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <ChevronDownIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <FormField label="Status">
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </FormField>

          <FormField label="Department">
            <select
              value={filters.department}
              onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments?.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="From Date">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="To Date">
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Search Employee">
            <input
              type="text"
              placeholder="Name or ID..."
              value={filters.searchEmployee}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchEmployee: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        {Object.values(filters).some((v) => v) && (
          <Button
            onClick={() =>
              setFilters({
                status: '',
                department: '',
                dateFrom: '',
                dateTo: '',
                searchEmployee: '',
              })
            }
            variant="secondary"
            size="sm"
            className="mt-4"
          >
            Clear Filters
          </Button>
        )}
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={handleExportCSV} icon={ArrowDownTrayIcon} variant="secondary" size="sm">
          Export CSV
        </Button>
      </div>

      {/* Corrections List */}
      {filteredCorrections.length > 0 ? (
        <div className="space-y-3">
          {filteredCorrections.map((correction) => (
            <Card
              key={correction.id}
              className={`p-4 cursor-pointer border transition-all hover:shadow-md ${getCorrectionStatusColor(correction.status)}`}
              onClick={() =>
                setExpandedCorrection(expandedCorrection?.id === correction.id ? null : correction)
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium text-gray-900">
                      {getEmployeeName(correction.employeeId)}
                    </p>
                    <Badge variant={getCorrectionStatusBadge(correction.status)}>
                      {correction.status}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1 mb-3">
                    <p>
                      <span className="font-medium">ID:</span> {correction.employeeId} •{' '}
                      <span className="font-medium">Dept:</span>{' '}
                      {getEmployeeDepartment(correction.employeeId)}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {format(parseISO(correction.originalAttendance.date), 'MMM d, yyyy')} •{' '}
                      <span className="font-medium">Current Status:</span>
                      <Badge
                        variant={getAttendanceStatusBadge(correction.originalAttendance.status)}
                      >
                        {correction.originalAttendance.status}
                      </Badge>
                      {' → '}
                      <Badge variant={getAttendanceStatusBadge(correction.requestedChange.status)}>
                        {correction.requestedChange.status}
                      </Badge>
                    </p>
                    <p>
                      <span className="font-medium">Reason:</span>{' '}
                      <span className="text-gray-600">{correction.reason.substring(0, 80)}</span>
                      {correction.reason.length > 80 && '...'}
                    </p>
                    <p className="text-gray-500 text-xs">
                      <span className="font-medium">Submitted:</span>{' '}
                      {format(parseISO(correction.submittedOn), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>

                  {/* Expanded Details */}
                  {expandedCorrection?.id === correction.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                          Full Reason
                        </p>
                        <p className="text-sm text-gray-700">{correction.reason}</p>
                      </div>

                      {correction.documents?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                            Supporting Documents
                          </p>
                          <div className="space-y-1">
                            {correction.documents.map((doc) => (
                              <a
                                key={doc.id}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                              >
                                <DocumentTextIcon className="w-4 h-4" />
                                {doc.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {correction.audit && correction.audit.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                            Audit Trail
                          </p>
                          <div className="space-y-2">
                            {correction.audit.map((entry, idx) => (
                              <div key={idx} className="text-sm bg-white bg-opacity-50 p-2 rounded">
                                <p className="font-medium text-gray-900">{entry.action}</p>
                                <p className="text-xs text-gray-600">
                                  By {entry.by} on{' '}
                                  {format(parseISO(entry.date), 'MMM d, yyyy h:mm a')}
                                </p>
                                {entry.comment && (
                                  <p className="text-xs text-gray-700 mt-1">"{entry.comment}"</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Override Option */}
                      {correction.status !== 'Pending' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenOverride(correction);
                          }}
                          variant="secondary"
                          size="sm"
                          className="mt-4 w-full"
                        >
                          Override Status
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                    expandedCorrection?.id === correction.id ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No corrections match your filters</p>
        </Card>
      )}

      {/* Override Modal */}
      <Modal
        open={overrideModalOpen}
        onClose={() => {
          setOverrideModalOpen(false);
          setSelectedForOverride(null);
          setOverrideForm({ newStatus: '', reason: '' });
        }}
        title="Override Correction Status"
        size="md"
      >
        {selectedForOverride && (
          <div className="space-y-4">
            <Card className="p-4 bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                ⚠️ This action will override the current decision. This change will be logged in the
                audit trail.
              </p>
            </Card>

            <FormField label="Current Status">
              <input
                type="text"
                value={selectedForOverride.status}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </FormField>

            <FormField label="New Status*" error={overrideErrors.newStatus}>
              <select
                value={overrideForm.newStatus}
                onChange={(e) => {
                  setOverrideForm((prev) => ({ ...prev, newStatus: e.target.value }));
                  setOverrideErrors((prev) => ({ ...prev, newStatus: '' }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </FormField>

            <FormField label="Reason for Override*" error={overrideErrors.reason}>
              <textarea
                value={overrideForm.reason}
                onChange={(e) => {
                  setOverrideForm((prev) => ({ ...prev, reason: e.target.value }));
                  setOverrideErrors((prev) => ({ ...prev, reason: '' }));
                }}
                placeholder="Explain why you're overriding this decision..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-6 border-t">
          <Button
            onClick={() => {
              setOverrideModalOpen(false);
              setSelectedForOverride(null);
              setOverrideForm({ newStatus: '', reason: '' });
            }}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmitOverride} className="flex-1">
            Apply Override
          </Button>
        </div>
      </Modal>
    </div>
  );
}
