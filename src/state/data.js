import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  format,
  subDays,
  addDays,
  differenceInDays,
  parseISO,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

const today = new Date();

// Helper to generate IDs
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============ MATERNITY LEAVE VALIDATION FUNCTIONS ============

/**
 * Calculate probation end date given join date
 * @param {string} joinDate - Join date in 'yyyy-MM-dd' format
 * @param {number} probationMonths - Duration of probation in months (default: 6)
 * @returns {string} Probation end date in 'yyyy-MM-dd' format
 */
export const calculateProbationEndDate = (joinDate, probationMonths = 6) => {
  const joinDateObj = parseISO(joinDate);
  const endDate = addDays(joinDateObj, probationMonths * 30);
  return format(endDate, 'yyyy-MM-dd');
};

/**
 * Validate maternity leave eligibility based on employee status
 * @param {Object} employee - Employee object with gender and employmentStatus
 * @returns {Object} { eligible: boolean, reason: string }
 */
export const validateMaternityEligibility = (employee) => {
  if (!employee) {
    return { eligible: false, reason: 'Employee not found' };
  }

  // Check 1: Gender must be female
  if (employee.gender?.toLowerCase() !== 'female') {
    return { eligible: false, reason: 'Maternity leave is only available for female employees' };
  }

  // Check 2: Employment status must be confirmed
  if (employee.employmentStatus === 'probation') {
    const probationEndDate = employee.probationEndDate;
    if (probationEndDate) {
      return {
        eligible: false,
        reason: `You are currently on probation. Maternity leave will be available after probation ends on ${format(parseISO(probationEndDate), 'MMM d, yyyy')}`,
      };
    }
    return {
      eligible: false,
      reason:
        'Maternity leave is not available during probation period. Only confirmed employees can apply.',
    };
  }

  return { eligible: true, reason: 'Employee is eligible for maternity leave' };
};

/**
 * Validate maternity leave advance notice requirement (2 months = 60 days)
 * @param {string} expectedDeliveryDate - Expected delivery date in 'yyyy-MM-dd' format
 * @param {string} applicationDate - Application date in 'yyyy-MM-dd' format (default: today)
 * @returns {Object} { valid: boolean, daysInAdvance: number, minRequired: number }
 */
export const validateAdvanceNotice = (
  expectedDeliveryDate,
  applicationDate = format(today, 'yyyy-MM-dd'),
) => {
  const MIN_DAYS_ADVANCE = 60; // 2 months

  if (!expectedDeliveryDate) {
    return {
      valid: false,
      daysInAdvance: 0,
      minRequired: MIN_DAYS_ADVANCE,
      reason: 'Expected delivery date is required for maternity leave application',
    };
  }

  const daysInAdvance = differenceInDays(parseISO(expectedDeliveryDate), parseISO(applicationDate));

  if (daysInAdvance < MIN_DAYS_ADVANCE) {
    return {
      valid: false,
      daysInAdvance,
      minRequired: MIN_DAYS_ADVANCE,
      reason: `Maternity leave requires at least ${MIN_DAYS_ADVANCE} days advance notice. You have only ${daysInAdvance} days.`,
    };
  }

  return {
    valid: true,
    daysInAdvance,
    minRequired: MIN_DAYS_ADVANCE,
    reason: `Valid application with ${daysInAdvance} days advance notice`,
  };
};

// Faculties and Departments structure
export const faculties = {
  Computing: ['CS', 'IT', 'SE', 'AI'],
  Engineering: ['EE', 'ME', 'CE', 'CH'],
  Management: ['BBA', 'MBA', 'HRM', 'Finance'],
  Sciences: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
};

export const departments = Object.values(faculties).flat();

export const designations = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer',
  'Lab Engineer',
  'Research Assistant',
  'Administrative Officer',
  'HR Manager',
  'Registrar',
  'Dean',
  'HOD',
];

// Promotion hierarchy
export const promotionPath = {
  'Research Assistant': 'Lecturer',
  Lecturer: 'Senior Lecturer',
  'Senior Lecturer': 'Assistant Professor',
  'Assistant Professor': 'Associate Professor',
  'Associate Professor': 'Professor',
  'Lab Engineer': 'Senior Lab Engineer',
  'Administrative Officer': 'Senior Administrative Officer',
};

// Leave types with medical leave configuration
export const leaveTypes = [
  { id: 'annual', name: 'Annual Leave', days: 30, color: 'blue' },
  { id: 'sick', name: 'Sick Leave', days: 10, color: 'red' },
  { id: 'casual', name: 'Casual Leave', days: 10, color: 'purple' },
  {
    id: 'maternity',
    name: 'Maternity Leave',
    days: 90,
    color: 'pink',
    requiresDocuments: false,
    genderRestriction: 'female',
  },
  {
    id: 'medical',
    name: 'Medical Leave',
    days: 30,
    color: 'teal',
    requiresDocuments: true,
    approvalFlow: ['hod', 'vc', 'president'],
  },
  { id: 'unpaid', name: 'Unpaid Leave', days: 0, color: 'gray' },
];

// Special leave types (complementary leaves)
export const specialLeaveTypes = [
  { id: 'marriage', name: 'Marriage Leave', days: 3, color: 'green' },
  { id: 'hajj', name: 'Hajj Leave', days: 30, color: 'indigo' },
  { id: 'umrah', name: 'Umrah Leave', days: 14, color: 'indigo' },
  { id: 'msphd', name: 'MS/PhD Study Leave', days: 60, color: 'orange' },
  { id: 'other', name: 'Other Complementary Leave', days: 5, color: 'gray' },
];

// Attendance types beyond Absent
export const attendanceTypes = [
  { id: 'present', name: 'Present', color: 'green' },
  { id: 'absent', name: 'Absent', color: 'red' },
  { id: 'late', name: 'Late Arrival', color: 'yellow' },
  { id: 'approved_leave', name: 'Approved Leave', color: 'blue' },
  { id: 'official_duty', name: 'Official Duty', color: 'purple' },
  { id: 'special_leave', name: 'Special Leave', color: 'indigo' },
];

// Leave approval hierarchy
export const approvalHierarchy = {
  annual: ['hod', 'dean', 'hr'],
  sick: ['hod', 'dean', 'hr'],
  casual: ['hod', 'dean', 'hr'],
  maternity: ['hod', 'vc', 'president'],
  medical: ['hod', 'vc', 'president'],
  marriage: ['hod', 'hr'],
  hajj: ['hod', 'vc', 'president'],
  umrah: ['hod', 'hr'],
  msphd: ['hod', 'vc', 'president'],
  other: ['hod', 'hr'],
};

// ATS stages and selection board checkpoints
export const atsStages = [
  { id: 'applied', name: 'Applied' },
  { id: 'screening', name: 'Screening' },
  { id: 'shortlisted', name: 'Shortlisted' },
  { id: 'technical', name: 'Technical Interview' },
  { id: 'panel', name: 'Panel' },
  { id: 'selection_board', name: 'Selection Board' },
  { id: 'offer', name: 'Offer' },
  { id: 'hired', name: 'Hired' },
  { id: 'rejected', name: 'Rejected' },
];

export const selectionBoardWorkflow = {
  defaultMembers: ['hod', 'dean', 'hr'],
  requiredApprovals: 2,
  checklist: [
    'Qualification verification',
    'Experience validation',
    'Salary fitment and grade check',
    'Reference check initiated',
  ],
};

// Exit survey questions
export const exitSurveyQuestions = [
  {
    id: 'reason',
    question: 'Primary reason for leaving',
    type: 'select',
    options: [
      'Better Opportunity',
      'Personal Reasons',
      'Relocation',
      'Health Issues',
      'Career Change',
      'Retirement',
      'Higher Studies',
      'Other',
    ],
  },
  { id: 'satisfaction', question: 'Overall job satisfaction (1-5)', type: 'rating' },
  { id: 'management', question: 'Management satisfaction (1-5)', type: 'rating' },
  { id: 'workEnvironment', question: 'Work environment satisfaction (1-5)', type: 'rating' },
  { id: 'growth', question: 'Career growth opportunities (1-5)', type: 'rating' },
  { id: 'wouldRecommend', question: 'Would you recommend CECOS to others?', type: 'boolean' },
  { id: 'wouldReturn', question: 'Would you consider returning in the future?', type: 'boolean' },
  { id: 'feedback', question: 'Additional feedback or suggestions', type: 'textarea' },
];

// Initial mock data
// Base employees seed; enriched below with lifecycle/salary history
const baseEmployees = [
  {
    id: 'e1',
    code: 'EMP001',
    name: 'Alice Smith',
    email: 'alice@cecos.edu.pk',
    phone: '+92-321-1234567',
    gender: 'female',
    department: 'CS',
    faculty: 'Computing',
    designation: 'Senior Lecturer',
    joinDate: '2022-06-01',
    employmentStatus: 'confirmed',
    status: 'Active',
    salaryBase: 120000,
    bankAccount: 'HBL-123456789',
    cnic: '17301-1234567-1',
    address: '123 University Road, Peshawar',
    emergencyContact: '+92-321-9876543',
    leaveBalance: { annual: 18, sick: 8, casual: 8, medical: 30 }, // added medical, aligned with allowance
    dependents: [],
    qualifications: [],
    publications: [],
  },
  {
    id: 'e2',
    code: 'EMP002',
    name: 'Bob Ahmed',
    email: 'bob@cecos.edu.pk',
    phone: '+92-333-2345678',
    gender: 'male',
    department: 'HRM',
    faculty: 'Management',
    designation: 'HR Manager',
    joinDate: '2021-07-15',
    employmentStatus: 'confirmed',
    status: 'Active',
    salaryBase: 150000,
    bankAccount: 'MCB-987654321',
    cnic: '17301-2345678-2',
    address: '456 Hayatabad, Peshawar',
    emergencyContact: '+92-333-8765432',
    leaveBalance: { annual: 20, sick: 10, casual: 10, medical: 30 },
    dependents: [],
    qualifications: [],
    publications: [],
  },
  {
    id: 'e3',
    code: 'EMP003',
    name: 'Dr. Diana Prince',
    email: 'diana@cecos.edu.pk',
    phone: '+92-300-3456789',
    gender: 'female',
    department: 'BBA',
    faculty: 'Management',
    designation: 'Associate Professor',
    joinDate: '2020-08-01',
    employmentStatus: 'confirmed',
    status: 'Active',
    salaryBase: 200000,
    bankAccount: 'UBL-456789123',
    cnic: '17301-3456789-3',
    address: '789 University Town, Peshawar',
    emergencyContact: '+92-300-9876543',
    leaveBalance: { annual: 15, sick: 8, casual: 5, medical: 30 },
    dependents: [],
    qualifications: [],
    publications: [],
  },
  {
    id: 'e4',
    code: 'EMP004',
    name: 'Prof. Rashid Ali',
    email: 'rashid@cecos.edu.pk',
    phone: '+92-311-4567890',
    gender: 'male',
    department: 'CS',
    faculty: 'Computing',
    designation: 'Professor',
    joinDate: '2019-01-10',
    employmentStatus: 'confirmed',
    status: 'Active',
    salaryBase: 250000,
    bankAccount: 'ABL-321654987',
    cnic: '17301-4567890-4',
    address: '101 Saddar, Peshawar',
    emergencyContact: '+92-311-6543210',
    leaveBalance: { annual: 5, sick: 12, casual: 4, medical: 30 },
    dependents: [],
    qualifications: [],
    publications: [],
  },
  {
    id: 'e5',
    code: 'EMP005',
    name: 'Eng. Faraz Khan',
    email: 'faraz@cecos.edu.pk',
    phone: '+92-322-5678901',
    gender: 'male',
    department: 'EE',
    faculty: 'Engineering',
    designation: 'Lab Engineer',
    joinDate: '2023-03-15',
    employmentStatus: 'probation',
    probationEndDate: '2023-09-15',
    status: 'Active',
    salaryBase: 80000,
    bankAccount: 'HBL-789456123',
    cnic: '17301-5678901-5',
    address: '202 Cantt, Peshawar',
    emergencyContact: '+92-300-1098765',
    leaveBalance: { annual: 20, sick: 12, casual: 10, medical: 30 },
    dependents: [],
    qualifications: [],
    publications: [],
  },
  {
    id: 'e6',
    code: 'EMP006',
    name: 'Sana Malik',
    email: 'sana@cecos.edu.pk',
    phone: '+92-333-6789012',
    gender: 'female',
    department: 'Physics',
    faculty: 'Sciences',
    designation: 'Lecturer',
    joinDate: '2024-01-20',
    employmentStatus: 'probation',
    probationEndDate: '2024-07-20',
    status: 'Active',
    salaryBase: 90000,
    bankAccount: 'MCB-654987321',
    cnic: '17301-6789012-6',
    address: '303 Cantt, Peshawar',
    emergencyContact: '+92-322-2109876',
    leaveBalance: { annual: 20, sick: 12, casual: 10, medical: 30 },
    dependents: [],
    qualifications: [],
    publications: [],
  },
];

// Enrich base employees with versioned lifecycle and salary history
const initialEmployees = baseEmployees.map((emp, idx) => {
  const joinDate = emp.joinDate || format(today, 'yyyy-MM-dd');
  const baseSalary = emp.salaryBase || 0;

  const salaryHistory = [
    {
      id: generateId('sal'),
      type: 'base',
      amount: baseSalary,
      previousAmount: null,
      reason: 'Joining salary',
      effectiveDate: joinDate,
      reference: 'joining',
      createdAt: joinDate,
    },
  ];

  const lifecycle = [
    {
      id: generateId('life'),
      type: 'joining',
      title: 'Joining',
      effectiveDate: joinDate,
      meta: { designation: emp.designation, salary: baseSalary },
      createdAt: joinDate,
    },
  ];

  return {
    ...emp,
    salaryBase: baseSalary,
    salaryHistory: emp.salaryHistory || salaryHistory,
    lifecycle: emp.lifecycle || lifecycle,
    contract: emp.contract || {
      status: 'active',
      startDate: joinDate,
      endDate: emp.contractEndDate || null,
      renewals: [],
    },
    version: emp.version || 1,
    lastUpdated: emp.lastUpdated || joinDate,
  };
});

// Generate attendance for past 30 days
function generateAttendance() {
  const records = [];
  const statuses = ['Present', 'Present', 'Present', 'Late', 'Absent'];

  initialEmployees.forEach((emp) => {
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const dayOfWeek = subDays(today, i).getDay();

      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const clockIn = status === 'Absent' ? null : `08:${15 + Math.floor(Math.random() * 30)}`;
      const clockOut = status === 'Absent' ? null : `17:${45 + Math.floor(Math.random() * 15)}`;

      records.push({
        id: `att-${emp.id}-${date}`,
        employeeId: emp.id,
        date,
        clockIn,
        clockOut,
        status,
        workHours: status === 'Absent' ? 0 : 8 + Math.random(),
      });
    }
  });

  return records;
}

// Initial leaves data
const initialLeaves = [
  {
    id: 'l1',
    employeeId: 'e1',
    employeeName: 'Alice Smith',
    department: 'CS',
    faculty: 'Computing',
    type: 'annual',
    startDate: format(subDays(today, 5), 'yyyy-MM-dd'),
    endDate: format(subDays(today, 3), 'yyyy-MM-dd'),
    days: 3,
    reason: 'Family vacation',
    status: 'Approved',
    appliedOn: format(subDays(today, 10), 'yyyy-MM-dd'),
    reviewedBy: 'Dr. HOD',
    reviewedOn: format(subDays(today, 8), 'yyyy-MM-dd'),
    paidDays: null,
    unpaidDays: null,
    leaveCategory: null,
    approvalChain: [
      {
        role: 'hod',
        status: 'approved',
        by: 'Dr. HOD',
        date: format(subDays(today, 8), 'yyyy-MM-dd'),
        comment: null,
      },
      {
        role: 'dean',
        status: 'approved',
        by: 'Prof. Dean',
        date: format(subDays(today, 7), 'yyyy-MM-dd'),
        comment: null,
      },
      {
        role: 'hr',
        status: 'approved',
        by: 'HR Manager',
        date: format(subDays(today, 6), 'yyyy-MM-dd'),
        comment: null,
      },
    ],
  },
  {
    id: 'l2',
    employeeId: 'e3',
    employeeName: 'Dr. Diana Prince',
    department: 'BBA',
    faculty: 'Management',
    type: 'medical',
    startDate: format(subDays(today, 12), 'yyyy-MM-dd'),
    endDate: format(subDays(today, 8), 'yyyy-MM-dd'),
    days: 5,
    reason: 'Medical procedure',
    status: 'Approved',
    appliedOn: format(subDays(today, 15), 'yyyy-MM-dd'),
    reviewedBy: 'President',
    reviewedOn: format(subDays(today, 5), 'yyyy-MM-dd'),
    paidDays: 3,
    unpaidDays: 2,
    leaveCategory: 'medical',
    documents: [
      {
        id: 'doc1',
        name: 'Medical Certificate.pdf',
        file: '/mock/medical-cert.pdf',
        size: 125000,
        uploadedAt: format(subDays(today, 15), 'yyyy-MM-dd'),
      },
    ],
    approvalChain: [
      {
        role: 'hod',
        status: 'approved',
        by: 'Dr. HOD',
        date: format(subDays(today, 14), 'yyyy-MM-dd'),
        comment: 'Medical documents verified',
      },
      {
        role: 'vc',
        status: 'approved',
        by: 'Vice Chancellor',
        date: format(subDays(today, 10), 'yyyy-MM-dd'),
        comment: 'Recommended for approval',
      },
      {
        role: 'president',
        status: 'approved',
        by: 'President',
        date: format(subDays(today, 5), 'yyyy-MM-dd'),
        comment: 'Approved',
        paidDays: 3,
        unpaidDays: 2,
        leaveCategory: 'medical',
      },
    ],
  },
  {
    id: 'l3',
    employeeId: 'e4',
    employeeName: 'Prof. Rashid Ali',
    department: 'CS',
    faculty: 'Computing',
    type: 'sick',
    startDate: format(subDays(today, 4), 'yyyy-MM-dd'),
    endDate: format(subDays(today, 2), 'yyyy-MM-dd'),
    days: 3,
    reason: 'Flu',
    status: 'Pending',
    appliedOn: format(subDays(today, 5), 'yyyy-MM-dd'),
    paidDays: null,
    unpaidDays: null,
    leaveCategory: null,
    approvalChain: [
      { role: 'hod', status: 'pending', by: null, date: null, comment: null },
      { role: 'dean', status: 'pending', by: null, date: null, comment: null },
      { role: 'hr', status: 'pending', by: null, date: null, comment: null },
    ],
  },
];

// Initial attendance corrections
const initialAttendanceCorrections = [];

// Initial notifications
const initialNotifications = [
  {
    id: 'n1',
    userId: 'all',
    title: 'System Maintenance',
    message: 'The HR system will be under maintenance on Saturday 10 PM - 2 AM',
    type: 'info',
    read: false,
    createdAt: format(subDays(today, 1), 'yyyy-MM-dd HH:mm'),
  },
  {
    id: 'n2',
    userId: 'e1',
    title: 'Leave Approved',
    message: 'Your leave request has been forwarded to Dean',
    type: 'success',
    read: false,
    createdAt: format(today, 'yyyy-MM-dd HH:mm'),
  },
];

// Initial promotions
const initialPromotions = [
  {
    id: 'pr1',
    employeeId: 'e1',
    employeeName: 'Alice Smith',
    department: 'CS',
    faculty: 'Computing',
    currentDesignation: 'Senior Lecturer',
    requestedDesignation: 'Assistant Professor',
    justification: 'Completed PhD and published 5 research papers in reputed journals',
    status: 'Pending',
    appliedOn: format(subDays(today, 10), 'yyyy-MM-dd'),
    supportingDocuments: ['PhD Certificate', 'Research Publications'],
    committeeReview: null,
    hrDecision: null,
  },
];

// Initial resignations
const initialResignations = [
  {
    id: 'res1',
    employeeId: 'e6',
    employeeName: 'Sana Malik',
    department: 'Physics',
    faculty: 'Sciences',
    designation: 'Lecturer',
    reason: 'Higher studies abroad',
    noticePeriod: 60,
    lastWorkingDate: format(addDays(today, 30), 'yyyy-MM-dd'),
    status: 'Pending',
    appliedOn: format(subDays(today, 5), 'yyyy-MM-dd'),
    exitSurvey: null,
    hrApproval: null,
    handoverStatus: 'pending',
    exitInterview: null,
    exitDocuments: [],
  },
];

// Initial ex-employees
const initialExEmployees = [
  {
    id: 'alum1',
    employeeId: 'ex-e10',
    name: 'Dr. Rashid Khan',
    email: 'rashid.khan@gmail.com',
    department: 'EE',
    faculty: 'Engineering',
    designation: 'Associate Professor',
    joinDate: '2015-06-01',
    exitDate: format(subDays(today, 180), 'yyyy-MM-dd'),
    yearsOfService: 8,
    exitReason: 'Better Opportunity',
    exitInterview: null,
    exitDocuments: [],
    publications: [],
    exitSurvey: {
      reason: 'Better Opportunity',
      satisfaction: 4,
      management: 4,
      workEnvironment: 4,
      growth: 3,
      wouldRecommend: true,
      wouldReturn: true,
      feedback: 'Great institution, wonderful colleagues. Left for a senior position abroad.',
    },
  },
  {
    id: 'alum2',
    employeeId: 'ex-e11',
    name: 'Prof. Amina Bibi',
    email: 'amina.bibi@outlook.com',
    department: 'Chemistry',
    faculty: 'Sciences',
    designation: 'Professor',
    joinDate: '2010-03-15',
    exitDate: format(subDays(today, 365), 'yyyy-MM-dd'),
    yearsOfService: 14,
    exitReason: 'Retirement',
    exitInterview: null,
    exitDocuments: [],
    publications: [],
    exitSurvey: {
      reason: 'Retirement',
      satisfaction: 5,
      management: 5,
      workEnvironment: 5,
      growth: 4,
      wouldRecommend: true,
      wouldReturn: false,
      feedback: 'Wonderful career at CECOS. Will cherish the memories forever.',
    },
  },
];

// Announcements
const initialAnnouncements = [
  {
    id: 'ann1',
    title: 'Eid Holidays Schedule',
    message:
      'CECOS University will remain closed from June 28 to July 3 for Eid ul Adha. Wishing everyone a blessed Eid!',
    priority: 'high',
    targetAudience: 'all',
    createdBy: 'HR Department',
    createdAt: format(subDays(today, 2), 'yyyy-MM-dd HH:mm'),
    expiresAt: format(addDays(today, 10), 'yyyy-MM-dd'),
    isActive: true,
  },
  {
    id: 'ann2',
    title: 'Faculty Meeting Notice',
    message:
      'All faculty members are requested to attend the quarterly meeting on Friday at 2:00 PM in the main auditorium.',
    priority: 'medium',
    targetAudience: 'faculty',
    department: null,
    createdBy: 'HR Department',
    createdAt: format(subDays(today, 1), 'yyyy-MM-dd HH:mm'),
    expiresAt: format(addDays(today, 5), 'yyyy-MM-dd'),
    isActive: true,
  },
];

// Initial performance reviews (PAMS-like data)
const initialPerformanceReviews = [
  {
    id: generateId('prv'),
    employeeId: 'e1',
    period: '2025-Q2',
    reviewer: 'HOD CS',
    rating: 4.2, // overall rating out of 5
    kpis: {
      teaching: 4.5,
      research: 4.0,
      service: 4.0,
      punctuality: 4.3,
    },
    comments: 'Consistent performance; published 2 papers.',
    date: format(subDays(today, 90), 'yyyy-MM-dd'),
  },
  {
    id: generateId('prv'),
    employeeId: 'e3',
    period: '2025-Q2',
    reviewer: 'Dean Management',
    rating: 4.6,
    kpis: {
      teaching: 4.8,
      research: 4.7,
      service: 4.2,
      punctuality: 4.4,
    },
    comments: 'Strong research output and mentorship.',
    date: format(subDays(today, 88), 'yyyy-MM-dd'),
  },
];

const initialBulkIncrements = [];
const initialProfileRequests = [];
const initialCandidates = [
  {
    id: 'cand1',
    name: 'Adeel Rahman',
    email: 'adeel.rahman@example.com',
    phone: '+92-300-1111111',
    department: 'CS',
    role: 'Assistant Professor',
    stage: 'shortlisted',
    source: 'LinkedIn',
    appliedOn: format(subDays(today, 7), 'yyyy-MM-dd'),
    resumeUrl: 'https://drive.google.com/file/d/abc123',
    documents: [
      {
        id: 'doc1',
        name: 'CV.pdf',
        url: 'https://drive.google.com/file/d/abc123',
        type: 'resume',
        version: 1,
        storage: 'google-drive',
      },
    ],
    evaluations: [
      {
        stage: 'screening',
        by: 'HR Manager',
        score: 7.5,
        notes: 'Meets minimum criteria',
        date: format(subDays(today, 6), 'yyyy-MM-dd'),
      },
      {
        stage: 'technical',
        by: 'CS HOD',
        score: 8.2,
        notes: 'Good research portfolio and teaching demos',
        date: format(subDays(today, 3), 'yyyy-MM-dd'),
      },
    ],
    selectionBoard: {
      status: 'pending',
      members: ['hod', 'dean', 'hr'],
      approvals: [],
      checklist: selectionBoardWorkflow.checklist,
    },
    status: 'In Progress',
  },
];
const initialDocuments = [
  {
    id: 'doc-global-policy',
    title: 'HR Policy Handbook',
    owner: 'HR',
    type: 'policy',
    version: 3,
    storage: 'google-drive',
    link: 'https://drive.google.com/file/d/policy123',
    lastUpdated: format(subDays(today, 15), 'yyyy-MM-dd'),
    access: 'org',
    tags: ['policy', 'handbook'],
  },
];

// ============ DOCUMENT MANAGEMENT SCHEMA STANDARDIZATION ============
// All documents across the system should conform to this standardized schema
// for consistency and future Google Drive / backend storage integration
//
// STANDARDIZED DOCUMENT SCHEMA:
// {
//   id: string (unique identifier, e.g., 'doc-emp-123-cert-456'),
//   name: string (display name, e.g., 'PhD Certificate'),
//   title: string (optional, longer form title),
//   type: string ('policy', 'certificate', 'medical', 'resume', 'contract', 'publication', 'id_proof', 'qualification', 'award', 'other'),
//   owner: string (user/employee ID who owns/uploaded the document),
//   ownerName: string (display name of owner),
//   uploadDate: string (ISO date, e.g., '2024-12-29'),
//   expiryDate: string | null (ISO date for documents that expire, e.g., certifications),
//   tags: array<string> (e.g., ['certification', 'professional', 'mandatory']),
//   version: number (version number, incremented on each update),
//   storageRef: string (reference to storage location - Google Drive file ID, S3 key, or local path),
//   storageType: string ('google-drive', 's3', 'local', 'url'),
//   url: string (public/authenticated URL to access document),
//   size: number (file size in bytes),
//   mimeType: string (e.g., 'application/pdf', 'image/jpeg'),
//   metadata: object ({
//     entityType: string ('employee', 'leave', 'candidate', 'promotion', 'correction'),
//     entityId: string (ID of related entity, e.g., leave ID, employee ID),
//     uploadedBy: string (user ID who uploaded),
//     isVerified: boolean (HR verification flag),
//     verifiedBy: string | null (HR user ID),
//     verifiedAt: string | null (ISO timestamp)
//   }),
//   access: string ('private', 'employee', 'hr', 'manager', 'org'),
//   status: string ('active', 'archived', 'expired', 'replaced'),
//   previousVersion: string | null (ID of previous version if replaced)
// }
//
// DOCUMENT TYPES MAPPING:
// - Employee Profile: 'id_proof', 'qualification', 'certification', 'publication', 'award'
// - Leave Applications: 'medical', 'supporting_document'
// - Attendance Corrections: 'screenshot', 'email', 'supporting_document'
// - Recruitment: 'resume', 'cover_letter', 'reference', 'transcript'
// - Promotions: 'certificate', 'publication', 'achievement'
// - Resignations: 'resignation_letter', 'handover_checklist', 'exit_survey'
// - HR Policies: 'policy', 'handbook', 'form_template'
//
// INTEGRATION POINTS:
// - Google Drive API: Use storageType: 'google-drive', storageRef: fileId
// - Backend Upload API: POST /api/documents/upload (multipart/form-data)
// - Document Retrieval: GET /api/documents/:id/download (authenticated)
// - Version Control: POST /api/documents/:id/versions (upload new version)
// - Expiry Tracking: Background job checks expiryDate daily, flags expired docs
//
// MIGRATION PATH:
// - Existing documents with inconsistent schemas should be migrated to this format
// - Fields like 'file', 'uploadedAt', 'link' should map to standardized fields
// - Add metadata.entityType and metadata.entityId for relationship tracking
//
const initialPayrollSettings = {
  workingDays: 22,
  allowanceConfig: {
    housePercent: 45,
    medicalPercent: 10,
    transportFixed: 5000,
  },
  deductionConfig: {
    latePenalty: 500,
    absentPenaltyType: 'daily_rate',
    absentPenaltyValue: 0,
    taxThreshold: 100000,
    taxRate: 5,
  },
  overtimeRate: 1.5,
  operationalConfig: {
    overtimeWarningHours: 40,
    expiryHorizonDays: 30,
  },
};

const initialPayrollRuns = [];

const appendLifecycleEvent = (employee, event) => {
  const lifecycle = [...(employee.lifecycle || []), { ...event, id: generateId('life') }];
  return {
    ...employee,
    lifecycle,
    version: (employee.version || 1) + 1,
    lastUpdated: event.effectiveDate || format(today, 'yyyy-MM-dd'),
  };
};

const appendSalaryHistory = (employee, record) => {
  const effectiveDate = record.effectiveDate || format(today, 'yyyy-MM-dd');
  const salaryHistory = [
    ...(employee.salaryHistory || []),
    {
      id: generateId('sal'),
      previousAmount: employee.salaryBase || 0,
      amount: record.amount,
      type: record.type || 'adjustment',
      reason: record.reason || 'Salary update',
      effectiveDate,
      reference: record.reference || null,
      createdAt: format(today, 'yyyy-MM-dd'),
      createdBy: record.createdBy || 'system',
    },
  ];

  return {
    ...employee,
    salaryBase: record.amount,
    salaryHistory,
    version: (employee.version || 1) + 1,
    lastUpdated: effectiveDate,
  };
};

const calculatePayrollItem = (employee, monthAttendance, period, settings, exceptions = []) => {
  const workingDays = settings?.workingDays || 22;
  const baseSalary = employee.salaryBase || 0;

  const presentDays = monthAttendance.filter((a) => a.status === 'Present').length;
  const lateDays = monthAttendance.filter((a) => a.status === 'Late').length;
  const absentDays = monthAttendance.filter((a) => a.status === 'Absent').length;

  const allowanceConfig = settings?.allowanceConfig || {};
  const deductionConfig = settings?.deductionConfig || {};

  const houseAllowance = Math.round(baseSalary * ((allowanceConfig.housePercent || 0) / 100));
  const medicalAllowance = Math.round(baseSalary * ((allowanceConfig.medicalPercent || 0) / 100));
  const transportAllowance = Math.round(allowanceConfig.transportFixed || 0);
  const allowancesTotal = houseAllowance + medicalAllowance + transportAllowance;

  const lateDeduction = Math.round(lateDays * (deductionConfig.latePenalty || 0));
  const absentDeduction = (() => {
    if (deductionConfig.absentPenaltyType === 'none') return 0;
    if (deductionConfig.absentPenaltyType === 'fixed') {
      return Math.round(absentDays * (deductionConfig.absentPenaltyValue || 0));
    }
    // default to daily rate
    return Math.round((baseSalary / workingDays) * absentDays);
  })();

  const taxableBase = baseSalary + allowancesTotal;
  const taxThreshold = deductionConfig.taxThreshold || 0;
  const taxRate = deductionConfig.taxRate || 0;
  const taxDeduction = taxableBase > taxThreshold ? Math.round(taxableBase * (taxRate / 100)) : 0;

  const deductionsTotal = lateDeduction + absentDeduction + taxDeduction;
  const gross = baseSalary + allowancesTotal;
  const net = gross - deductionsTotal;

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    designation: employee.designation,
    baseSalary,
    period,
    attendance: { present: presentDays, late: lateDays, absent: absentDays },
    earnings: {
      basic: baseSalary,
      house: houseAllowance,
      medical: medicalAllowance,
      transport: transportAllowance,
      total: gross,
    },
    deductions: {
      late: lateDeduction,
      absent: absentDeduction,
      tax: taxDeduction,
      total: deductionsTotal,
    },
    netPay: net,
    status: 'Draft',
    exceptions,
  };
};

export const useDataStore = create(
  persist(
    (set, get) => ({
      employees: initialEmployees,
      attendance: generateAttendance(),
      leaves: initialLeaves,
      notifications: initialNotifications,
      promotions: initialPromotions,
      resignations: initialResignations,
      exEmployees: initialExEmployees,
      announcements: initialAnnouncements,
      bulkIncrements: initialBulkIncrements,
      profileUpdateRequests: initialProfileRequests,
      candidates: initialCandidates,
      documents: initialDocuments,
      payrollSettings: initialPayrollSettings,
      payrollRuns: initialPayrollRuns,
      attendanceCorrections: initialAttendanceCorrections,
      performanceReviews: initialPerformanceReviews,
      candidates: initialCandidates,
      documents: initialDocuments,

      // Employee actions
      addEmployee: (emp) =>
        set((s) => {
          const joinDate = emp.joinDate || format(today, 'yyyy-MM-dd');
          const probationEndDate =
            emp.employmentStatus === 'probation' && joinDate
              ? calculateProbationEndDate(joinDate)
              : null;
          const baseSalary = parseInt(emp.salaryBase, 10) || 0;
          const employeeId = generateId('e');
          const code = emp.code || `EMP${String(s.employees.length + 1).padStart(3, '0')}`;

          const skeleton = {
            ...emp,
            id: employeeId,
            code,
            status: 'Active',
            leaveBalance: { annual: 20, sick: 12, casual: 10, medical: 30 },
            probationEndDate,
            gender: emp.gender || 'male',
            employmentStatus: emp.employmentStatus || 'confirmed',
            salaryBase: baseSalary,
            salaryHistory: [],
            lifecycle: [],
            contract: {
              status: 'active',
              startDate: joinDate,
              endDate: emp.contractEndDate || null,
              renewals: [],
            },
            version: 1,
            lastUpdated: joinDate,
          };

          const withLifecycle = appendLifecycleEvent(skeleton, {
            type: 'joining',
            title: 'Joining',
            effectiveDate: joinDate,
            meta: { designation: skeleton.designation, salary: baseSalary },
            createdAt: joinDate,
          });

          const withSalary = appendSalaryHistory(
            { ...withLifecycle, salaryBase: 0 },
            {
              amount: baseSalary,
              type: 'base',
              reason: 'Joining salary',
              effectiveDate: joinDate,
              createdBy: 'HR',
            },
          );

          return {
            employees: [...s.employees, withSalary],
          };
        }),

      updateEmployee: (id, updates) =>
        set((s) => ({
          employees: s.employees.map((e) => {
            if (e.id !== id) return e;

            const hasSalaryChange =
              updates.salaryBase !== undefined && updates.salaryBase !== e.salaryBase;

            if (hasSalaryChange) {
              const updated = appendSalaryHistory(e, {
                amount: updates.salaryBase,
                type: updates.salaryChangeType || 'revision',
                reason: updates.salaryChangeReason || 'Salary revision',
                effectiveDate: updates.effectiveDate || format(today, 'yyyy-MM-dd'),
                reference: updates.reference || null,
                createdBy: updates.updatedBy || 'HR',
              });

              return {
                ...updated,
                ...updates,
                salaryChangeType: undefined,
                salaryChangeReason: undefined,
                reference: undefined,
              };
            }

            return {
              ...e,
              ...updates,
              version: (e.version || 1) + 1,
              lastUpdated: format(today, 'yyyy-MM-dd'),
            };
          }),
        })),

      deleteEmployee: (id) =>
        set((s) => ({
          employees: s.employees.filter((e) => e.id !== id),
        })),

      getEmployee: (id) => get().employees.find((e) => e.id === id),

      getEmployeesByDepartment: (dept) => get().employees.filter((e) => e.department === dept),

      getEmployeesByFaculty: (faculty) => get().employees.filter((e) => e.faculty === faculty),

      // Attendance actions
      clockIn: (employeeId) => {
        const now = new Date();
        const dateStr = format(now, 'yyyy-MM-dd');
        const timeStr = format(now, 'HH:mm');
        const isLate = now.getHours() >= 9 || (now.getHours() === 9 && now.getMinutes() > 0);

        set((s) => ({
          attendance: [
            ...s.attendance,
            {
              id: generateId('att'),
              employeeId,
              date: dateStr,
              clockIn: timeStr,
              clockOut: null,
              status: isLate ? 'Late' : 'Present',
              workHours: 0,
            },
          ],
        }));
      },

      clockOut: (employeeId) => {
        const now = new Date();
        const dateStr = format(now, 'yyyy-MM-dd');
        const timeStr = format(now, 'HH:mm');

        set((s) => ({
          attendance: s.attendance.map((a) =>
            a.employeeId === employeeId && a.date === dateStr
              ? { ...a, clockOut: timeStr, workHours: 8 }
              : a,
          ),
        }));
      },

      getTodayAttendance: (employeeId) => {
        const dateStr = format(today, 'yyyy-MM-dd');
        return get().attendance.find((a) => a.employeeId === employeeId && a.date === dateStr);
      },

      getAttendanceByEmployee: (employeeId) =>
        get().attendance.filter((a) => a.employeeId === employeeId),

      getAttendanceByDate: (date) => get().attendance.filter((a) => a.date === date),

      // Leave actions
      addLeave: (leave) => {
        const employee = get().getEmployee(leave.employeeId);
        set((s) => ({
          leaves: [
            ...s.leaves,
            {
              ...leave,
              id: generateId('l'),
              employeeName: employee?.name,
              department: employee?.department,
              faculty: employee?.faculty,
              status: 'Pending',
              appliedOn: format(today, 'yyyy-MM-dd'),
              paidDays: leave.paidDays ?? null,
              unpaidDays: leave.unpaidDays ?? null,
              leaveCategory: leave.leaveCategory ?? null,
              approvalChain:
                leave.type === 'medical'
                  ? [
                      { role: 'hod', status: 'pending', by: null, date: null, comment: null },
                      { role: 'vc', status: 'pending', by: null, date: null, comment: null },
                      {
                        role: 'president',
                        status: 'pending',
                        by: null,
                        date: null,
                        comment: null,
                        paidDays: null,
                        unpaidDays: null,
                        leaveCategory: null,
                      },
                    ]
                  : [
                      { role: 'hod', status: 'pending', by: null, date: null, comment: null },
                      { role: 'dean', status: 'pending', by: null, date: null, comment: null },
                      { role: 'hr', status: 'pending', by: null, date: null, comment: null },
                    ],
            },
          ],
        }));
      },

      updateLeaveStatus: (
        leaveId,
        newStatus,
        approverRole,
        approverName,
        comments = '',
        metadata = {},
      ) => {
        set((state) => {
          const normalizedRole = approverRole;
          const leaves = state.leaves.map((leave) => {
            if (leave.id !== leaveId) return leave;

            const now = new Date().toISOString();
            let updatedLeave = { ...leave };

            // Initialize approval chain based on leave type
            if (!updatedLeave.approvalChain) {
              if (leave.type === 'medical') {
                // Medical leave: HOD → VC → President
                updatedLeave.approvalChain = [
                  { role: 'hod', status: 'pending', by: null, date: null, comment: null },
                  { role: 'vc', status: 'pending', by: null, date: null, comment: null },
                  {
                    role: 'president',
                    status: 'pending',
                    by: null,
                    date: null,
                    comment: null,
                    paidDays: null,
                    unpaidDays: null,
                    leaveCategory: null,
                  },
                ];
              } else {
                // Other leaves: HOD → Dean → HR
                updatedLeave.approvalChain = [
                  { role: 'hod', status: 'pending', by: null, date: null, comment: null },
                  {
                    role: 'dean',
                    status: 'pending',
                    by: null,
                    date: null,
                    comment: null,
                    paidDays: null,
                    unpaidDays: null,
                  },
                  { role: 'hr', status: 'pending', by: null, date: null, comment: null },
                ];
              }
            }

            // Find current step
            const currentStepIndex = updatedLeave.approvalChain.findIndex(
              (step) => step.role === normalizedRole,
            );

            if (currentStepIndex === -1) return leave;

            // Update current step
            updatedLeave.approvalChain[currentStepIndex] = {
              ...updatedLeave.approvalChain[currentStepIndex],
              status: newStatus.toLowerCase(),
              by: approverName,
              date: now,
              comment: comments || null,
            };

            // President's paid/unpaid split and categorization for medical leave
            if (
              leave.type === 'medical' &&
              normalizedRole === 'president' &&
              newStatus === 'Approved'
            ) {
              if (metadata.paidDays !== undefined) {
                updatedLeave.approvalChain[currentStepIndex].paidDays = metadata.paidDays;
                updatedLeave.approvalChain[currentStepIndex].unpaidDays = metadata.unpaidDays;
                updatedLeave.paidDays = metadata.paidDays;
                updatedLeave.unpaidDays = metadata.unpaidDays;
              }
              if (metadata.leaveCategory) {
                updatedLeave.approvalChain[currentStepIndex].leaveCategory = metadata.leaveCategory;
                updatedLeave.leaveCategory = metadata.leaveCategory;
              }
            }

            // Dean's paid/unpaid split for non-medical leaves
            if (approverRole === 'dean' && metadata.paidDays !== undefined) {
              updatedLeave.approvalChain[currentStepIndex].paidDays = metadata.paidDays;
              updatedLeave.approvalChain[currentStepIndex].unpaidDays = metadata.unpaidDays;
              updatedLeave.paidDays = metadata.paidDays;
              updatedLeave.unpaidDays = metadata.unpaidDays;
            }

            // HR's medical categorization for non-medical flow
            if (approverRole === 'hr' && metadata.leaveCategory) {
              updatedLeave.leaveCategory = metadata.leaveCategory;
            }

            if (newStatus === 'Rejected') {
              updatedLeave.status = 'Rejected';
              updatedLeave.reviewedBy = approverName;
              updatedLeave.reviewedOn = now;
              updatedLeave.comments = comments;
            } else if (newStatus === 'Approved') {
              const nextPendingStep = updatedLeave.approvalChain.find(
                (step, idx) => idx > currentStepIndex && step.status === 'pending',
              );

              if (nextPendingStep) {
                updatedLeave.status = 'Forwarded';
                updatedLeave.currentApprover = nextPendingStep.role;
              } else {
                updatedLeave.status = 'Approved';
                updatedLeave.reviewedBy = approverName;
                updatedLeave.reviewedOn = now;
              }

              if (comments) {
                updatedLeave.comments = comments;
              }
            }

            return updatedLeave;
          });

          return { leaves };
        });
      },

      getLeavesByEmployee: (employeeId) => get().leaves.filter((l) => l.employeeId === employeeId),

      getLeavesByDepartment: (dept) => get().leaves.filter((l) => l.department === dept),

      getLeavesByFaculty: (faculty) => get().leaves.filter((l) => l.faculty === faculty),

      getPendingLeaves: () =>
        get().leaves.filter((l) => l.status === 'Pending' || l.status === 'Forwarded'),

      // Notification actions
      addNotification: (notification) =>
        set((s) => ({
          notifications: [
            {
              ...notification,
              id: generateId('n'),
              read: false,
              createdAt: format(today, 'yyyy-MM-dd HH:mm'),
            },
            ...s.notifications,
          ],
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      getNotifications: (userId) =>
        get().notifications.filter((n) => n.userId === userId || n.userId === 'all'),

      getUnreadCount: (userId) =>
        get().notifications.filter((n) => !n.read && (n.userId === userId || n.userId === 'all'))
          .length,

      // ============ EMAIL NOTIFICATION FRAMEWORK (ARCHITECTURE) ============
      // This framework is designed for backend integration - frontend structure is ready
      //
      // EMAIL NOTIFICATION EVENTS SUPPORTED:
      // - leave_approved, leave_rejected, leave_forwarded
      // - attendance_correction_approved, attendance_correction_rejected
      // - probation_completion (30 days before, 7 days before, on completion)
      // - contract_expiry_warning (30 days before, 7 days before)
      // - maternity_leave_milestone (start, midpoint, end)
      // - promotion_approved, promotion_rejected
      // - profile_update_approved, profile_update_rejected
      // - resignation_acknowledgment, resignation_handover_reminder
      // - selection_board_scheduled, selection_board_outcome
      //
      // NOTIFICATION PREFERENCE SCHEMA (to be stored per user):
      // {
      //   userId: string,
      //   preferences: {
      //     leave_approved: { email: true, inApp: true },
      //     leave_rejected: { email: true, inApp: true },
      //     attendance_correction_approved: { email: true, inApp: true },
      //     probation_completion: { email: true, inApp: true },
      //     contract_expiry_warning: { email: true, inApp: true },
      //     ... (all event types)
      //   }
      // }
      //
      // BACKEND API CONTRACTS:
      // POST /api/notifications/send
      // {
      //   eventType: string (e.g., 'leave_approved'),
      //   recipientId: string (employee/user ID),
      //   recipientEmail: string,
      //   data: {
      //     leaveId?: string,
      //     employeeName?: string,
      //     leaveType?: string,
      //     startDate?: string,
      //     endDate?: string,
      //     reason?: string,
      //     ... (event-specific data)
      //   }
      // }
      //
      // RESPONSE:
      // {
      //   success: boolean,
      //   emailId: string (tracking ID for audit),
      //   sentAt: string (ISO timestamp)
      // }
      //
      // POST /api/notifications/preferences
      // { userId: string, preferences: object }
      //
      // GET /api/notifications/preferences/:userId
      // Returns: { userId, preferences }
      //
      // EMAIL TEMPLATE VARIABLES:
      // - {{employeeName}}, {{leaveType}}, {{startDate}}, {{endDate}}
      // - {{approverName}}, {{status}}, {{comments}}, {{actionUrl}}
      // - All templates should include unsubscribe link and CECOS branding
      //
      // IMPLEMENTATION NOTE:
      // Replace in-app notification calls with dual notifications:
      // addNotification({ ... }) + sendEmailNotification({ eventType, recipientId, data })
      //
      notificationPreferences: {}, // Future: userId -> preferences map

      // Placeholder for email service integration
      sendEmailNotification: (eventType, recipientId, data) => {
        // TO BE IMPLEMENTED WITH BACKEND
        // This function will POST to /api/notifications/send
        // For now, log the event for debugging
        console.log('[EMAIL NOTIFICATION]', {
          eventType,
          recipientId,
          data,
          timestamp: new Date().toISOString(),
        });
        // Future: return fetch('/api/notifications/send', { method: 'POST', body: JSON.stringify(...) })
      },

      updateNotificationPreferences: (userId, preferences) => {
        // TO BE IMPLEMENTED WITH BACKEND
        // For now, store locally in memory
        set((s) => ({
          notificationPreferences: {
            ...s.notificationPreferences,
            [userId]: preferences,
          },
        }));
        console.log('[NOTIFICATION PREFERENCES UPDATED]', { userId, preferences });
        // Future: POST to /api/notifications/preferences
      },

      getNotificationPreferences: (userId) => {
        const prefs = get().notificationPreferences[userId];
        if (prefs) return prefs;
        // Default preferences: all events enabled for email and in-app
        return {
          leave_approved: { email: true, inApp: true },
          leave_rejected: { email: true, inApp: true },
          attendance_correction_approved: { email: true, inApp: true },
          attendance_correction_rejected: { email: true, inApp: true },
          probation_completion: { email: true, inApp: true },
          contract_expiry_warning: { email: true, inApp: true },
          maternity_leave_milestone: { email: true, inApp: true },
          promotion_approved: { email: true, inApp: true },
          resignation_acknowledgment: { email: true, inApp: true },
        };
      },

      // ============ PROMOTION ACTIONS ============
      addPromotion: (promotion) => {
        const employee = get().getEmployee(promotion.employeeId);
        const effectiveDate = promotion.effectiveDate || format(today, 'yyyy-MM-dd');
        const proposedSalary =
          promotion.proposedSalary !== undefined ? promotion.proposedSalary : employee?.salaryBase;

        set((s) => ({
          promotions: [
            ...s.promotions,
            {
              ...promotion,
              id: generateId('pr'),
              employeeName: employee?.name,
              department: employee?.department,
              faculty: employee?.faculty,
              currentDesignation: employee?.designation,
              effectiveDate,
              proposedSalary,
              status: 'Pending',
              appliedOn: format(new Date(), 'yyyy-MM-dd'),
              committeeReview: null,
              hrDecision: null,
            },
          ],
        }));
      },

      updatePromotionStatus: (id, status, decision) =>
        set((s) => ({
          promotions: s.promotions.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status,
                  ...(decision.type === 'committee' && { committeeReview: decision }),
                  ...(decision.type === 'hr' && { hrDecision: decision }),
                }
              : p,
          ),
        })),

      approvePromotion: (id, meta = {}) => {
        const promotion = get().promotions.find((p) => p.id === id);
        if (promotion) {
          const employee = get().getEmployee(promotion.employeeId);
          const effectiveDate =
            meta.effectiveDate || promotion.effectiveDate || format(today, 'yyyy-MM-dd');
          const newSalary =
            meta.newSalary !== undefined
              ? meta.newSalary
              : promotion.proposedSalary !== undefined
                ? promotion.proposedSalary
                : employee?.salaryBase;

          set((s) => ({
            employees: s.employees.map((e) => {
              if (e.id !== promotion.employeeId) return e;

              const withSalary = appendSalaryHistory(e, {
                amount: newSalary,
                type: 'promotion',
                reason: `Promotion to ${promotion.requestedDesignation}`,
                effectiveDate,
                reference: promotion.id,
                createdBy: meta.decidedBy || 'HR',
              });

              const withLifecycle = appendLifecycleEvent(withSalary, {
                type: 'promotion',
                title: `Promotion to ${promotion.requestedDesignation}`,
                effectiveDate,
                meta: {
                  from: promotion.currentDesignation,
                  to: promotion.requestedDesignation,
                  salary: newSalary,
                },
                createdAt: effectiveDate,
              });

              return { ...withLifecycle, designation: promotion.requestedDesignation };
            }),
            promotions: s.promotions.map((p) =>
              p.id === id
                ? {
                    ...p,
                    status: 'Approved',
                    approvedOn: format(new Date(), 'yyyy-MM-dd'),
                    effectiveDate,
                    approvedSalary: newSalary,
                    hrDecision: {
                      type: 'hr',
                      decidedBy: meta.decidedBy || 'HR',
                      date: format(new Date(), 'yyyy-MM-dd'),
                      notes: meta.notes || null,
                    },
                  }
                : p,
            ),
          }));
        }
      },

      getPromotionsByEmployee: (employeeId) =>
        get().promotions.filter((p) => p.employeeId === employeeId),

      getPendingPromotions: () =>
        get().promotions.filter((p) => p.status === 'Pending' || p.status === 'Under Review'),

      // ============ SALARY & CONTRACT ACTIONS ============
      reviseSalary: (employeeId, amount, meta = {}) =>
        set((s) => ({
          employees: s.employees.map((e) =>
            e.id === employeeId
              ? appendSalaryHistory(e, {
                  amount,
                  type: meta.type || 'revision',
                  reason: meta.reason || 'Salary revision',
                  effectiveDate: meta.effectiveDate || format(today, 'yyyy-MM-dd'),
                  reference: meta.reference || null,
                  createdBy: meta.updatedBy || 'HR',
                })
              : e,
          ),
        })),

      addLifecycleEntry: (employeeId, event) =>
        set((s) => ({
          employees: s.employees.map((e) =>
            e.id === employeeId
              ? appendLifecycleEvent(e, {
                  ...event,
                  effectiveDate: event.effectiveDate || format(today, 'yyyy-MM-dd'),
                })
              : e,
          ),
        })),

      renewContract: (employeeId, renewal) =>
        set((s) => ({
          employees: s.employees.map((e) => {
            if (e.id !== employeeId) return e;
            const renewals = [
              ...(e.contract?.renewals || []),
              { ...renewal, id: generateId('ren') },
            ];
            const updated = {
              ...e,
              contract: {
                ...(e.contract || {}),
                status: renewal.status || e.contract?.status || 'active',
                endDate: renewal.newEndDate || e.contract?.endDate || null,
                renewals,
              },
            };

            return appendLifecycleEvent(updated, {
              type: 'contract',
              title: 'Contract Renewal',
              effectiveDate: renewal.effectiveDate || renewal.newEndDate,
              meta: {
                previousEndDate: e.contract?.endDate || null,
                newEndDate: renewal.newEndDate || null,
              },
            });
          }),
        })),

      // ============ BULK INCREMENT ACTIONS ============
      createBulkIncrementBatch: (payload) =>
        set((s) => {
          const effectiveDate = payload.effectiveDate || format(today, 'yyyy-MM-dd');
          const targetEmployees =
            payload.employeeIds && payload.employeeIds.length > 0
              ? s.employees.filter((e) => payload.employeeIds.includes(e.id))
              : s.employees;

          const batchId = generateId('inc');
          const items = targetEmployees.map((emp) => {
            const previousSalary = emp.salaryBase || 0;
            const newSalary =
              payload.mode === 'percent'
                ? Math.round(previousSalary * (1 + (payload.value || 0) / 100))
                : previousSalary + (payload.value || 0);

            return {
              employeeId: emp.id,
              employeeName: emp.name,
              previousSalary,
              newSalary,
              status: 'pending',
            };
          });

          const audit = [
            {
              action: 'created',
              by: payload.createdBy || 'HR',
              date: format(new Date(), 'yyyy-MM-dd'),
              note: payload.note || null,
            },
          ];

          return {
            bulkIncrements: [
              {
                id: batchId,
                code: payload.code || batchId.toUpperCase(),
                title: payload.title || 'Bulk Increment',
                type: payload.type || 'Adjustment',
                mode: payload.mode || 'percent',
                value: payload.value || 0,
                effectiveDate,
                note: payload.note || null,
                status: 'Pending',
                items,
                audit,
              },
              ...s.bulkIncrements,
            ],
          };
        }),

      applyBulkIncrementBatch: (batchId, meta = {}) =>
        set((s) => {
          const batch = s.bulkIncrements.find((b) => b.id === batchId);
          if (!batch || batch.status === 'Applied') return {};

          const effectiveDate = batch.effectiveDate || format(today, 'yyyy-MM-dd');

          const employees = s.employees.map((e) => {
            const item = batch.items.find((i) => i.employeeId === e.id);
            if (!item) return e;

            const withSalary = appendSalaryHistory(e, {
              amount: item.newSalary,
              type: 'increment',
              reason: `${batch.type} increment`,
              effectiveDate,
              reference: batch.id,
              createdBy: meta.approvedBy || 'HR',
            });

            return appendLifecycleEvent(withSalary, {
              type: 'increment',
              title: `${batch.type} increment`,
              effectiveDate,
              meta: {
                from: item.previousSalary,
                to: item.newSalary,
                batch: batch.code,
              },
            });
          });

          const updatedBatch = {
            ...batch,
            status: 'Applied',
            appliedOn: format(new Date(), 'yyyy-MM-dd'),
            audit: [
              ...(batch.audit || []),
              {
                action: 'applied',
                by: meta.approvedBy || 'HR',
                date: format(new Date(), 'yyyy-MM-dd'),
                note: meta.note || null,
              },
            ],
            items: batch.items.map((i) => ({ ...i, status: 'applied' })),
          };

          return {
            employees,
            bulkIncrements: s.bulkIncrements.map((b) => (b.id === batchId ? updatedBatch : b)),
          };
        }),

      // ============ PROFILE UPDATE REQUESTS ============
      submitProfileUpdateRequest: (employeeId, changes, meta = {}) => {
        const employee = get().getEmployee(employeeId);
        const request = {
          id: generateId('pur'),
          employeeId,
          employeeName: employee?.name,
          department: employee?.department,
          requestedOn: format(new Date(), 'yyyy-MM-dd'),
          status: 'Pending',
          changes,
          notes: meta.notes || null,
          requestedBy: meta.requestedBy || employee?.name || 'Employee',
          audit: [
            {
              action: 'submitted',
              by: meta.requestedBy || employee?.name || 'Employee',
              date: format(new Date(), 'yyyy-MM-dd'),
              note: meta.notes || null,
            },
          ],
        };

        set((s) => ({ profileUpdateRequests: [request, ...s.profileUpdateRequests] }));
      },

      reviewProfileUpdateRequest: (id, decision) =>
        set((s) => {
          const request = s.profileUpdateRequests.find((r) => r.id === id);
          if (!request) return {};

          const status = decision.status;
          const reviewedOn = format(new Date(), 'yyyy-MM-dd');

          let employees = s.employees;

          if (status === 'Approved') {
            employees = s.employees.map((e) => {
              if (e.id !== request.employeeId) return e;
              const updated = {
                ...e,
                ...request.changes,
                version: (e.version || 1) + 1,
                lastUpdated: reviewedOn,
              };

              return appendLifecycleEvent(updated, {
                type: 'profile-update',
                title: 'Profile Updated',
                effectiveDate: reviewedOn,
                meta: { fields: Object.keys(request.changes || {}) },
              });
            });
          }

          const profileUpdateRequests = s.profileUpdateRequests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  reviewedOn,
                  reviewedBy: decision.reviewer || 'HR',
                  notes: decision.notes || r.notes,
                  audit: [
                    ...(r.audit || []),
                    {
                      action: status.toLowerCase(),
                      by: decision.reviewer || 'HR',
                      date: reviewedOn,
                      note: decision.notes || null,
                    },
                  ],
                }
              : r,
          );

          return { employees, profileUpdateRequests };
        }),

      // ============ PAYROLL ACTIONS ============
      getPayrollSettings: () => get().payrollSettings,

      updatePayrollSettings: (updates) =>
        set((s) => ({ payrollSettings: { ...s.payrollSettings, ...updates } })),

      computePayrollForEmployee: (employeeId, month, year) => {
        const state = get();
        const settings = state.payrollSettings || initialPayrollSettings;
        const start = startOfMonth(new Date(year, month - 1, 1));
        const end = endOfMonth(start);
        const monthAttendance = state.attendance.filter((a) => {
          if (a.employeeId !== employeeId) return false;
          const date = parseISO(a.date);
          return date >= start && date <= end;
        });

        const exceptions = [];
        const pendingPromotion = state.promotions.find(
          (p) =>
            p.employeeId === employeeId && (p.status === 'Pending' || p.status === 'Under Review'),
        );
        if (pendingPromotion) {
          exceptions.push('Promotion pending HR approval');
        }
        const pendingProfile = state.profileUpdateRequests.find(
          (r) => r.employeeId === employeeId && r.status === 'Pending',
        );
        if (pendingProfile) {
          exceptions.push('Profile changes pending HR approval');
        }

        const employee = state.employees.find((e) => e.id === employeeId);
        if (!employee) return null;

        return calculatePayrollItem(
          employee,
          monthAttendance,
          {
            month,
            year,
            startDate: format(start, 'yyyy-MM-dd'),
            endDate: format(end, 'yyyy-MM-dd'),
          },
          settings,
          exceptions,
        );
      },

      generatePayrollRun: ({ month, year, createdBy }) =>
        set((s) => {
          const settings = s.payrollSettings || initialPayrollSettings;
          const start = startOfMonth(new Date(year, month - 1, 1));
          const end = endOfMonth(start);

          const items = s.employees.map((emp) => {
            const monthAttendance = s.attendance.filter((a) => {
              if (a.employeeId !== emp.id) return false;
              const date = parseISO(a.date);
              return date >= start && date <= end;
            });

            const exceptions = [];
            const pendingPromotion = s.promotions.find(
              (p) =>
                p.employeeId === emp.id && (p.status === 'Pending' || p.status === 'Under Review'),
            );
            if (pendingPromotion) {
              exceptions.push('Promotion pending HR approval');
            }
            const pendingProfile = s.profileUpdateRequests.find(
              (r) => r.employeeId === emp.id && r.status === 'Pending',
            );
            if (pendingProfile) {
              exceptions.push('Profile changes pending HR approval');
            }

            return calculatePayrollItem(
              emp,
              monthAttendance,
              {
                month,
                year,
                startDate: format(start, 'yyyy-MM-dd'),
                endDate: format(end, 'yyyy-MM-dd'),
              },
              settings,
              exceptions,
            );
          });

          const summary = items.reduce(
            (acc, item) => {
              acc.totalGross += item.earnings.total;
              acc.totalDeductions += item.deductions.total;
              acc.totalNet += item.netPay;
              acc.exceptions += item.exceptions?.length ? 1 : 0;
              return acc;
            },
            { totalGross: 0, totalDeductions: 0, totalNet: 0, exceptions: 0 },
          );

          const run = {
            id: generateId('pay'),
            period: {
              month,
              year,
              label: format(start, 'MMM yyyy'),
              startDate: format(start, 'yyyy-MM-dd'),
              endDate: format(end, 'yyyy-MM-dd'),
            },
            status: 'Draft',
            createdAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
            createdBy: createdBy || 'HR',
            approvals: [],
            postedOn: null,
            items,
            summary,
          };

          return { payrollRuns: [run, ...s.payrollRuns] };
        }),

      updatePayrollRunStatus: (id, status, meta = {}) =>
        set((s) => ({
          payrollRuns: s.payrollRuns.map((run) =>
            run.id === id
              ? {
                  ...run,
                  status,
                  approvals:
                    status === 'Approved'
                      ? [
                          ...(run.approvals || []),
                          { by: meta.by || 'HR', date: format(new Date(), 'yyyy-MM-dd') },
                        ]
                      : run.approvals,
                }
              : run,
          ),
        })),

      postPayrollRun: (id, meta = {}) =>
        set((s) => ({
          payrollRuns: s.payrollRuns.map((run) =>
            run.id === id
              ? {
                  ...run,
                  status: 'Posted',
                  postedOn: format(new Date(), 'yyyy-MM-dd'),
                  postedBy: meta.postedBy || 'HR',
                  items: run.items.map((item) => ({ ...item, status: 'Posted' })),
                }
              : run,
          ),
        })),

      getPayrollRunForPeriod: (month, year) => {
        const state = get();
        return state.payrollRuns.find(
          (run) =>
            run.period?.month === month && run.period?.year === year && run.status === 'Posted',
        );
      },

      getEmployeePayrollHistory: (employeeId) => {
        const state = get();
        const items = state.payrollRuns
          .filter((run) => run.status === 'Posted')
          .map((run) => {
            const item = run.items.find((i) => i.employeeId === employeeId);
            return item
              ? {
                  ...item,
                  periodLabel: run.period?.label,
                  status: run.status,
                }
              : null;
          })
          .filter(Boolean);

        return items.sort(
          (a, b) => new Date(b.period?.endDate || 0) - new Date(a.period?.endDate || 0),
        );
      },

      // ============ ATTENDANCE CORRECTION ACTIONS ============
      submitAttendanceCorrection: (employeeId, corrections, meta = {}) =>
        set((s) => {
          const employee = s.employees.find((e) => e.id === employeeId);
          const correction = {
            id: generateId('atc'),
            employeeId,
            employeeName: employee?.name,
            department: employee?.department,
            originalAttendance: corrections.originalAttendance,
            requestedChange: corrections.requestedChange,
            reason: corrections.reason,
            documents: corrections.documents || [],
            submittedOn: format(new Date(), 'yyyy-MM-dd'),
            status: 'Pending',
            submittedBy: meta.submittedBy || employee?.name,
            notes: meta.notes || null,
            audit: [
              {
                action: 'submitted',
                by: meta.submittedBy || employee?.name,
                date: format(new Date(), 'yyyy-MM-dd'),
                comment: meta.notes || null,
              },
            ],
          };
          return { attendanceCorrections: [correction, ...s.attendanceCorrections] };
        }),

      reviewAttendanceCorrection: (id, decision) =>
        set((s) => {
          const correction = s.attendanceCorrections.find((c) => c.id === id);
          if (!correction) return {};

          let attendance = s.attendance;
          if (decision.status === 'Approved') {
            const att = s.attendance.find(
              (a) =>
                a.employeeId === correction.employeeId &&
                a.date === correction.originalAttendance.date,
            );
            if (att) {
              attendance = s.attendance.map((a) =>
                a.id === att.id
                  ? {
                      ...a,
                      status: correction.requestedChange.status,
                      notes: `[Corrected] ${correction.requestedChange.reason || ''}`,
                      correctionId: id,
                    }
                  : a,
              );
            }
          }

          return {
            attendance,
            attendanceCorrections: s.attendanceCorrections.map((c) =>
              c.id === id
                ? {
                    ...c,
                    status: decision.status,
                    reviewedOn: format(new Date(), 'yyyy-MM-dd'),
                    reviewedBy: decision.reviewer || 'HR',
                    audit: [
                      ...(c.audit || []),
                      {
                        action: decision.status.toLowerCase(),
                        by: decision.reviewer || 'HR',
                        date: format(new Date(), 'yyyy-MM-dd'),
                        comment: decision.notes || null,
                      },
                    ],
                  }
                : c,
            ),
          };
        }),

      flagAttendanceAnomalies: (employeeId) => {
        const state = get();
        const employee = state.employees.find((e) => e.id === employeeId);
        if (!employee) return { anomalies: [], employee: null };

        const empAttendance = state.attendance.filter((a) => a.employeeId === employeeId);
        const anomalies = [];

        const lastWeekStart = subDays(new Date(), 7);
        const lastWeekLates = empAttendance.filter(
          (a) => a.status === 'Late' && parseISO(a.date) >= lastWeekStart,
        );
        if (lastWeekLates.length > 3) {
          anomalies.push({
            type: 'excessive_lates',
            severity: 'warning',
            message: `${lastWeekLates.length} late arrivals in past week`,
            count: lastWeekLates.length,
          });
        }

        let consecutiveAbsent = 0;
        empAttendance
          .slice()
          .reverse()
          .forEach((a) => {
            if (a.status === 'Absent') {
              consecutiveAbsent++;
              if (consecutiveAbsent > 2) {
                anomalies.push({
                  type: 'consecutive_absences',
                  severity: 'error',
                  message: `${consecutiveAbsent} consecutive absences detected`,
                  count: consecutiveAbsent,
                });
              }
            } else {
              consecutiveAbsent = 0;
            }
          });

        const unapprovedLeaves = state.leaves.filter(
          (l) => l.employeeId === employeeId && l.status === 'Pending',
        );
        if (unapprovedLeaves.length > 0) {
          anomalies.push({
            type: 'pending_leave_approvals',
            severity: 'info',
            message: `${unapprovedLeaves.length} pending leave approvals`,
            count: unapprovedLeaves.length,
          });
        }

        return { anomalies, employee };
      },

      getLeaveRecommendations: (leaveRequest) => {
        const state = get();
        const employee = state.employees.find((e) => e.id === leaveRequest.employeeId);
        if (!employee)
          return {
            recommendation: 'Cannot process',
            reason: 'Employee not found',
            recommendations: [],
          };

        const recommendations = [];
        const leaveType = leaveRequest.type;
        const balance = employee.leaveBalance?.[leaveType] || 0;

        if (balance < leaveRequest.days) {
          recommendations.push({
            type: 'insufficient_balance',
            severity: 'error',
            message: `Insufficient ${leaveType} leave balance (requested: ${leaveRequest.days}, available: ${balance})`,
          });
        }

        const approvedLeaves = state.leaves.filter(
          (l) =>
            l.employeeId === leaveRequest.employeeId &&
            l.status === 'Approved' &&
            parseISO(l.startDate) <= parseISO(leaveRequest.endDate) &&
            parseISO(l.endDate) >= parseISO(leaveRequest.startDate),
        );
        if (approvedLeaves.length > 0) {
          recommendations.push({
            type: 'date_overlap',
            severity: 'warning',
            message: `Leave dates overlap with ${approvedLeaves.length} existing approved leave(s)`,
          });
        }

        const daysInAdvance = differenceInDays(parseISO(leaveRequest.startDate), new Date());
        if (leaveType !== 'sick' && daysInAdvance < 3) {
          recommendations.push({
            type: 'insufficient_notice',
            severity: 'warning',
            message: `Leave requested with only ${daysInAdvance} days advance notice (minimum 3 required)`,
          });
        }

        return {
          recommendation: recommendations.length === 0 ? 'Approve' : 'Review',
          recommendations,
          leaveBalance: balance,
          daysInAdvance,
        };
      },

      // ============ ATS ACTIONS ============
      addCandidate: (candidate) =>
        set((s) => ({
          candidates: [
            {
              ...candidate,
              id: generateId('cand'),
              appliedOn: candidate.appliedOn || format(new Date(), 'yyyy-MM-dd'),
              stage: candidate.stage || 'applied',
              status: candidate.status || 'In Progress',
              evaluations: candidate.evaluations || [],
              documents: candidate.documents || [],
              selectionBoard: {
                status: 'pending',
                members: selectionBoardWorkflow.defaultMembers,
                approvals: [],
                checklist: selectionBoardWorkflow.checklist,
                ...(candidate.selectionBoard || {}),
              },
            },
            ...s.candidates,
          ],
        })),

      updateCandidateStage: (id, stage, meta = {}) =>
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id
              ? {
                  ...c,
                  stage,
                  status: stage === 'hired' ? 'Hired' : c.status,
                  stageUpdatedOn: format(new Date(), 'yyyy-MM-dd'),
                  ...meta,
                }
              : c,
          ),
        })),

      addCandidateEvaluation: (id, evaluation) =>
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id
              ? {
                  ...c,
                  evaluations: [
                    ...c.evaluations,
                    {
                      ...evaluation,
                      date: evaluation.date || format(new Date(), 'yyyy-MM-dd'),
                    },
                  ],
                }
              : c,
          ),
        })),

      addSelectionBoardApproval: (id, approval) =>
        set((s) => ({
          candidates: s.candidates.map((c) => {
            if (c.id !== id) return c;
            const approvals = [
              ...(c.selectionBoard?.approvals || []),
              { ...approval, date: approval.date || format(new Date(), 'yyyy-MM-dd') },
            ];
            const approvedCount = approvals.filter((a) => a.decision === 'approved').length;
            const status =
              approvedCount >= (selectionBoardWorkflow.requiredApprovals || 2)
                ? 'approved'
                : 'pending';
            return {
              ...c,
              selectionBoard: {
                ...(c.selectionBoard || {}),
                approvals,
                status,
              },
            };
          }),
        })),

      linkCandidateDocument: (id, document) =>
        set((s) => ({
          candidates: s.candidates.map((c) =>
            c.id === id
              ? {
                  ...c,
                  documents: [...(c.documents || []), document],
                }
              : c,
          ),
        })),

      // ============ DOCUMENT REPOSITORY ACTIONS ============
      addDocument: (doc) =>
        set((s) => ({
          documents: [
            {
              ...doc,
              id: generateId('doc'),
              version: doc.version || 1,
              lastUpdated: doc.lastUpdated || format(new Date(), 'yyyy-MM-dd'),
            },
            ...s.documents,
          ],
        })),

      updateDocument: (id, updates) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id
              ? {
                  ...d,
                  ...updates,
                  lastUpdated: updates.lastUpdated || format(new Date(), 'yyyy-MM-dd'),
                }
              : d,
          ),
        })),

      // ============ RESIGNATION ACTIONS ============
      addResignation: (resignation) => {
        const employee = get().getEmployee(resignation.employeeId);
        set((s) => ({
          resignations: [
            ...s.resignations,
            {
              ...resignation,
              id: generateId('res'),
              employeeName: employee?.name,
              department: employee?.department,
              faculty: employee?.faculty,
              designation: employee?.designation,
              status: 'Pending',
              appliedOn: format(new Date(), 'yyyy-MM-dd'),
              exitSurvey: null,
              exitInterview: null,
              exitDocuments: [],
              hrApproval: null,
              handoverStatus: 'pending',
            },
          ],
        }));
      },

      updateResignationStatus: (id, status, updates = {}) =>
        set((s) => ({
          resignations: s.resignations.map((r) => (r.id === id ? { ...r, status, ...updates } : r)),
        })),

      submitExitSurvey: (resignationId, survey) =>
        set((s) => ({
          resignations: s.resignations.map((r) =>
            r.id === resignationId
              ? { ...r, exitSurvey: survey, exitSurveyDate: format(new Date(), 'yyyy-MM-dd') }
              : r,
          ),
        })),

      addExitInterview: (resignationId, interview) =>
        set((s) => ({
          resignations: s.resignations.map((r) =>
            r.id === resignationId
              ? {
                  ...r,
                  exitInterview: {
                    ...interview,
                    date: interview.date || format(new Date(), 'yyyy-MM-dd'),
                  },
                }
              : r,
          ),
        })),

      attachExitDocument: (resignationId, doc) =>
        set((s) => ({
          resignations: s.resignations.map((r) =>
            r.id === resignationId
              ? {
                  ...r,
                  exitDocuments: [...(r.exitDocuments || []), doc],
                }
              : r,
          ),
        })),

      processResignation: (id) => {
        const resignation = get().resignations.find((r) => r.id === id);
        if (resignation) {
          const employee = get().getEmployee(resignation.employeeId);
          if (employee) {
            // Move to ex-employees
            set((s) => ({
              exEmployees: [
                ...s.exEmployees,
                {
                  id: generateId('alum'),
                  employeeId: employee.id,
                  name: employee.name,
                  email: employee.email,
                  department: employee.department,
                  faculty: employee.faculty,
                  designation: employee.designation,
                  joinDate: employee.joinDate,
                  exitDate: resignation.lastWorkingDate,
                  yearsOfService: Math.floor(
                    (new Date(resignation.lastWorkingDate) - new Date(employee.joinDate)) /
                      (365.25 * 24 * 60 * 60 * 1000),
                  ),
                  exitReason: resignation.reason,
                  exitInterview: resignation.exitInterview,
                  exitDocuments: resignation.exitDocuments,
                  exitSurvey: resignation.exitSurvey,
                },
              ],
              employees: s.employees.filter((e) => e.id !== resignation.employeeId),
              resignations: s.resignations.map((r) =>
                r.id === id
                  ? { ...r, status: 'Completed', processedOn: format(new Date(), 'yyyy-MM-dd') }
                  : r,
              ),
            }));
          }
        }
      },

      getResignationsByEmployee: (employeeId) =>
        get().resignations.filter((r) => r.employeeId === employeeId),

      getPendingResignations: () =>
        get().resignations.filter((r) => r.status === 'Pending' || r.status === 'Approved'),

      // ============ PERFORMANCE (PAMS) ACTIONS & ANALYTICS ============
      addPerformanceReview: (review) =>
        set((s) => ({
          performanceReviews: [
            {
              ...review,
              id: generateId('prv'),
              date: review.date || format(new Date(), 'yyyy-MM-dd'),
            },
            ...s.performanceReviews,
          ],
        })),

      updatePerformanceReview: (id, updates) =>
        set((s) => ({
          performanceReviews: s.performanceReviews.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        })),

      getPerformanceAnalytics: (scope = {}) => {
        const state = get();
        const filtered = state.performanceReviews.filter((r) => {
          const emp = state.employees.find((e) => e.id === r.employeeId);
          if (!emp) return false;
          if (scope.faculty && emp.faculty !== scope.faculty) return false;
          if (scope.department && emp.department !== scope.department) return false;
          return true;
        });

        const byDepartment = {};
        filtered.forEach((r) => {
          const emp = state.employees.find((e) => e.id === r.employeeId);
          const dept = emp?.department || 'Unknown';
          if (!byDepartment[dept]) byDepartment[dept] = { count: 0, total: 0 };
          byDepartment[dept].count += 1;
          byDepartment[dept].total += r.rating || 0;
        });

        const avgByDepartment = Object.entries(byDepartment).map(([dept, v]) => ({
          department: dept,
          averageRating: v.count ? +(v.total / v.count).toFixed(2) : 0,
          count: v.count,
        }));

        const overallAvg = filtered.length
          ? +(filtered.reduce((a, r) => a + (r.rating || 0), 0) / filtered.length).toFixed(2)
          : 0;

        const topPerformers = filtered
          .slice()
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5)
          .map((r) => {
            const emp = state.employees.find((e) => e.id === r.employeeId);
            return {
              employeeId: r.employeeId,
              name: emp?.name,
              department: emp?.department,
              rating: r.rating,
            };
          });

        return { overallAvg, avgByDepartment, topPerformers, count: filtered.length };
      },

      // ============ OPERATIONAL ANALYTICS ============
      getOvertimeStats: ({
        month = new Date().getMonth() + 1,
        year = new Date().getFullYear(),
      } = {}) => {
        const state = get();
        const start = startOfMonth(new Date(year, month - 1, 1));
        const end = endOfMonth(start);
        const byEmployee = {};

        state.attendance.forEach((a) => {
          const d = parseISO(a.date);
          if (d < start || d > end) return;
          if (!byEmployee[a.employeeId]) byEmployee[a.employeeId] = 0;
          const hours = a.workHours || 0;
          const overtime = Math.max(0, hours - 8);
          byEmployee[a.employeeId] += overtime;
        });

        const rows = Object.entries(byEmployee)
          .map(([employeeId, hours]) => {
            const emp = state.employees.find((e) => e.id === employeeId);
            return {
              employeeId,
              name: emp?.name,
              department: emp?.department,
              hours: +hours.toFixed(2),
            };
          })
          .filter((r) => r.hours > 0)
          .sort((a, b) => b.hours - a.hours);

        const totalHours = +rows.reduce((sum, r) => sum + r.hours, 0).toFixed(2);
        return { totalHours, rows };
      },

      getPendingApprovalsSummary: () => {
        const s = get();
        return {
          leaves: s.leaves.filter((l) => l.status === 'Pending' || l.status === 'Forwarded').length,
          attendanceCorrections: s.attendanceCorrections.filter((c) => c.status === 'Pending')
            .length,
          promotions: s.promotions.filter(
            (p) => p.status === 'Pending' || p.status === 'Under Review',
          ).length,
          profileUpdates: s.profileUpdateRequests.filter((r) => r.status === 'Pending').length,
          selectionBoard: s.candidates.filter((c) => c.selectionBoard?.status === 'pending').length,
        };
      },

      getExpiringContracts: (days = 30) => {
        const state = get();
        const now = new Date();
        const horizon = addDays(now, days);
        const expiring = state.employees
          .map((e) => {
            const probation = e.employmentStatus === 'probation' ? e.probationEndDate : null;
            const contractEnd = e.contract?.endDate || null;
            const probationDue = probation && parseISO(probation) <= horizon;
            const contractDue = contractEnd && parseISO(contractEnd) <= horizon;
            if (!probationDue && !contractDue) return null;
            return {
              id: e.id,
              name: e.name,
              department: e.department,
              faculty: e.faculty,
              type: probationDue ? 'Probation End' : 'Contract End',
              dueDate: probationDue ? probation : contractEnd,
            };
          })
          .filter(Boolean)
          .sort((a, b) => parseISO(a.dueDate) - parseISO(b.dueDate));
        return expiring;
      },

      getProfileCompletion: (employeeId) => {
        const e = get().employees.find((x) => x.id === employeeId);
        if (!e) return { percent: 0, missing: [] };

        // Core required fields
        const required = [
          'email',
          'phone',
          'cnic',
          'bankAccount',
          'address',
          'emergencyContact',
          'department',
          'faculty',
          'designation',
        ];
        const missing = required.filter((k) => !e[k]);
        const baseScore = ((required.length - missing.length) / required.length) * 100;

        // Bonus/optional fields that enhance profile completeness (5 points each)
        const bonusFields = [
          'dependents',
          'qualifications',
          'publications',
          'certifications',
          'awards',
          'skills',
          'languages',
          'professionalMemberships',
        ];
        const extraScore = bonusFields.reduce((acc, k) => {
          if (k === 'skills' || k === 'languages') {
            // For array fields, check if array exists and has items
            return acc + (e[k] && e[k].length > 0 ? 3 : 0);
          }
          return acc + (e[k] && e[k].length > 0 ? 5 : 0);
        }, 0);

        const percent = Math.min(100, Math.round(baseScore + extraScore));
        return { percent, missing, bonusFields };
      },

      getAccreditationReport: () => {
        const s = get();
        const genderDist = { male: 0, female: 0, other: 0 };
        const byDesignation = {};
        const byFaculty = {};
        s.employees.forEach((e) => {
          const g = (e.gender || '').toLowerCase();
          if (g === 'male') genderDist.male += 1;
          else if (g === 'female') genderDist.female += 1;
          else genderDist.other += 1;
          byDesignation[e.designation] = (byDesignation[e.designation] || 0) + 1;
          byFaculty[e.faculty] = (byFaculty[e.faculty] || 0) + 1;
        });

        // Regulatory-ready summary
        return {
          headcount: s.employees.length,
          genderDist,
          byDesignation,
          byFaculty,
          probationCount: s.employees.filter((e) => e.employmentStatus === 'probation').length,
          contractExpiring30: get().getExpiringContracts(30).length,
        };
      },

      // ============ EX-EMPLOYEES ACTIONS ============
      getExEmployeesByDepartment: (dept) => get().exEmployees.filter((a) => a.department === dept),

      getExEmployeesByFaculty: (faculty) => get().exEmployees.filter((a) => a.faculty === faculty),

      searchExEmployees: (query) => {
        const q = query.toLowerCase();
        return get().exEmployees.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.department.toLowerCase().includes(q) ||
            a.designation.toLowerCase().includes(q),
        );
      },

      // ============ ANNOUNCEMENT ACTIONS ============
      addAnnouncement: (announcement) =>
        set((s) => ({
          announcements: [
            {
              ...announcement,
              id: generateId('ann'),
              createdAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
              isActive: true,
            },
            ...s.announcements,
          ],
        })),

      updateAnnouncement: (id, updates) =>
        set((s) => ({
          announcements: s.announcements.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      deleteAnnouncement: (id) =>
        set((s) => ({
          announcements: s.announcements.filter((a) => a.id !== id),
        })),

      getActiveAnnouncements: () => {
        const now = new Date();
        return get().announcements.filter(
          (a) => a.isActive && (!a.expiresAt || new Date(a.expiresAt) > now),
        );
      },

      getAnnouncementsForUser: (user) => {
        const active = get().getActiveAnnouncements();
        return active.filter((a) => {
          if (a.targetAudience === 'all') return true;
          if (a.targetAudience === 'faculty' && user?.faculty) return true;
          if (a.department && a.department === user?.department) return true;
          return false;
        });
      },

      // Stats and analytics
      getStats: () => {
        const state = get();
        const todayStr = format(today, 'yyyy-MM-dd');
        const todayAttendance = state.attendance.filter((a) => a.date === todayStr);

        return {
          totalEmployees: state.employees.length,
          activeEmployees: state.employees.filter((e) => e.status === 'Active').length,
          presentToday: todayAttendance.filter((a) => a.status === 'Present').length,
          lateToday: todayAttendance.filter((a) => a.status === 'Late').length,
          absentToday: state.employees.length - todayAttendance.length,
          pendingLeaves: state.leaves.filter((l) => l.status === 'Pending').length,
          pendingPromotions: state.promotions.filter((p) => p.status === 'Pending').length,
          pendingResignations: state.resignations.filter((r) => r.status === 'Pending').length,
          onLeave: state.employees.filter((e) => e.status === 'On Leave').length,
          totalPayroll: state.employees.reduce((sum, e) => sum + e.salaryBase, 0),
          totalExEmployees: state.exEmployees.length,
        };
      },

      // Reset to initial data (for demo)
      resetData: () =>
        set({
          employees: initialEmployees,
          attendance: generateAttendance(),
          leaves: initialLeaves,
          notifications: initialNotifications,
          promotions: initialPromotions,
          resignations: initialResignations,
          exEmployees: initialExEmployees,
          announcements: initialAnnouncements,
          bulkIncrements: initialBulkIncrements,
          profileUpdateRequests: initialProfileRequests,
          candidates: initialCandidates,
          documents: initialDocuments,
          payrollSettings: initialPayrollSettings,
          payrollRuns: initialPayrollRuns,
          attendanceCorrections: initialAttendanceCorrections,
          performanceReviews: initialPerformanceReviews,
        }),
    }),
    {
      name: 'hrms-data',
      partialize: (state) => ({
        employees: state.employees,
        attendance: state.attendance,
        leaves: state.leaves,
        notifications: state.notifications,
        promotions: state.promotions,
        resignations: state.resignations,
        exEmployees: state.exEmployees,
        announcements: state.announcements,
        bulkIncrements: state.bulkIncrements,
        profileUpdateRequests: state.profileUpdateRequests,
        candidates: state.candidates,
        documents: state.documents,
        payrollSettings: state.payrollSettings,
        payrollRuns: state.payrollRuns,
        attendanceCorrections: state.attendanceCorrections,
        performanceReviews: state.performanceReviews,
      }),
    },
  ),
);

// ============ EMAIL SERVICE FUNCTIONS ============

const WEB3FORMS_ACCESS_KEY = '18a0400c-1b05-4bbb-a7f9-8ba08012816e';
const API_ENDPOINT = 'https://api.web3forms.com/submit';

export const sendEmail = async (emailData) => {
  try {
    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('to_email', emailData.to);
    formData.append('subject', emailData.subject);
    formData.append('message', emailData.message);
    formData.append('from_name', emailData.from_name || 'HRMS System');

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

export const sendLeaveNotification = async (leaveData, currentUserEmail) => {
  // Get all employees from the store
  const store = useDataStore.getState();
  const allEmployees = store.employees || [];

  // Get all employee emails, excluding the current user
  const recipients = allEmployees
    .filter((emp) => emp.email && emp.email !== currentUserEmail)
    .map((emp) => emp.email);

  // If no recipients, log and return
  if (recipients.length === 0) {
    console.log('No recipients found for leave notification');
    return null;
  }

  const emailMessage = `Dear Colleague,

A new leave request has been submitted:

Employee Name: ${leaveData.employeeName}
Leave Type: ${leaveData.leaveType.charAt(0).toUpperCase() + leaveData.leaveType.slice(1)}
Start Date: ${leaveData.startDate}
End Date: ${leaveData.endDate}
Duration: ${leaveData.days} day(s)
Reason: ${leaveData.reason}
Status: ${leaveData.status}

Please review and process this leave request through the HRMS dashboard.

Best regards,
HRMS System
CECOS University`;

  const emailPromises = recipients.map((email) =>
    sendEmail({
      to: email,
      subject: `New Leave Request - ${leaveData.employeeName} (${leaveData.leaveType})`,
      message: emailMessage,
      from_name: 'HRMS Leave Management',
    }),
  );

  try {
    const results = await Promise.all(emailPromises);
    console.log(
      `Leave notification emails sent successfully to ${recipients.length} recipients`,
      results,
    );
    return results;
  } catch (error) {
    console.error('Leave notification emails failed:', error);
    return null;
  }
};

export const sendNewEmployeeNotification = async (employeeData, currentUserEmail) => {
  // Get all employees from the store
  const store = useDataStore.getState();
  const allEmployees = store.employees || [];

  // Get all employee emails, excluding the current user and new employee
  const recipients = allEmployees
    .filter(
      (emp) => emp.email && emp.email !== currentUserEmail && emp.email !== employeeData.email,
    )
    .map((emp) => emp.email);

  const emailMessage = `Dear Team,

A new employee has been added to the system:

Employee Name: ${employeeData.name}
Employee Code: ${employeeData.code}
Email: ${employeeData.email}
Designation: ${employeeData.designation}
Department: ${employeeData.department}
Join Date: ${employeeData.joinDate}

Please update your records accordingly.

Best regards,
HRMS System
CECOS University`;

  const emailPromises = recipients.map((email) =>
    sendEmail({
      to: email,
      subject: `New Employee Added - ${employeeData.name}`,
      message: emailMessage,
      from_name: 'HRMS Employee Management',
    }),
  );

  try {
    const results = await Promise.all(emailPromises);

    // Welcome email to new employee
    await sendEmail({
      to: employeeData.email,
      subject: 'Welcome to CECOS University - Your Employee Account',
      message: `Dear ${employeeData.name},

Welcome to CECOS University!

Your employee account has been created in the HRMS.

Your Employee Code: ${employeeData.code}
Your Designation: ${employeeData.designation}
Your Department: ${employeeData.department}

You can now access the HRMS portal using your credentials.

Best regards,
HRMS System
CECOS University`,
      from_name: 'HRMS Welcome',
    });

    console.log(
      `New employee notification emails sent successfully to ${recipients.length} recipients`,
      results,
    );
    return results;
  } catch (error) {
    console.error('New employee notification emails failed:', error);
    return null;
  }
};

export const sendAnnouncementNotification = async (announcementData, currentUserEmail) => {
  // Get all employees from the store
  const store = useDataStore.getState();
  const allEmployees = store.employees || [];

  // Get all employee emails, excluding the current user
  const recipients = allEmployees
    .filter((emp) => emp.email && emp.email !== currentUserEmail)
    .map((emp) => emp.email);

  // If no recipients, log and return
  if (recipients.length === 0) {
    console.log('No recipients found for announcement notification');
    return null;
  }

  const emailMessage = `New Announcement:

Title: ${announcementData.title}

${announcementData.description}

Audience: ${announcementData.audience}
Posted by: ${announcementData.postedBy}
Date: ${new Date().toLocaleString('en-PK')}

Please log in to the HRMS system to view full details.

Best regards,
HRMS System
CECOS University`;

  const emailPromises = recipients.map((email) =>
    sendEmail({
      to: email,
      subject: `New Announcement - ${announcementData.title}`,
      message: emailMessage,
      from_name: 'HRMS Announcements',
    }),
  );

  try {
    const results = await Promise.all(emailPromises);
    console.log(
      `Announcement notification emails sent successfully to ${recipients.length} recipients`,
      results,
    );
    return results;
  } catch (error) {
    console.error('Announcement notification emails failed:', error);
    return null;
  }
};

export const sendMeetingNotification = async (meetingData, currentUserEmail) => {
  // Get all employees from the store
  const store = useDataStore.getState();
  const allEmployees = store.employees || [];

  // Get all employee emails, excluding the current user (meeting convener)
  const recipients = allEmployees
    .filter((emp) => emp.email && emp.email !== currentUserEmail)
    .map((emp) => emp.email);

  // If no recipients, log and return
  if (recipients.length === 0) {
    console.log('No recipients found for meeting notification');
    return null;
  }

  const emailMessage = `Dear Colleague,

You are cordially invited to attend a committee meeting.

Meeting Title: ${meetingData.title}
Date: ${meetingData.date}
Time: ${meetingData.time}
Location: ${meetingData.location}

Agenda:
${meetingData.agenda}

Convener: ${meetingData.convener}

Please confirm your attendance and inform if you have any specific topics to discuss.

Best regards,
HRMS System
CECOS University`;

  const emailPromises = recipients.map((email) =>
    sendEmail({
      to: email,
      subject: `Committee Meeting Invitation - ${meetingData.title}`,
      message: emailMessage,
      from_name: `Committee Meeting - ${meetingData.convener}`,
    }),
  );

  try {
    const results = await Promise.all(emailPromises);
    console.log(
      `Meeting notification emails sent successfully to ${recipients.length} recipients`,
      results,
    );
    return results;
  } catch (error) {
    console.error('Meeting notification emails failed:', error);
    return null;
  }
};
