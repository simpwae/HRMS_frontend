import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../state/auth';
import { useDataStore, getFallSemesters } from '../../../state/data';
import Card from '../../../components/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import Avatar from '../../../components/Avatar';
import FileUpload from '../../../components/FileUpload';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import EmployeeRequestForm from './EmployeeRequestForm';
import {
  BookWritingForm,
  ResearchPublicationForm,
  ConferencePaperForm,
} from '../../../components/PublicationForms';

export default function Profile() {
  // Get real user and employee data from stores
  const user = useAuthStore((s) => s.user);
  const {
    employees,
    submitProfileUpdateRequest,
    addEmployeeFYP,
    updateEmployeeFYP,
    deleteEmployeeFYP,
    addEmployeeThesis,
    updateEmployeeThesis,
    deleteEmployeeThesis,
    addEmployeeGrant,
    updateEmployeeGrant,
    deleteEmployeeGrant,
    addEmployeeAdminDuty,
    updateEmployeeAdminDuty,
    deleteEmployeeAdminDuty,
  } = useDataStore();
  const employee = useMemo(
    () => employees.find((e) => e.id === user?.id || e.email === user?.email),
    [employees, user],
  );
  // Publications state (with dummy data if empty)
  // Dependents state (with dummy data if empty)
  const [dependents, setDependents] = useState(
    employee?.dependents && employee.dependents.length > 0
      ? employee.dependents
      : [
          {
            name: 'Ayesha Khan',
            relationship: 'Daughter',
            dob: '2015-06-12',
            cnic: '17301-9876543-2',
            document: '',
          },
          {
            name: 'Ali Khan',
            relationship: 'Son',
            dob: '2018-09-25',
            cnic: '17301-8765432-1',
            document: '',
          },
        ],
  );
  const [showDependentModal, setShowDependentModal] = useState(false);
  const [dependentEditIndex, setDependentEditIndex] = useState(null);
  const [dependentForm, setDependentForm] = useState({
    name: '',
    relationship: '',
    dob: '',
    cnic: '',
    document: '',
  });

  function handleDependentFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDependentForm((f) => ({ ...f, document: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDependentSubmit(e) {
    e.preventDefault();
    if (!employee?.id) return;
    let newDependents = [...dependents];
    if (dependentEditIndex !== null) {
      newDependents[dependentEditIndex] = { ...dependentForm };
    } else {
      newDependents.push({ ...dependentForm });
    }
    setDependents(newDependents);
    submitProfileUpdateRequest(
      employee.id,
      { dependents: newDependents },
      {
        requestedBy: employee?.name || user?.name,
        notes: 'Dependent update',
      },
    );
    setShowDependentModal(false);
    setDependentEditIndex(null);
    setDependentForm({ name: '', relationship: '', dob: '', cnic: '', document: '' });
  }

  function handleRemoveDependent(idx) {
    if (!employee?.id) return;
    const newDependents = dependents.filter((_, i) => i !== idx);
    setDependents(newDependents);
    submitProfileUpdateRequest(
      employee.id,
      { dependents: newDependents },
      {
        requestedBy: employee?.name || user?.name,
        notes: 'Dependent removal',
      },
    );
  }
  const [publications, setPublications] = useState(
    employee?.publications && employee.publications.length > 0
      ? employee.publications
      : [
          {
            title: 'A Study on React Performance',
            journal: 'International Journal of Web Dev',
            year: '2024',
            link: 'https://example.com/react-performance',
            document: '',
          },
          {
            title: 'Modern HRMS Systems',
            journal: 'HR Tech Review',
            year: '2023',
            link: '',
            document: '',
          },
        ],
  );
  const [showPublicationModal, setShowPublicationModal] = useState(false);
  // Qualifications state (with dummy data if empty)
  const [qualifications, setQualifications] = useState(
    employee?.qualifications && employee.qualifications.length > 0
      ? employee.qualifications
      : [
          {
            degree: 'PhD Computer Science',
            institution: 'CECOS University',
            field: 'Software Engineering',
            year: '2022',
            document: '',
          },
          {
            degree: 'MS Information Technology',
            institution: 'FAST NUCES',
            field: 'IT',
            year: '2019',
            document: '',
          },
        ],
  );
  const [showQualificationModal, setShowQualificationModal] = useState(false);

  // FYP Supervision state
  const [showFYPModal, setShowFYPModal] = useState(false);
  const [fypEditId, setFYPEditId] = useState(null);
  const [fypForm, setFYPForm] = useState({
    period: '',
    projectTitle: '',
    studentNames: '',
    status: 'ongoing',
    numberOfStudents: '',
    awardLevel: null,
    technicalPapers: '',
    productsDevloped: '',
    prototypeCompleted: '',
    otherInfo: '',
  });

  // Thesis Supervision state
  const [showThesisModal, setShowThesisModal] = useState(false);
  const [thesisEditId, setThesisEditId] = useState(null);
  const [thesisForm, setThesisForm] = useState({
    period: '',
    level: 'MS',
    thesisTitle: '',
    studentName: '',
    status: 'ongoing',
    conferencePapers: '',
    researchPaperCategory: '',
    presentStatus: '',
  });

  // Research Grants state
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantEditId, setGrantEditId] = useState(null);
  const [grantForm, setGrantForm] = useState({
    period: '',
    grantName: '',
    fundingAgency: '',
    amount: '',
    amountObtained: '',
    approvedDate: '',
    outcome: 'proposal developed',
    status: 'active',
    notes: '',
  });

  // Administrative Duties state
  const [showAdminDutyModal, setShowAdminDutyModal] = useState(false);
  const [adminDutyEditId, setAdminDutyEditId] = useState(null);
  const [adminDutyForm, setAdminDutyForm] = useState({
    dutyLevel: 'departmental',
    dutyType: '',
    assignedBy: '',
    roleDescription: '',
    creditHourExemption: false,
    extraAllowance: false,
  });

  // Edit Profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: employee?.name || '',
    designation: employee?.designation || '',
    department: employee?.department || '',
    faculty: employee?.faculty || '',
    status: employee?.status || 'Active',
  });

  // Publications logic
  const [publicationEditIndex, setPublicationEditIndex] = useState(null);
  // Publication type and initial forms for dynamic form rendering
  const [publicationType, setPublicationType] = useState('book');
  const initialForms = {
    book: {
      author: '',
      coAuthor: '',
      bookTitle: '',
      addition: '',
      website: '',
      isbn: '',
      publisher: '',
      chapterNo: '',
      chapterName: '',
      chapterLink: '',
      dateOfPublish: '',
      placeOfPublish: '',
      edition: '',
      document: '',
    },
    research: {
      journalAddress: '',
      issn: '',
      nationality: '',
      title: '',
      volume: '',
      datePublished: '',
      journalCategory: '',
      authors: '',
      impactFactor: '',
      doi: '',
      document: '',
    },
    conference: {
      authors: '',
      conferenceAddress: '',
      coAuthor: '',
      nationality: '',
      title: '',
      webLink: '',
      paperDate: '',
      fundedBy: '',
      document: '',
    },
  };
  const [publicationForm, setPublicationForm] = useState(initialForms.book);

  function handlePublicationFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPublicationForm((f) => ({ ...f, document: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  }

  function handlePublicationSubmit(e) {
    e.preventDefault();
    if (!employee?.id) return;
    let newPublications = [...publications];
    if (publicationEditIndex !== null) {
      newPublications[publicationEditIndex] = { ...publicationForm };
    } else {
      newPublications.push({ ...publicationForm });
    }
    setPublications(newPublications);
    submitProfileUpdateRequest(
      employee.id,
      { publications: newPublications },
      {
        requestedBy: employee?.name || user?.name,
        notes: 'Publication update',
      },
    );
    setShowPublicationModal(false);
    setPublicationEditIndex(null);
    setPublicationForm({ title: '', journal: '', year: '', link: '', document: '' });
  }

  function handleRemovePublication(idx) {
    if (!employee?.id) return;
    const newPublications = publications.filter((_, i) => i !== idx);
    setPublications(newPublications);
    submitProfileUpdateRequest(
      employee.id,
      { publications: newPublications },
      {
        requestedBy: employee?.name || user?.name,
        notes: 'Publication removal',
      },
    );
  }

  // FYP Supervision handlers
  function handleFYPSubmit(e) {
    e.preventDefault();
    if (!employee?.id) return;

    if (fypEditId) {
      updateEmployeeFYP(employee.id, fypEditId, fypForm);
    } else {
      addEmployeeFYP(employee.id, fypForm);
    }

    setShowFYPModal(false);
    setFYPEditId(null);
    setFYPForm({
      period: '',
      projectTitle: '',
      studentNames: '',
      status: 'ongoing',
      numberOfStudents: '',
      awardLevel: null,
      technicalPapers: '',
      productsDevloped: '',
      prototypeCompleted: '',
      otherInfo: '',
    });
  }

  function handleEditFYP(fyp) {
    setFYPForm(fyp);
    setFYPEditId(fyp.id);
    setShowFYPModal(true);
  }

  function handleDeleteFYP(fypId) {
    if (!employee?.id) return;
    if (confirm('Are you sure you want to delete this FYP supervision?')) {
      deleteEmployeeFYP(employee.id, fypId);
    }
  }

  // Thesis Supervision handlers
  function handleThesisSubmit(e) {
    e.preventDefault();
    if (!employee?.id) return;

    if (thesisEditId) {
      updateEmployeeThesis(employee.id, thesisEditId, thesisForm);
    } else {
      addEmployeeThesis(employee.id, thesisForm);
    }

    setShowThesisModal(false);
    setThesisEditId(null);
    setThesisForm({
      period: '',
      level: 'MS',
      thesisTitle: '',
      studentName: '',
      status: 'ongoing',
      conferencePapers: '',
      researchPaperCategory: '',
      presentStatus: '',
    });
  }

  function handleEditThesis(thesis) {
    setThesisForm(thesis);
    setThesisEditId(thesis.id);
    setShowThesisModal(true);
  }

  function handleDeleteThesis(thesisId) {
    if (!employee?.id) return;
    if (confirm('Are you sure you want to delete this thesis supervision?')) {
      deleteEmployeeThesis(employee.id, thesisId);
    }
  }

  // Research Grant handlers
  function handleGrantSubmit(e) {
    e.preventDefault();
    if (!employee?.id) return;

    // Validate that approval date is provided when outcome is approved or awarded
    if (
      (grantForm.outcome === 'approved' || grantForm.outcome === 'awarded') &&
      !grantForm.approvedDate
    ) {
      alert('Approval date is required when outcome is "Approved" or "Awarded"');
      return;
    }

    // Validate that obtained amount doesn't exceed total amount
    if (
      grantForm.amountObtained &&
      grantForm.amount &&
      Number(grantForm.amountObtained) > Number(grantForm.amount)
    ) {
      alert('Amount obtained cannot exceed the total grant amount');
      return;
    }

    if (grantEditId) {
      updateEmployeeGrant(employee.id, grantEditId, grantForm);
    } else {
      addEmployeeGrant(employee.id, grantForm);
    }

    setShowGrantModal(false);
    setGrantEditId(null);
    setGrantForm({
      period: '',
      grantName: '',
      fundingAgency: '',
      amount: '',
      amountObtained: '',
      approvedDate: '',
      outcome: 'pending',
      status: 'active',
      notes: '',
    });
  }

  function handleEditGrant(grant) {
    setGrantForm(grant);
    setGrantEditId(grant.id);
    setShowGrantModal(true);
  }

  // Admin Duties handlers
  function handleAdminDutySubmit(e) {
    e.preventDefault();
    if (!employee?.id || !adminDutyForm.dutyType || !adminDutyForm.assignedBy) {
      alert('Please fill in all required fields');
      return;
    }

    if (adminDutyEditId) {
      updateEmployeeAdminDuty(employee.id, adminDutyEditId, adminDutyForm);
    } else {
      addEmployeeAdminDuty(employee.id, adminDutyForm);
    }

    setShowAdminDutyModal(false);
    setAdminDutyEditId(null);
    setAdminDutyForm({
      dutyLevel: 'departmental',
      dutyType: '',
      assignedBy: '',
      roleDescription: '',
      creditHourExemption: false,
      extraAllowance: false,
    });
  }

  function handleEditAdminDuty(duty) {
    setAdminDutyForm(duty);
    setAdminDutyEditId(duty.id);
    setShowAdminDutyModal(true);
  }

  function handleDeleteAdminDuty(dutyId) {
    if (!employee?.id) return;
    if (confirm('Are you sure you want to delete this administrative duty?')) {
      deleteEmployeeAdminDuty(employee.id, dutyId);
    }
  }

  function handleDeleteGrant(grantId) {
    if (!employee?.id) return;
    if (confirm('Are you sure you want to delete this research grant?')) {
      deleteEmployeeGrant(employee.id, grantId);
    }
  }

  // Qualifications logic
  const [qualificationEditIndex, setQualificationEditIndex] = useState(null);
  const [qualificationForm, setQualificationForm] = useState({
    degree: '',
    institution: '',
    field: '',
    year: '',
    document: '',
  });

  function handleQualificationFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setQualificationForm((f) => ({ ...f, document: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  }

  function handleQualificationSubmit(e) {
    e.preventDefault();
    if (!employee?.id) return;
    let newQualifications = [...qualifications];
    if (qualificationEditIndex !== null) {
      newQualifications[qualificationEditIndex] = { ...qualificationForm };
    } else {
      newQualifications.push({ ...qualificationForm });
    }
    setQualifications(newQualifications);
    submitProfileUpdateRequest(
      employee.id,
      { qualifications: newQualifications },
      {
        requestedBy: employee?.name || user?.name,
        notes: 'Qualification update',
      },
    );
    setShowQualificationModal(false);
    setQualificationEditIndex(null);
    setQualificationForm({ degree: '', institution: '', field: '', year: '', document: '' });
  }

  const onSubmit = (data) => {
    if (employee) {
      submitProfileUpdateRequest(employee.id, data, {
        requestedBy: employee?.name || user?.name,
        notes: 'Profile update',
      });
    }
    setShowEditModal(false);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount || 0);

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="mb-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="dependents">Dependents</TabsTrigger>
        <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
        <TabsTrigger value="publications">Publications</TabsTrigger>
        <TabsTrigger value="fyp">FYP Supervised</TabsTrigger>
        <TabsTrigger value="thesis">Thesis Supervised</TabsTrigger>
        <TabsTrigger value="grants">Research Grants</TabsTrigger>
        <TabsTrigger value="admin-duties">Administrative Duties</TabsTrigger>
        <TabsTrigger value="cecpf">CECPF Provident Fund</TabsTrigger>
      </TabsList>
      <TabsContent value="dependents">
        <Card title="Dependents">
          <div className="flex justify-end mb-2">
            <Button
              onClick={() => {
                setDependentForm({ name: '', relationship: '', dob: '', cnic: '', document: '' });
                setDependentEditIndex(null);
                setShowDependentModal(true);
              }}
            >
              Add Dependent
            </Button>
          </div>
          {dependents.length === 0 ? (
            <div className="text-gray-500">No dependents added yet.</div>
          ) : (
            <ul className="divide-y">
              {dependents.map((d, idx) => (
                <li key={idx} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-sm text-gray-600">{d.relationship}</div>
                    <div className="text-xs text-gray-500">DOB: {d.dob}</div>
                    <div className="text-xs text-gray-500">CNIC: {d.cnic}</div>
                    {d.document && (
                      <a
                        href={d.document}
                        className="text-blue-600 text-xs"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDependentForm(d);
                        setDependentEditIndex(idx);
                        setShowDependentModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleRemoveDependent(idx)}>
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </TabsContent>
      {/* Dependent Modal */}
      <Modal
        open={showDependentModal}
        onClose={() => setShowDependentModal(false)}
        title={dependentEditIndex !== null ? 'Edit Dependent' : 'Add Dependent'}
      >
        <form onSubmit={handleDependentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="w-full border rounded p-2"
              value={dependentForm.name}
              onChange={(e) => setDependentForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Relationship</label>
            <input
              className="w-full border rounded p-2"
              value={dependentForm.relationship}
              onChange={(e) => setDependentForm((f) => ({ ...f, relationship: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={dependentForm.dob}
              onChange={(e) => setDependentForm((f) => ({ ...f, dob: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">CNIC</label>
            <input
              className="w-full border rounded p-2"
              value={dependentForm.cnic}
              onChange={(e) => setDependentForm((f) => ({ ...f, cnic: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Document</label>
            <FileUpload onChange={handleDependentFileChange} />
            {dependentForm.document && (
              <div className="mt-2">
                <a
                  href={dependentForm.document}
                  className="text-blue-600 text-xs underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Uploaded Document
                </a>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowDependentModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <TabsContent value="profile">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-r from-blue-600 to-blue-800" />
          <div className="relative pt-16 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                <Avatar
                  name={employee?.name || user?.name}
                  size="2xl"
                  className="ring-4 ring-white"
                />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
              </div>
              {/* Basic Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{employee?.name || user?.name}</h2>
                <p className="text-gray-600">{employee?.designation || 'Employee'}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="primary">{employee?.department || user?.department}</Badge>
                  <Badge variant="outline">{employee?.faculty || user?.faculty}</Badge>
                  <Badge variant={employee?.status === 'Active' ? 'success' : 'warning'}>
                    {employee?.status || 'Active'}
                  </Badge>
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditForm({
                      name: employee?.name || '',
                      designation: employee?.designation || '',
                      department: employee?.department || '',
                      faculty: employee?.faculty || '',
                      status: employee?.status || 'Active',
                    });
                    setShowEditModal(true);
                  }}
                  className="gap-2"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </Card>
        {/* Dummy Info Card */}
        <Card className="mt-4" title="Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-500 text-xs">Email</div>
              <div className="font-medium">john.doe@cecos.edu.pk</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Phone</div>
              <div className="font-medium">+92 300 1234567</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">CNIC</div>
              <div className="font-medium">12345-6789012-3</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Joining Date</div>
              <div className="font-medium">2022-08-15</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Address</div>
              <div className="font-medium">123 Main Street, Peshawar</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Supervisor</div>
              <div className="font-medium">Dr. Ahmad Khan</div>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="publications">
        <Card
          title="Publications"
          className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"
                />
              </svg>
              Publications
            </h4>
            <Button
              onClick={() => {
                setPublicationForm({ title: '', journal: '', year: '', link: '', document: '' });
                setPublicationEditIndex(null);
                setShowPublicationModal(true);
              }}
              className="shadow-md"
            >
              + Add Publication
            </Button>
          </div>
          {publications.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No publications added yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publications.map((pub, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-blue-100 bg-white/80 shadow p-4 flex flex-col gap-2 relative group hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 uppercase tracking-wide">
                      {pub.type || 'Book'}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {pub.year || pub.datePublished || pub.dateOfPublish || pub.paperDate || ''}
                    </span>
                  </div>
                  <div
                    className="font-bold text-blue-900 text-base truncate"
                    title={pub.title || pub.bookTitle}
                  >
                    {pub.type === 'book' ? pub.bookTitle : pub.title}
                  </div>
                  <div className="text-sm text-gray-700 truncate">
                    {pub.type === 'book' && pub.author}
                    {pub.type === 'research' && pub.journalAddress}
                    {pub.type === 'conference' && pub.conferenceAddress}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {pub.website && (
                      <a
                        href={pub.website}
                        className="text-blue-600 text-xs underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                      </a>
                    )}
                    {pub.doi && (
                      <a
                        href={pub.doi}
                        className="text-blue-600 text-xs underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        DOI
                      </a>
                    )}
                    {pub.webLink && (
                      <a
                        href={pub.webLink}
                        className="text-blue-600 text-xs underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Web Link
                      </a>
                    )}
                    {pub.document && (
                      <a
                        href={pub.document}
                        className="text-green-700 text-xs underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setPublicationType(pub.type || 'book');
                        setPublicationForm(pub.type ? { ...pub } : initialForms.book);
                        setPublicationEditIndex(idx);
                        setShowPublicationModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="xs" variant="danger" onClick={() => handleRemovePublication(idx)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="fyp">
        <Card title="FYP Supervised">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setFYPForm({
                  period: '',
                  projectTitle: '',
                  studentNames: '',
                  status: 'ongoing',
                  numberOfStudents: '',
                  awardLevel: null,
                  technicalPapers: '',
                  productsDevloped: '',
                  prototypeCompleted: '',
                  otherInfo: '',
                });
                setFYPEditId(null);
                setShowFYPModal(true);
              }}
            >
              Add FYP Supervision
            </Button>
          </div>
          {!employee?.fypSupervised || employee.fypSupervised.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No FYP supervisions added yet.</div>
          ) : (
            <div className="space-y-3">
              {employee.fypSupervised.map((fyp) => (
                <Card key={fyp.id} className="bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Badge className="mb-2">{fyp.period}</Badge>
                      <p className="font-semibold text-gray-900">{fyp.projectTitle}</p>
                      <p className="text-sm text-gray-600 mt-1">Students: {fyp.studentNames}</p>
                      {fyp.numberOfStudents && (
                        <p className="text-sm text-gray-600">
                          Number of Students: {fyp.numberOfStudents}
                        </p>
                      )}
                      {fyp.awardLevel && (
                        <p className="text-sm text-gray-600">
                          Awards/Distinction: {fyp.awardLevel}
                        </p>
                      )}
                      {fyp.technicalPapers && (
                        <p className="text-sm text-gray-600">
                          Technical Papers: {fyp.technicalPapers}
                        </p>
                      )}
                      {fyp.productsDevloped && (
                        <p className="text-sm text-gray-600">
                          Products Developed: {fyp.productsDevloped}
                        </p>
                      )}
                      {fyp.prototypeCompleted && (
                        <p className="text-sm text-gray-600">
                          Prototype/Feasibility: {fyp.prototypeCompleted}
                        </p>
                      )}
                      {fyp.otherInfo && (
                        <p className="text-sm text-gray-600">Other Info: {fyp.otherInfo}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Status:{' '}
                        <Badge variant={fyp.status === 'completed' ? 'success' : 'info'}>
                          {fyp.status}
                        </Badge>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditFYP(fyp)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteFYP(fyp.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="thesis">
        <Card title="Thesis Supervised">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setThesisForm({
                  period: '',
                  level: 'MS',
                  thesisTitle: '',
                  studentName: '',
                  status: 'ongoing',
                  conferencePapers: '',
                  researchPaperCategory: '',
                  presentStatus: '',
                });
                setThesisEditId(null);
                setShowThesisModal(true);
              }}
            >
              Add Thesis Supervision
            </Button>
          </div>
          {!employee?.thesisSupervised || employee.thesisSupervised.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No thesis supervisions added yet.</div>
          ) : (
            <div className="space-y-3">
              {employee.thesisSupervised.map((thesis) => (
                <Card key={thesis.id} className="bg-indigo-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <Badge className="bg-indigo-100 text-indigo-700">{thesis.period}</Badge>
                        <Badge variant={thesis.level === 'PhD' ? 'primary' : 'secondary'}>
                          {thesis.level}
                        </Badge>
                      </div>
                      <p className="font-semibold text-gray-900">{thesis.thesisTitle}</p>
                      <p className="text-sm text-gray-600 mt-1">Student: {thesis.studentName}</p>
                      {thesis.conferencePapers && (
                        <p className="text-sm text-gray-600">
                          Conference Papers: {thesis.conferencePapers}
                        </p>
                      )}
                      {thesis.researchPaperCategory && (
                        <p className="text-sm text-gray-600">
                          Research Category/IF: {thesis.researchPaperCategory}
                        </p>
                      )}
                      {thesis.presentStatus && (
                        <p className="text-sm text-gray-600">
                          Present Status: {thesis.presentStatus}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Status:{' '}
                        <Badge variant={thesis.status === 'completed' ? 'success' : 'info'}>
                          {thesis.status}
                        </Badge>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditThesis(thesis)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteThesis(thesis.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="grants">
        <Card title="Research Grants">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setGrantForm({
                  period: '',
                  grantName: '',
                  fundingAgency: '',
                  amount: '',
                  amountObtained: '',
                  approvedDate: '',
                  outcome: 'pending',
                  status: 'active',
                  notes: '',
                });
                setGrantEditId(null);
                setShowGrantModal(true);
              }}
            >
              Add Research Grant
            </Button>
          </div>
          {!employee?.researchGrants || employee.researchGrants.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No research grants added yet.</div>
          ) : (
            <div className="space-y-3">
              {employee.researchGrants.map((grant) => (
                <Card key={grant.id} className="bg-green-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Badge className="mb-2 bg-green-100 text-green-700">{grant.period}</Badge>
                      <p className="font-semibold text-gray-900">{grant.grantName}</p>
                      <p className="text-sm text-gray-600 mt-1">Agency: {grant.fundingAgency}</p>
                      <p className="text-sm text-gray-600">
                        Amount: PKR {Number(grant.amount).toLocaleString()}
                      </p>
                      {grant.amountObtained && (
                        <p className="text-sm text-gray-600">
                          Amount Obtained: PKR {Number(grant.amountObtained).toLocaleString()}
                        </p>
                      )}
                      {grant.approvedDate && (
                        <p className="text-sm text-gray-600">Approved: {grant.approvedDate}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Status:{' '}
                        <Badge variant={grant.status === 'completed' ? 'success' : 'info'}>
                          {grant.status}
                        </Badge>
                        {grant.outcome && (
                          <span className="ml-2">
                            Outcome:{' '}
                            <Badge
                              variant={
                                grant.outcome === 'approved' || grant.outcome === 'awarded'
                                  ? 'success'
                                  : grant.outcome === 'rejected'
                                    ? 'destructive'
                                    : 'info'
                              }
                            >
                              {grant.outcome}
                            </Badge>
                          </span>
                        )}
                      </p>
                      {grant.notes && (
                        <p className="text-sm text-gray-600 mt-1">Notes: {grant.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditGrant(grant)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGrant(grant.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="admin-duties">
        <Card title="Administrative Duties">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setAdminDutyForm({
                  dutyLevel: 'departmental',
                  dutyType: '',
                  assignedBy: '',
                  roleDescription: '',
                  creditHourExemption: false,
                  extraAllowance: false,
                });
                setAdminDutyEditId(null);
                setShowAdminDutyModal(true);
              }}
            >
              Add Administrative Duty
            </Button>
          </div>
          {!employee?.administrativeDuties || employee.administrativeDuties.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No administrative duties added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {employee.administrativeDuties.map((duty) => (
                <Card key={duty.id} className="bg-purple-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <Badge className="bg-purple-100 text-purple-700">{duty.dutyLevel}</Badge>
                        <Badge variant="secondary">{duty.dutyType}</Badge>
                      </div>
                      <p className="font-semibold text-gray-900">Assigned by: {duty.assignedBy}</p>
                      {duty.roleDescription && (
                        <p className="text-sm text-gray-600 mt-2">{duty.roleDescription}</p>
                      )}
                      <div className="flex gap-2 mt-2 text-xs text-gray-600">
                        {duty.creditHourExemption && (
                          <Badge variant="info">Credit Hour Exemption</Badge>
                        )}
                        {duty.extraAllowance && <Badge variant="success">Extra Allowance</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditAdminDuty(duty)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAdminDuty(duty.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="cecpf">
        <Card title="CECPF Provident Fund">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Apply for CECPF Provident Fund</h2>
            <p className="text-gray-600 mb-4">
              Submit your application for the CECOS Employees Contributory Provident Fund. Your
              request will be reviewed by the Finance department.
            </p>
            <div className="max-w-xl">
              <EmployeeRequestForm />
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="qualifications">
        <Card title="Qualifications">
          <div className="flex justify-end mb-2">
            <Button
              onClick={() => {
                setQualificationForm({
                  degree: '',
                  institution: '',
                  field: '',
                  year: '',
                  document: '',
                });
                setQualificationEditIndex(null);
                setShowQualificationModal(true);
              }}
            >
              Add Qualification
            </Button>
          </div>
          {qualifications.length === 0 ? (
            <div className="text-gray-500">No qualifications added yet.</div>
          ) : (
            <ul className="divide-y">
              {qualifications.map((q, idx) => (
                <li key={idx} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{q.degree}</div>
                    <div className="text-sm text-gray-600">
                      {q.institution} ({q.year})
                    </div>
                    <div className="text-xs text-gray-500">{q.field}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setQualificationForm(q);
                        setQualificationEditIndex(idx);
                        setShowQualificationModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveQualification(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </TabsContent>

      {/* Edit Profile Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!employee?.id) return;
            submitProfileUpdateRequest(employee.id, editForm, {
              requestedBy: employee?.name || user?.name,
              notes: 'Profile update',
            });
            setShowEditModal(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="w-full border rounded p-2"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Designation</label>
            <input
              className="w-full border rounded p-2"
              value={editForm.designation}
              onChange={(e) => setEditForm((f) => ({ ...f, designation: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Department</label>
            <input
              className="w-full border rounded p-2"
              value={editForm.department}
              onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Faculty</label>
            <input
              className="w-full border rounded p-2"
              value={editForm.faculty}
              onChange={(e) => setEditForm((f) => ({ ...f, faculty: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              className="w-full border rounded p-2"
              value={editForm.status}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Publication Modal */}
      <Modal
        open={showPublicationModal}
        onClose={() => {
          setShowPublicationModal(false);
          setPublicationEditIndex(null);
          setPublicationType('book');
          setPublicationForm(initialForms.book);
        }}
        title={publicationEditIndex !== null ? 'Edit Publication' : 'Add Publication'}
      >
        <form onSubmit={handlePublicationSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Publication Type</label>
            <select
              className="w-full border rounded p-2"
              value={publicationType}
              onChange={(e) => {
                const type = e.target.value;
                setPublicationType(type);
                setPublicationForm(initialForms[type]);
              }}
              disabled={publicationEditIndex !== null}
            >
              <option value="book">Book Writing</option>
              <option value="research">Research Publication</option>
              <option value="conference">Conference Paper</option>
            </select>
          </div>
          {publicationType === 'book' && (
            <BookWritingForm form={publicationForm} setForm={setPublicationForm} />
          )}
          {publicationType === 'research' && (
            <ResearchPublicationForm form={publicationForm} setForm={setPublicationForm} />
          )}
          {publicationType === 'conference' && (
            <ConferencePaperForm form={publicationForm} setForm={setPublicationForm} />
          )}
          <div>
            <label className="block text-sm font-medium">Document</label>
            <FileUpload onChange={handlePublicationFileChange} />
            {publicationForm.document && (
              <div className="mt-2">
                <a
                  href={publicationForm.document}
                  className="text-blue-600 text-xs underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Uploaded Document
                </a>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPublicationModal(false);
                setPublicationEditIndex(null);
                setPublicationType('book');
                setPublicationForm(initialForms.book);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Qualification Modal */}
      <Modal
        open={showQualificationModal}
        onClose={() => setShowQualificationModal(false)}
        title={qualificationEditIndex !== null ? 'Edit Qualification' : 'Add Qualification'}
      >
        <form onSubmit={handleQualificationSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Degree</label>
            <input
              className="w-full border rounded p-2"
              value={qualificationForm.degree}
              onChange={(e) => setQualificationForm((f) => ({ ...f, degree: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Institution</label>
            <input
              className="w-full border rounded p-2"
              value={qualificationForm.institution}
              onChange={(e) => setQualificationForm((f) => ({ ...f, institution: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Field</label>
            <input
              className="w-full border rounded p-2"
              value={qualificationForm.field}
              onChange={(e) => setQualificationForm((f) => ({ ...f, field: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Year</label>
            <input
              className="w-full border rounded p-2"
              value={qualificationForm.year}
              onChange={(e) => setQualificationForm((f) => ({ ...f, year: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Document</label>
            <FileUpload onChange={handleQualificationFileChange} />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowQualificationModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* FYP Supervision Modal */}
      <Modal
        open={showFYPModal}
        onClose={() => setShowFYPModal(false)}
        title={fypEditId ? 'Edit FYP Supervision' : 'Add FYP Supervision'}
      >
        <form onSubmit={handleFYPSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fall Semester *</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={fypForm.period}
              onChange={(e) => setFYPForm({ ...fypForm, period: e.target.value })}
              required
            >
              <option value="">Select semester</option>
              {getFallSemesters().map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project Title *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={fypForm.projectTitle}
              onChange={(e) => setFYPForm({ ...fypForm, projectTitle: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Student Names *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="e.g., Ali Ahmed, Sara Khan"
              value={fypForm.studentNames}
              onChange={(e) => setFYPForm({ ...fypForm, studentNames: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={fypForm.status}
              onChange={(e) => setFYPForm({ ...fypForm, status: e.target.value })}
              required
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Students</label>
            <input
              type="number"
              min="1"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="e.g., 3"
              value={fypForm.numberOfStudents}
              onChange={(e) => setFYPForm({ ...fypForm, numberOfStudents: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Distinction / Award Won</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={fypForm.awardLevel || ''}
              onChange={(e) => setFYPForm({ ...fypForm, awardLevel: e.target.value || null })}
            >
              <option value="">-- Select Award Level --</option>
              <option value="departmental">Departmental Level</option>
              <option value="university">University Level</option>
              <option value="district">District Level</option>
              <option value="provincial">Provincial Level</option>
              <option value="national">National Level</option>
              <option value="international">International Level</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Technical Paper Produced from the Project
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="e.g., Paper accepted at IEEE conference 2025"
              value={fypForm.technicalPapers}
              onChange={(e) => setFYPForm({ ...fypForm, technicalPapers: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Any Other Product Developed Using the FYP
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="e.g., Mobile app, web platform, IoT device"
              value={fypForm.productsDevloped}
              onChange={(e) => setFYPForm({ ...fypForm, productsDevloped: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Prototype or Feasibility Study Completed
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="e.g., Working prototype demonstrated, Feasibility study report submitted"
              value={fypForm.prototypeCompleted}
              onChange={(e) => setFYPForm({ ...fypForm, prototypeCompleted: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Other Relevant Information</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={3}
              placeholder="Additional details about the project supervision"
              value={fypForm.otherInfo}
              onChange={(e) => setFYPForm({ ...fypForm, otherInfo: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowFYPModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Thesis Supervision Modal */}
      <Modal
        open={showThesisModal}
        onClose={() => setShowThesisModal(false)}
        title={thesisEditId ? 'Edit Thesis Supervision' : 'Add Thesis Supervision'}
      >
        <form onSubmit={handleThesisSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fall Semester *</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={thesisForm.period}
              onChange={(e) => setThesisForm({ ...thesisForm, period: e.target.value })}
              required
            >
              <option value="">Select semester</option>
              {getFallSemesters().map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level *</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={thesisForm.level}
              onChange={(e) => setThesisForm({ ...thesisForm, level: e.target.value })}
              required
            >
              <option value="MS">MS</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Thesis Title *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={thesisForm.thesisTitle}
              onChange={(e) => setThesisForm({ ...thesisForm, thesisTitle: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Student Name *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={thesisForm.studentName}
              onChange={(e) => setThesisForm({ ...thesisForm, studentName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={thesisForm.status}
              onChange={(e) => setThesisForm({ ...thesisForm, status: e.target.value })}
              required
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Conference Papers Produced from Thesis
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="e.g., 2 papers presented at ICSE 2024, IEEE 2025"
              value={thesisForm.conferencePapers}
              onChange={(e) => setThesisForm({ ...thesisForm, conferencePapers: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Research Paper Category (HEC W/X/Y/Z) / Impact Factor
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="e.g., HEC W category, IF: 3.5"
              value={thesisForm.researchPaperCategory}
              onChange={(e) =>
                setThesisForm({ ...thesisForm, researchPaperCategory: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Present Status of Thesis</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={3}
              placeholder="e.g., Data collection completed, writing Chapter 3, defense scheduled for March 2026"
              value={thesisForm.presentStatus}
              onChange={(e) => setThesisForm({ ...thesisForm, presentStatus: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowThesisModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Research Grant Modal */}
      <Modal
        open={showGrantModal}
        onClose={() => setShowGrantModal(false)}
        title={grantEditId ? 'Edit Research Grant' : 'Add Research Grant'}
      >
        <form onSubmit={handleGrantSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fall Semester *</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={grantForm.period}
              onChange={(e) => setGrantForm({ ...grantForm, period: e.target.value })}
              required
            >
              <option value="">Select semester</option>
              {getFallSemesters().map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Grant Name *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={grantForm.grantName}
              onChange={(e) => setGrantForm({ ...grantForm, grantName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Funding Agency *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={grantForm.fundingAgency}
              onChange={(e) => setGrantForm({ ...grantForm, fundingAgency: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount (PKR) *</label>
            <input
              type="number"
              min="0"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={grantForm.amount}
              onChange={(e) => setGrantForm({ ...grantForm, amount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount of Funding Obtained (PKR)
            </label>
            <input
              type="number"
              min="0"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={grantForm.amountObtained}
              onChange={(e) => setGrantForm({ ...grantForm, amountObtained: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Funding/Application Approved Date
              {(grantForm.outcome === 'approved' || grantForm.outcome === 'awarded') && (
                <span className="text-red-600 ml-1">*</span>
              )}
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={grantForm.approvedDate}
              onChange={(e) => setGrantForm({ ...grantForm, approvedDate: e.target.value })}
              required={grantForm.outcome === 'approved' || grantForm.outcome === 'awarded'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Outcome</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={grantForm.outcome}
              onChange={(e) => setGrantForm({ ...grantForm, outcome: e.target.value })}
            >
              <option value="proposal developed">Proposal Developed</option>
              <option value="send to funding agency">Send to Funding Agency</option>
              <option value="approved by funding agency">Approved by Funding Agency</option>
              <option value="disapproved by funding agency">Disapproved by Funding Agency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={grantForm.status}
              onChange={(e) => setGrantForm({ ...grantForm, status: e.target.value })}
              required
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes / Additional Information</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={3}
              value={grantForm.notes}
              onChange={(e) => setGrantForm({ ...grantForm, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowGrantModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Administrative Duty Modal */}
      <Modal
        open={showAdminDutyModal}
        onClose={() => setShowAdminDutyModal(false)}
        title={adminDutyEditId ? 'Edit Administrative Duty' : 'Add Administrative Duty'}
      >
        <form onSubmit={handleAdminDutySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Level of Duty *</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={adminDutyForm.dutyLevel}
              onChange={(e) => setAdminDutyForm({ ...adminDutyForm, dutyLevel: e.target.value })}
              required
            >
              <option value="departmental">Departmental</option>
              <option value="university">University</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duty Type *</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={adminDutyForm.dutyType}
              onChange={(e) => setAdminDutyForm({ ...adminDutyForm, dutyType: e.target.value })}
              required
            >
              <option value="">-- Select Duty Type --</option>
              <option value="QEC">QEC</option>
              <option value="OBE">OBE</option>
              <option value="CQI">CQI</option>
              <option value="Curriculum">Curriculum</option>
              <option value="Batch Advisor">Batch Advisor</option>
              <option value="Board of Studies">Board of Studies</option>
              <option value="Internship">Internship</option>
              <option value="Board of Faculty">Board of Faculty</option>
              <option value="Academic Council">Academic Council</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duty Assigned by *</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={adminDutyForm.assignedBy}
              onChange={(e) => setAdminDutyForm({ ...adminDutyForm, assignedBy: e.target.value })}
              required
            >
              <option value="">-- Select Assigned By --</option>
              <option value="HoD">HoD</option>
              <option value="Dean">Dean</option>
              <option value="Registration">Registration</option>
              <option value="Vice Chancellor">Vice Chancellor</option>
              <option value="Vice President">Vice President</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Role of Participating Faculty Member
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={3}
              placeholder="Describe the role and responsibilities..."
              value={adminDutyForm.roleDescription}
              onChange={(e) =>
                setAdminDutyForm({ ...adminDutyForm, roleDescription: e.target.value })
              }
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={adminDutyForm.creditHourExemption}
                onChange={(e) =>
                  setAdminDutyForm({ ...adminDutyForm, creditHourExemption: e.target.checked })
                }
                className="w-4 h-4"
              />
              Credit Hour Exemption Applicable
            </label>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={adminDutyForm.extraAllowance}
                onChange={(e) =>
                  setAdminDutyForm({ ...adminDutyForm, extraAllowance: e.target.checked })
                }
                className="w-4 h-4"
              />
              Extra Allowance of the Duty
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowAdminDutyModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </Tabs>
  );
}
