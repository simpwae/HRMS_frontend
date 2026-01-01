import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function BulkIncrements() {
  const user = useAuthStore((s) => s.user);
  const { employees, bulkIncrements, createBulkIncrementBatch, applyBulkIncrementBatch } =
    useDataStore();

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [form, setForm] = useState({
    title: 'Annual Increment',
    type: 'Cost of Living',
    mode: 'percent',
    value: 7,
    effectiveDate: format(new Date(), 'yyyy-MM-dd'),
    note: '',
  });
  const [activeTab, setActiveTab] = useState('pending');
  const [showPreview, setShowPreview] = useState(false);
  const [previewBatch, setPreviewBatch] = useState(null);

  // Default select all employees
  useEffect(() => {
    setSelectedEmployees(employees.map((e) => e.id));
  }, [employees]);

  const filteredBatches = useMemo(() => {
    return bulkIncrements.filter((b) =>
      activeTab === 'pending' ? b.status === 'Pending' : b.status === 'Applied',
    );
  }, [bulkIncrements, activeTab]);

  const handleToggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id],
    );
  };

  const handleCreate = (e) => {
    e.preventDefault();
    createBulkIncrementBatch({
      ...form,
      value: Number(form.value) || 0,
      employeeIds: selectedEmployees,
      createdBy: user?.name,
    });
    setForm((prev) => ({ ...prev, note: '' }));
  };

  const openPreview = (batch) => {
    setPreviewBatch(batch);
    setShowPreview(true);
  };

  const statusBadge = (status) => {
    const variants = { Pending: 'warning', Applied: 'success' };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Increments</h1>
          <p className="text-gray-600">
            Create batches with effective dates, unique codes, and auditable application history.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BanknotesIcon className="w-5 h-5" />
          {bulkIncrements.length} batches
        </div>
      </div>

      {/* Create batch */}
      <Card
        title="Create Increment Batch"
        subtitle="Apply percent or flat increments across employees"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Annual Increment"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Increment Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option>Cost of Living</option>
                <option>Performance</option>
                <option>Adjustment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <select
                value={form.mode}
                onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                min={0}
                step="0.1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <input
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Optional audit note"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Employees</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedEmployees(
                    selectedEmployees.length === employees.length ? [] : employees.map((e) => e.id),
                  )
                }
              >
                {selectedEmployees.length === employees.length ? 'Clear' : 'Select All'}
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-52 overflow-y-auto border rounded-lg p-3 bg-gray-50">
              {employees.map((emp) => (
                <label key={emp.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(emp.id)}
                    onChange={() => handleToggleEmployee(emp.id)}
                  />
                  <span>
                    {emp.name}
                    <span className="text-xs text-gray-500"> • {emp.designation}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500">{selectedEmployees.length} employees selected</p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="gap-2">
              <ClipboardDocumentListIcon className="w-4 h-4" />
              Create Batch
            </Button>
          </div>
        </form>
      </Card>

      {/* Existing batches */}
      <Card title="Batches" subtitle="Apply and audit historical increments">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 space-y-3">
          {filteredBatches.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ClockIcon className="w-4 h-4" /> No batches found
            </div>
          ) : (
            filteredBatches.map((batch) => (
              <div
                key={batch.id}
                className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-gray-50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{batch.title}</h3>
                    {statusBadge(batch.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {batch.type} •{' '}
                    {batch.mode === 'percent' ? `${batch.value}%` : `PKR ${batch.value}`}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" /> Effective {batch.effectiveDate}
                  </p>
                  <p className="text-xs text-gray-500">Batch Code: {batch.code}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openPreview(batch)}>
                    View
                  </Button>
                  {batch.status === 'Pending' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => applyBulkIncrementBatch(batch.id, { approvedBy: user?.name })}
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Preview modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Batch Preview"
        size="lg"
      >
        {previewBatch && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BanknotesIcon className="w-5 h-5 text-green-600" />
              <span>
                {previewBatch.title} • {previewBatch.code}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>Type: {previewBatch.type}</div>
              <div>Mode: {previewBatch.mode === 'percent' ? 'Percent' : 'Flat'}</div>
              <div>
                Value:{' '}
                {previewBatch.mode === 'percent'
                  ? `${previewBatch.value}%`
                  : `PKR ${previewBatch.value}`}
              </div>
              <div>Effective: {previewBatch.effectiveDate}</div>
            </div>
            <div className="max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
              <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 mb-2">
                <span>Employee</span>
                <span>Previous</span>
                <span>New</span>
              </div>
              {previewBatch.items.map((item) => (
                <div key={item.employeeId} className="grid grid-cols-3 text-sm py-1">
                  <span>{item.employeeName}</span>
                  <span className="text-gray-500">{item.previousSalary.toLocaleString()}</span>
                  <span className="text-green-700 font-medium">
                    {item.newSalary.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {previewBatch.audit && previewBatch.audit.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-800">Audit Trail</p>
                {previewBatch.audit.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                    {entry.action === 'applied' ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="font-semibold capitalize">{entry.action}</span>
                    <span>{entry.date}</span>
                    <span>by {entry.by}</span>
                    {entry.note && <span className="text-gray-500">• {entry.note}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
