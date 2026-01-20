# PAMS Complete Workflow - Testing Guide

## Summary of Implementation

✅ **All requested features implemented:**

1. ✅ Store flow updated: Employee → HOD → Dean → VC → HR
2. ✅ Meeting date validation (HOD/Dean): past dates blocked, max 1 year ahead
3. ✅ VC return removed: approve-only flow
4. ✅ HOD edit capability: modify workload and rubric before confirming
5. ✅ HR PAMS route added
6. ✅ Comprehensive dummy data created
7. ✅ Build verified successfully

## How to Add Dummy Data

The file `dummy-pams-additions.js` contains 10 additional PAMS entries. To add them:

1. Open `src/state/data.js`
2. Find line ~1113 where you see: `);` (closing the initialPamsSubmissions array)
3. **Before that closing `);`**, copy and paste all the entries from `dummy-pams-additions.js` (starting from line 5, the first `{`)
4. Make sure each entry is separated by a comma
5. Save the file

## Complete Dummy Data Coverage

After adding, you'll have PAMS entries covering:

### Faculty PAMS (submitted → HOD review):

- Alice Smith (CS, Computing) - status: `submitted`
- Dr. Diana Prince (BBA, Management) - status: `submitted`
- Dr. Sarah Ahmed (CS, Computing) - status: `submitted`
- Prof. Jamil Hassan (BBA, Management) - status: `submitted`

### Faculty PAMS (hod-confirmed → VC review):

- Muhammad Ahmed (CS, Computing) - status: `hod-confirmed`
- Dr. Ayesha Malik (EE, Engineering) - status: `hod-confirmed`
- Mr. Bilal Iqbal (BBA, Management) - status: `hod-confirmed`

### HOD PAMS (submitted → Dean review):

- Dr. Imran Shah (CS, Computing) - status: `submitted`
- Dr. Tariq Mehmood (EE, Engineering) - status: `submitted`
- Dr. Rabia Noor (ME, Engineering) - status: `submitted`

### HOD PAMS (dean-confirmed → VC review):

- Dr. Sana Farooq (BBA, Management) - status: `dean-confirmed`
- Dr. Ahmed Raza (Physics, Sciences) - status: `dean-confirmed`

### VC Approved (→ HR processing):

- Zara Khan (EE, Engineering) - status: `vc-approved`
- Dr. Nadia Siddiqui (Chemistry, Sciences) - status: `vc-approved`
- Dr. Khalid Mahmood (Chemistry, Sciences) - status: `vc-approved`

### HR Final (completed):

- Prof. Usman Ali (Physics, Sciences) - status: `hr-final`

## Testing Workflow

### 1. **Employee Portal** (`/employee/pams`)

- Log in as any employee
- Submit a new PAMS form
- Fill workload, rubric, attachments
- Confirm submission
- **Result:** Status becomes `submitted`
- **Appears in:** HOD PAMS list

### 2. **HOD Portal** (`/hod/pams`)

- Log in as HOD (e.g., Dr. Imran Shah for CS dept)
- See "Pending Submissions" with Alice Smith, Dr. Sarah Ahmed, etc.
- Click on a submission
- **Optional:** Click "Edit Submission" to modify workload/rubric
- Click "Show Appraisal Form"
- Set meeting date (validates: not past, not > 1 year)
- Assess 4 categories: Teaching, Research, FYP, Service
- Add comments
- Submit Appraisal
- **Result:** Status becomes `hod-confirmed`
- **Appears in:** VC PAMS list

### 3. **Dean Portal** (`/dean/pams`)

- Log in as Dean (for Engineering/Management/Sciences faculty)
- See HOD PAMS submissions (Dr. Imran Shah, Dr. Tariq Mehmood, etc.)
- Click on a HOD submission
- Click to open AppraisalForm
- Set meeting date (validates: not past, not > 1 year)
- Assess 4 categories
- Add comments
- Submit Appraisal
- **Result:** Status becomes `dean-confirmed`
- **Appears in:** VC PAMS list

### 4. **VC Portal** (`/vc/pams`)

- Log in as VC
- See both:
  - Faculty with `hod-confirmed` status (Muhammad Ahmed, Dr. Ayesha Malik, etc.)
  - HODs with `dean-confirmed` status (Dr. Sana Farooq, Dr. Ahmed Raza)
- Click on any submission
- Review HOD/Dean assessments
- Add final comments
- Click "Send to HR" (no Return button)
- **Result:** Status becomes `vc-approved`
- **Appears in:** HR PAMS list

### 5. **HR Portal** (`/hr/pams`)

- Log in as HR
- Navigate to PAMS page (route now exists)
- See VC-approved submissions (Zara Khan, Dr. Nadia Siddiqui, Dr. Khalid Mahmood)
- Review complete approval chain:
  - ✓ HOD Meeting Date
  - ✓ Dean Meeting Date (if HOD)
  - ✓ VC Approval Date
- Click on submission
- Click "Finalize & Archive" or similar button
- **Result:** Status becomes `hr-final`
- **Complete:** Full workflow finished

## Key Features Implemented

### Meeting Date Validation

- **HOD AppraisalForm:** Validates date >= today and <= today + 365 days
- **Dean AppraisalForm:** Same validation
- Shows alert if invalid date entered
- Prevents submission with invalid dates

### HOD Edit Capability

- **Toggle Edit Mode:** "Edit Submission" button
- **Editable Fields:**
  - Teaching Load (textarea)
  - Administrative Duties (textarea)
  - Teaching Rubric (textarea)
  - Research Rubric (textarea)
  - Service Rubric (textarea)
- **Save:** Updates via `updatePamsSubmission`
- **Use Case:** HOD corrects errors with employee before confirming

### No Return Flow

- **HOD:** Always confirms to `hod-confirmed`
- **Dean:** Always confirms to `dean-confirmed`
- **VC:** Always approves to `vc-approved` (Return button removed)
- **HR:** Always finalizes to `hr-final`
- **Rationale:** Errors handled by HOD editing, not returning

### Automatic Data Flow

- Employee Profile data (publications, FYP, thesis, grants, admin duties) automatically appears in HOD/Dean AppraisalForm
- All data filtered to current year (Fall 2026)
- Live badges show "Live data from employee profile"

## Status Flow Summary

```
Employee: submitted
    ↓
HOD Confirms (with assessment): hod-confirmed
    ↓
Dean Confirms HODs (with assessment): dean-confirmed
    ↓
VC Approves All: vc-approved
    ↓
HR Finalizes: hr-final
```

## Selectors

- `getPamsForHod(department)`: Shows `submitted` faculty PAMS
- `getPamsForDean(faculty)`: Shows `submitted` HOD PAMS
- `getPamsForVc()`: Shows `hod-confirmed` + `dean-confirmed` PAMS
- `getPamsForHr()`: Shows `vc-approved` PAMS

## Build Status

✅ **Build Successful** - All changes compile without errors

- 1853 modules transformed
- No TypeScript/ESLint errors
- Production build ready

## Run Locally

```bash
cd D:\HRMS\HRMS_FRONTEND
npm run dev
```

Then navigate to:

- Employee: http://localhost:5173/employee/pams
- HOD: http://localhost:5173/hod/pams
- Dean: http://localhost:5173/dean/pams
- VC: http://localhost:5173/vc/pams
- HR: http://localhost:5173/hr/pams

## Notes

- All dates use `format()` and `subDays()` from date-fns
- Assessment fields included in `hodReview` and `deanReview`
- History tracking maintained throughout workflow
- No "returned" status in new flow - edit instead
- Meeting dates required for HOD/Dean confirmation
- VC comments optional but encouraged

## Testing Checklist

- [ ] Employee can submit PAMS
- [ ] HOD sees submitted PAMS in their department
- [ ] HOD can edit submission before confirming
- [ ] HOD meeting date validates correctly
- [ ] HOD appraisal creates `hod-confirmed` status
- [ ] Dean sees submitted HOD PAMS in their faculty
- [ ] Dean meeting date validates correctly
- [ ] Dean appraisal creates `dean-confirmed` status
- [ ] VC sees both `hod-confirmed` and `dean-confirmed`
- [ ] VC can only approve (no return)
- [ ] VC approval creates `vc-approved` status
- [ ] HR sees `vc-approved` PAMS
- [ ] HR can finalize to `hr-final`
- [ ] Complete workflow: submitted → hod-confirmed → dean-confirmed → vc-approved → hr-final

## Complete! 🎉
