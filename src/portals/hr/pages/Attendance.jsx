import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import { Tabs, TabsList, TabsTrigger } from '../../../components/Tabs';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const severityColors = {
  error: 'error',
  warning: 'warning',
  info: 'info',
};

export default function Attendance() {
  const user = useAuthStore((s) => s.user);
  const { employees, flagAttendanceAnomalies, attendanceCorrections, reviewAttendanceCorrection } =
    useDataStore();

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('anomalies');
  const [selectedCorrection, setSelectedCorrection] = useState(null);
  const [decision, setDecision] = useState({ status: 'Approved', notes: '' });

  const employeeAnomalies = useMemo(() => {
    if (!selectedEmployee) return { anomalies: [] };
    return flagAttendanceAnomalies(selectedEmployee.id);
  }, [selectedEmployee, flagAttendanceAnomalies]);

  const correctionsByEmployee = useMemo(() => {
    if (!selectedEmployee) return [];
    return attendanceCorrections.filter((c) => c.employeeId === selectedEmployee.id);
  }, [selectedEmployee, attendanceCorrections]);

  const handleReviewCorrection = () => {
    if (!selectedCorrection) return;
    reviewAttendanceCorrection(selectedCorrection.id, {
      status: decision.status,
      notes: decision.notes,
      reviewer: user?.name || 'HR',
    });
    setSelectedCorrection(null);
    setDecision({ status: 'Approved', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">
            Monitor anomalies, review corrections, and manage attendance records
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockIcon className="w-5 h-5" /> {attendanceCorrections.length} corrections pending
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
          <select
            value={selectedEmployee?.id || ''}
            onChange={(e) => {
              const emp = employees.find((employee) => employee.id === e.target.value);
              setSelectedEmployee(emp);
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">-- Choose Employee --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.department})
              </option>
            ))}
          </select>
        </div>

        {selectedEmployee && (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
                <TabsTrigger value="corrections">Corrections</TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === 'anomalies' && (
              <div className="mt-4 space-y-3">
                {employeeAnomalies.anomalies.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircleIcon className="w-4 h-4" /> No anomalies detected
                  </div>
                ) : (
                  employeeAnomalies.anomalies.map((anomaly, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border flex items-start gap-3 ${
                        anomaly.severity === 'error'
                          ? 'bg-red-50 border-red-200'
                          : anomaly.severity === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <ExclamationTriangleIcon
                        className={`w-5 h-5 shrink-0 ${
                          anomaly.severity === 'error'
                            ? 'text-red-600'
                            : anomaly.severity === 'warning'
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{anomaly.message}</p>
                        <p className="text-xs text-gray-600 capitalize">Type: {anomaly.type}</p>
                      </div>
                      <Badge variant={severityColors[anomaly.severity]}>{anomaly.severity}</Badge>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'corrections' && (
              <div className="mt-4 space-y-3">
                {correctionsByEmployee.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DocumentTextIcon className="w-4 h-4" /> No correction requests
                  </div>
                ) : (
                  correctionsByEmployee.map((correction) => (
                    <div
                      key={correction.id}
                      className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-gray-50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {format(parseISO(correction.originalAttendance.date), 'MMM d, yyyy')}
                          </h3>
                          <Badge
                            variant={
                              correction.status === 'Pending'
                                ? 'warning'
                                : correction.status === 'Approved'
                                  ? 'success'
                                  : 'error'
                            }
                          >
                            {correction.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {correction.originalAttendance.status} →{' '}
                          {correction.requestedChange.status}
                        </p>
                        <p className="text-xs text-gray-500">{correction.reason}</p>
                      </div>
                      {correction.status === 'Pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCorrection(correction)}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        isOpen={!!selectedCorrection}
        onClose={() => setSelectedCorrection(null)}
        title="Review Attendance Correction"
        size="lg"
      >
        {selectedCorrection && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <UserIcon className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-900">{selectedCorrection.employeeName}</p>
                <p className="text-sm text-gray-500">{selectedCorrection.department}</p>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
              <p className="text-sm font-medium text-gray-800">Original Attendance</p>
              <div className="flex justify-between text-sm text-gray-700">
                <span>
                  Date: {format(parseISO(selectedCorrection.originalAttendance.date), 'PPP')}
                </span>
                <Badge variant="secondary">{selectedCorrection.originalAttendance.status}</Badge>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-blue-50 space-y-2">
              <p className="text-sm font-medium text-blue-900">Requested Correction</p>
              <div className="flex justify-between text-sm text-blue-700">
                <span>Change to: {selectedCorrection.requestedChange.status}</span>
                <Badge variant="info">{selectedCorrection.requestedChange.status}</Badge>
              </div>
              <p className="text-sm text-blue-700">Reason: {selectedCorrection.reason}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
              <select
                value={decision.status}
                onChange={(e) => setDecision((d) => ({ ...d, status: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Approved">Approve</option>
                <option value="Rejected">Reject</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={decision.notes}
                onChange={(e) => setDecision((d) => ({ ...d, notes: e.target.value }))}
                rows={3}
                placeholder="Add optional comments for audit trail"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedCorrection(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleReviewCorrection}
                className={decision.status === 'Rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {decision.status}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
