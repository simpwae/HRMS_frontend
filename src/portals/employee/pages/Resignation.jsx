import { useState, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { format, parseISO, addDays } from 'date-fns';
import { useDataStore, exitSurveyQuestions } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import FormField from '../../../components/FormField';
import {
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

export default function Resignation() {
  const user = useAuthStore((s) => s.user);
  const { employees, resignations, addResignation, submitExitSurvey } = useDataStore();

  const employee = useMemo(
    () => employees.find((e) => e.id === user?.id || e.email === user?.email),
    [employees, user],
  );
  const employeeId = employee?.id || user?.id;

  const [showResignModal, setShowResignModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [formDownloaded, setFormDownloaded] = useState(false);
  const formRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      noticePeriod: 30,
    },
  });

  const [surveyData, setSurveyData] = useState({});

  // My resignation requests
  const myResignations = useMemo(
    () =>
      resignations
        .filter((r) => r.employeeId === employeeId)
        .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)),
    [resignations, employeeId],
  );

  const activeResignation = myResignations.find(
    (r) => r.status === 'Pending' || r.status === 'Approved',
  );

  const onSubmitResignation = (data) => {
    const lastWorkingDate = format(addDays(new Date(), data.noticePeriod), 'yyyy-MM-dd');
    addResignation({
      employeeId,
      reason: data.reason,
      noticePeriod: parseInt(data.noticePeriod),
      lastWorkingDate,
      detailedReason: data.detailedReason,
    });
    reset();
    setShowResignModal(false);
  };

  const handleSurveySubmit = () => {
    if (selectedResignation) {
      submitExitSurvey(selectedResignation.id, surveyData);
      setShowSurveyModal(false);
      setSelectedResignation(null);
      setSurveyData({});
    }
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

  const renderSurveyField = (question) => {
    switch (question.type) {
      case 'select':
        return (
          <select
            value={surveyData[question.id] || ''}
            onChange={(e) => setSurveyData({ ...surveyData, [question.id]: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select an option</option>
            {question.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case 'rating':
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setSurveyData({ ...surveyData, [question.id]: rating })}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  surveyData[question.id] === rating
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );
      case 'boolean':
        return (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSurveyData({ ...surveyData, [question.id]: true })}
              className={`px-6 py-2 rounded-lg border-2 transition-all ${
                surveyData[question.id] === true
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setSurveyData({ ...surveyData, [question.id]: false })}
              className={`px-6 py-2 rounded-lg border-2 transition-all ${
                surveyData[question.id] === false
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              No
            </button>
          </div>
        );
      case 'textarea':
        return (
          <textarea
            value={surveyData[question.id] || ''}
            onChange={(e) => setSurveyData({ ...surveyData, [question.id]: e.target.value })}
            rows={3}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        );
      default:
        return null;
    }
  };

  // Generate and download resignation form
  const generateResignationForm = () => {
    const formContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Resignation Form - CECOS University</title>
  <style>
    body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; border-bottom: 2px solid #800020; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #800020; }
    .subtitle { color: #001F3F; font-size: 14px; margin-top: 5px; }
    h1 { color: #001F3F; font-size: 20px; margin: 30px 0; text-align: center; }
    .section { margin: 20px 0; }
    .section-title { font-weight: bold; color: #800020; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
    .field { margin: 10px 0; display: flex; }
    .field-label { font-weight: bold; width: 200px; }
    .field-value { flex: 1; border-bottom: 1px dotted #999; padding-left: 10px; }
    .checkbox-section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
    .checkbox-item { margin: 10px 0; }
    .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
    .signature-box { width: 45%; text-align: center; }
    .signature-line { border-top: 1px solid #000; margin-top: 60px; padding-top: 5px; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 20px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CECOS UNIVERSITY</div>
    <div class="subtitle">Human Resource Management System</div>
  </div>
  
  <h1>EMPLOYEE RESIGNATION FORM</h1>
  
  <div class="section">
    <div class="section-title">Employee Information</div>
    <div class="field">
      <span class="field-label">Employee Name:</span>
      <span class="field-value">${employee?.name || '_________________'}</span>
    </div>
    <div class="field">
      <span class="field-label">Employee Code:</span>
      <span class="field-value">${employee?.code || '_________________'}</span>
    </div>
    <div class="field">
      <span class="field-label">Department:</span>
      <span class="field-value">${employee?.department || '_________________'}</span>
    </div>
    <div class="field">
      <span class="field-label">Faculty:</span>
      <span class="field-value">${employee?.faculty || '_________________'}</span>
    </div>
    <div class="field">
      <span class="field-label">Designation:</span>
      <span class="field-value">${employee?.designation || '_________________'}</span>
    </div>
    <div class="field">
      <span class="field-label">Date of Joining:</span>
      <span class="field-value">${employee?.joinDate ? format(parseISO(employee.joinDate), 'MMMM d, yyyy') : '_________________'}</span>
    </div>
    <div class="field">
      <span class="field-label">Email:</span>
      <span class="field-value">${employee?.email || '_________________'}</span>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Resignation Details</div>
    <div class="field">
      <span class="field-label">Date of Resignation:</span>
      <span class="field-value">${format(new Date(), 'MMMM d, yyyy')}</span>
    </div>
    <div class="field">
      <span class="field-label">Last Working Day:</span>
      <span class="field-value">_________________</span>
    </div>
    <div class="field">
      <span class="field-label">Notice Period:</span>
      <span class="field-value">☐ 15 Days  ☐ 30 Days  ☐ 60 Days  ☐ 90 Days</span>
    </div>
    <div class="field" style="flex-direction: column;">
      <span class="field-label">Reason for Resignation:</span>
      <div style="border: 1px solid #ccc; min-height: 80px; margin-top: 10px; padding: 10px;"></div>
    </div>
  </div>
  
  <div class="checkbox-section">
    <div class="section-title">Clearance Checklist (To be completed by HR)</div>
    <div class="checkbox-item">☐ All university property returned (ID Card, Keys, Equipment)</div>
    <div class="checkbox-item">☐ Library clearance obtained</div>
    <div class="checkbox-item">☐ IT department clearance (Email, System Access revoked)</div>
    <div class="checkbox-item">☐ Finance department clearance (No pending dues)</div>
    <div class="checkbox-item">☐ Handover of responsibilities completed</div>
    <div class="checkbox-item">☐ Exit interview conducted</div>
    <div class="checkbox-item">☐ Final settlement processed</div>
  </div>
  
  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line">Employee Signature</div>
      <div>Date: _________________</div>
    </div>
    <div class="signature-box">
      <div class="signature-line">HR Manager Signature</div>
      <div>Date: _________________</div>
    </div>
  </div>
  
  <div class="signature-section" style="margin-top: 30px;">
    <div class="signature-box">
      <div class="signature-line">HOD Signature</div>
      <div>Date: _________________</div>
    </div>
    <div class="signature-box">
      <div class="signature-line">Dean Signature</div>
      <div>Date: _________________</div>
    </div>
  </div>
  
  <div class="footer">
    <p>CECOS University - Human Resource Department</p>
    <p>This form must be submitted at least 30 days before the intended last working day.</p>
    <p>Form Generated: ${format(new Date(), 'MMMM d, yyyy - HH:mm')}</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([formContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resignation_Form_${employee?.name?.replace(/\s+/g, '_') || 'Employee'}_${format(new Date(), 'yyyy-MM-dd')}.html`;
    link.click();
    URL.revokeObjectURL(url);
    setFormDownloaded(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resignation</h1>
          <p className="text-gray-600">Submit and manage resignation requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateResignationForm} className="gap-2">
            <DocumentArrowDownIcon className="w-5 h-5" />
            Download Form
          </Button>
          {!activeResignation && (
            <Button
              variant="outline"
              onClick={() => setShowResignModal(true)}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Submit Resignation
            </Button>
          )}
        </div>
      </div>

      {/* Form Download Info */}
      {formDownloaded && !activeResignation && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800">Form Downloaded Successfully</h4>
              <p className="text-sm text-blue-700 mt-1">
                Please fill out the downloaded form, get required signatures, and then submit your
                resignation online. You can also print the form for physical submission.
              </p>
              <Button size="sm" className="mt-3" onClick={() => setShowResignModal(true)}>
                Submit Resignation Online
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Active Resignation */}
      {activeResignation && (
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">Active Resignation Request</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Status: {activeResignation.status} | Last working date:{' '}
                  {format(parseISO(activeResignation.lastWorkingDate), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-amber-600 mt-1">Reason: {activeResignation.reason}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(activeResignation.status)}
              {activeResignation.status === 'Approved' && !activeResignation.exitSurvey && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedResignation(activeResignation);
                    setShowSurveyModal(true);
                  }}
                  className="gap-1"
                >
                  <ClipboardDocumentCheckIcon className="w-4 h-4" />
                  Exit Survey
                </Button>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-6 pt-6 border-t border-amber-200">
            <div className="flex items-center justify-between">
              {[
                { label: 'Submitted', done: true },
                { label: 'HR Review', done: activeResignation.status !== 'Pending' },
                { label: 'Exit Survey', done: !!activeResignation.exitSurvey },
                { label: 'Handover', done: activeResignation.handoverStatus === 'completed' },
                { label: 'Completed', done: activeResignation.status === 'Completed' },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.done ? <CheckCircleIcon className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className="text-xs text-gray-600 mt-1">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Resignation History */}
      <Card title="Resignation History">
        {myResignations.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No resignation history</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myResignations.map((resignation) => (
              <div
                key={resignation.id}
                className="border rounded-xl p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">Resignation Request</h4>
                      {getStatusBadge(resignation.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{resignation.reason}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span>Applied: {format(parseISO(resignation.appliedOn), 'MMM d, yyyy')}</span>
                      <span>
                        Last Day: {format(parseISO(resignation.lastWorkingDate), 'MMM d, yyyy')}
                      </span>
                      <span>Notice: {resignation.noticePeriod} days</span>
                    </div>
                  </div>
                  {resignation.exitSurvey && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm">Survey Completed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Important Notice */}
      <Card className="bg-gray-50">
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-gray-400 mt-1" />
          <div>
            <h4 className="font-medium text-gray-900">Important Information</h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>• Standard notice period is 30 days (may vary by contract)</li>
              <li>• Complete the exit survey to help us improve</li>
              <li>• Ensure proper handover of all responsibilities</li>
              <li>• Return all university property before last working day</li>
              <li>• Collect clearance certificate from HR</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Resignation Modal */}
      <Modal
        isOpen={showResignModal}
        onClose={() => setShowResignModal(false)}
        title="Submit Resignation"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmitResignation)} className="space-y-6">
          <div className="p-4 bg-red-50 rounded-xl text-sm text-red-700">
            <p className="font-medium">Please consider carefully before proceeding.</p>
            <p className="mt-1">
              This action will initiate your resignation process. You can discuss with HR if you
              have any concerns.
            </p>
          </div>

          <FormField label="Primary Reason" error={errors.reason?.message} required>
            <select
              {...register('reason', { required: 'Please select a reason' })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a reason</option>
              <option value="Better Opportunity">Better Opportunity</option>
              <option value="Personal Reasons">Personal Reasons</option>
              <option value="Relocation">Relocation</option>
              <option value="Health Issues">Health Issues</option>
              <option value="Career Change">Career Change</option>
              <option value="Higher Studies">Higher Studies</option>
              <option value="Retirement">Retirement</option>
              <option value="Other">Other</option>
            </select>
          </FormField>

          <FormField label="Detailed Explanation" error={errors.detailedReason?.message}>
            <textarea
              {...register('detailedReason')}
              rows={4}
              placeholder="Please provide more details about your decision (optional)..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </FormField>

          <FormField label="Notice Period (days)" error={errors.noticePeriod?.message} required>
            <select
              {...register('noticePeriod', { required: 'Please select notice period' })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={15}>15 days</option>
              <option value={30}>30 days (Standard)</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowResignModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Submit Resignation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Exit Survey Modal */}
      <Modal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        title="Exit Survey"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Your feedback is valuable and will help us improve. Please take a moment to complete
            this survey.
          </p>

          {exitSurveyQuestions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">{question.question}</label>
              {renderSurveyField(question)}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSurveyModal(false)}>
              Skip for Now
            </Button>
            <Button onClick={handleSurveySubmit}>Submit Survey</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
