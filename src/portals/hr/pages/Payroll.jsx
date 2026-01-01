import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import { useAuthStore } from '../../../state/auth';
import { useDataStore } from '../../../state/data';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const statusBadge = (status) => {
  const variants = {
    Draft: 'secondary',
    'Pending Approval': 'warning',
    Approved: 'info',
    Posted: 'success',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
};

export default function Payroll() {
  const user = useAuthStore((s) => s.user);
  const {
    payrollRuns,
    generatePayrollRun,
    updatePayrollRunStatus,
    postPayrollRun,
    payrollSettings,
  } = useDataStore();

  const [monthInput, setMonthInput] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedRun, setSelectedRun] = useState(null);
  const [activeTab, setActiveTab] = useState('runs');

  const runs = useMemo(() => {
    return payrollRuns
      .slice()
      .sort((a, b) => new Date(b.period?.startDate || 0) - new Date(a.period?.startDate || 0));
  }, [payrollRuns]);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!monthInput) return;
    const [yearStr, monthStr] = monthInput.split('-');
    const month = Number(monthStr);
    const year = Number(yearStr);
    generatePayrollRun({ month, year, createdBy: user?.name });
  };

  const runExceptions = (run) => run.summary?.exceptions || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600">
            Generate payroll runs, review exceptions, and post approved payrolls.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CurrencyDollarIcon className="w-5 h-5" /> {runs.length} runs
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="settings">Current Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="runs">
          <Card title="New Payroll Run" subtitle="Create a draft payroll for a period">
            <form onSubmit={handleGenerate} className="grid sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <input
                  type="month"
                  value={monthInput}
                  onChange={(e) => setMonthInput(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit" className="gap-2">
                  <DocumentTextIcon className="w-4 h-4" /> Generate Draft
                </Button>
              </div>
            </form>
          </Card>

          <Card title="Runs" subtitle="Approve and post payroll">
            <div className="space-y-3">
              {runs.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDaysIcon className="w-4 h-4" /> No runs yet
                </div>
              )}
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{run.period?.label}</h3>
                      {statusBadge(run.status)}
                      {runExceptions(run) > 0 && (
                        <Badge variant="warning">{runExceptions(run)} exceptions</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Gross {run.summary?.totalGross?.toLocaleString()} • Net{' '}
                      {run.summary?.totalNet?.toLocaleString()} • Deductions{' '}
                      {run.summary?.totalDeductions?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Created {run.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedRun(run)}>
                      View
                    </Button>
                    {run.status === 'Draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updatePayrollRunStatus(run.id, 'Approved', { by: user?.name || 'HR' })
                        }
                      >
                        Approve
                      </Button>
                    )}
                    {run.status !== 'Posted' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => postPayrollRun(run.id, { postedBy: user?.name || 'HR' })}
                      >
                        Post
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card title="Current Payroll Rules" subtitle="Read-only snapshot from Payroll Settings">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
              <div>Working days: {payrollSettings?.workingDays}</div>
              <div>Late penalty: {payrollSettings?.deductionConfig?.latePenalty}</div>
              <div>
                Absent penalty: {payrollSettings?.deductionConfig?.absentPenaltyType}{' '}
                {payrollSettings?.deductionConfig?.absentPenaltyType === 'fixed'
                  ? `(${payrollSettings?.deductionConfig?.absentPenaltyValue})`
                  : ''}
              </div>
              <div>House allowance: {payrollSettings?.allowanceConfig?.housePercent}%</div>
              <div>Medical allowance: {payrollSettings?.allowanceConfig?.medicalPercent}%</div>
              <div>Transport: {payrollSettings?.allowanceConfig?.transportFixed}</div>
              <div>Tax threshold: {payrollSettings?.deductionConfig?.taxThreshold}</div>
              <div>Tax rate: {payrollSettings?.deductionConfig?.taxRate}%</div>
              <div>Overtime rate: {payrollSettings?.overtimeRate}x</div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        title={selectedRun ? `Run ${selectedRun.period?.label}` : ''}
        size="lg"
      >
        {selectedRun && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDaysIcon className="w-5 h-5" />
              <span>
                {selectedRun.period?.startDate} → {selectedRun.period?.endDate}
              </span>
            </div>
            {runExceptions(selectedRun) > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>{runExceptions(selectedRun)} employees have exceptions</span>
              </div>
            )}
            <div className="max-h-72 overflow-y-auto border rounded-lg divide-y">
              {selectedRun.items.map((item) => (
                <div key={item.employeeId} className="p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{item.employeeName}</p>
                      <p className="text-xs text-gray-500">
                        {item.department} • {item.designation}
                      </p>
                    </div>
                    {item.exceptions?.length > 0 && <Badge variant="warning">Exception</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-gray-700">
                    <span>Gross: {item.earnings?.total?.toLocaleString()}</span>
                    <span>Deductions: {item.deductions?.total?.toLocaleString()}</span>
                    <span>Net: {item.netPay?.toLocaleString()}</span>
                  </div>
                  {item.exceptions?.length > 0 && (
                    <ul className="text-xs text-amber-700 list-disc ml-5">
                      {item.exceptions.map((ex, idx) => (
                        <li key={idx}>{ex}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            {selectedRun.status !== 'Posted' && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    updatePayrollRunStatus(selectedRun.id, 'Approved', { by: user?.name || 'HR' })
                  }
                >
                  <CheckCircleIcon className="w-4 h-4" /> Approve
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => postPayrollRun(selectedRun.id, { postedBy: user?.name || 'HR' })}
                >
                  Post
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
