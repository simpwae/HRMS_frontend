import { useState } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import InputWithIcon from '../../../components/InputWithIcon';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const policyDocuments = [
  {
    id: 10,
    title: 'CECPF Provident Fund Policy',
    description:
      'Official policy document for the CECOS Employees Contributory Provident Fund (CECPF), including eligibility, application, and withdrawal procedures.',
    category: 'Benefits',
    fileSize: '2.0 MB',
    format: 'PDF',
    lastUpdated: '2021-12-10',
    status: 'Active',
    downloadUrl: "/PDF's/4. CECPF 10 Dec 21.pdf",
  },
  {
    id: 1,
    title: 'Harassment Policy',
    description:
      'Comprehensive guidelines on prevention, reporting, and handling of harassment cases in the workplace.',
    category: 'Workplace Conduct',
    fileSize: '2.4 MB',
    format: 'PDF',
    lastUpdated: '2024-11-15',
    status: 'Active',
    downloadUrl: "/PDF's/HARASSMENT-POLICY.pdf",
  },
  {
    id: 2,
    title: 'COVID-19 Pandemic Attendance Policy',
    description: 'Special attendance guidelines and protocols during COVID-19 pandemic situations.',
    category: 'Attendance',
    fileSize: '1.8 MB',
    format: 'PDF',
    lastUpdated: '2024-10-20',
    status: 'Active',
    downloadUrl: "/PDF's/COVID-19 Pandemic Attendance Policy.pdf",
  },
  {
    id: 3,
    title: 'Faculty Promotion Proforma',
    description:
      'Official form and guidelines for faculty promotion applications and evaluation criteria.',
    category: 'Promotion',
    fileSize: '3.1 MB',
    format: 'PDF',
    lastUpdated: '2024-12-01',
    status: 'Active',
    downloadUrl: "/PDF's/Faculty Promotion Proforma_Updated (1).docx.pdf",
  },
  {
    id: 4,
    title: 'Private Consultancy Policy',
    description:
      'Official notification and guidelines for CECOS University private consultancy services and regulations.',
    category: 'Workplace Conduct',
    fileSize: '1.2 MB',
    format: 'PDF',
    lastUpdated: '2024-09-15',
    status: 'Active',
    downloadUrl: "/PDF's/Notification CECOS University Private Consultancy.pdf",
  },
  {
    id: 5,
    title: 'CPD Courses Policy',
    description:
      'Continuing Professional Development (CPD) courses policy and enrollment guidelines for faculty and staff.',
    category: 'Benefits',
    fileSize: '0.9 MB',
    format: 'PDF',
    lastUpdated: '2024-08-22',
    status: 'Active',
    downloadUrl: "/PDF's/Notification CPD Courses Policy.pdf",
  },
  {
    id: 6,
    title: 'Employees Grievance Committee',
    description:
      'Official notification establishing the Employees Grievance Committee and procedures for filing complaints.',
    category: 'Workplace Conduct',
    fileSize: '0.7 MB',
    format: 'PDF',
    lastUpdated: '2024-07-10',
    status: 'Active',
    downloadUrl: "/PDF's/Notification Employees Grievance Committee.pdf",
  },
  {
    id: 7,
    title: 'Employees Resignation Policy',
    description:
      'Official policy and procedures for employee resignation, notice period, and exit formalities.',
    category: 'Workplace Conduct',
    fileSize: '1.1 MB',
    format: 'PDF',
    lastUpdated: '2024-06-18',
    status: 'Active',
    downloadUrl: "/PDF's/Notification of Employees Resignation Policy.pdf",
  },
  {
    id: 8,
    title: 'Official Email Policy',
    description:
      'Guidelines and policy for official email usage, communication protocols, and email security.',
    category: 'Workplace Conduct',
    fileSize: '0.8 MB',
    format: 'PDF',
    lastUpdated: '2024-05-25',
    status: 'Active',
    downloadUrl: "/PDF's/Notification of Official Email.pdf",
  },
  {
    id: 9,
    title: 'Provident Fund Policy',
    description:
      'Official notification regarding employee provident fund contributions, benefits, and withdrawal procedures.',
    category: 'Benefits',
    fileSize: '1.5 MB',
    format: 'PDF',
    lastUpdated: '2024-04-12',
    status: 'Active',
    downloadUrl: "/PDF's/Notification of Provident Fund.pdf",
  },
];

const categories = [
  'All',
  'Workplace Conduct',
  'Attendance',
  'Promotion',
  'Leave',
  'Salary',
  'Benefits',
];

export default function PolicyAdvisory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPolicies = policyDocuments.filter((policy) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || policy.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDownload = (policy) => {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = policy.downloadUrl;
    link.download = `${policy.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const variants = {
      Active: 'success',
      Archived: 'default',
      'Under Review': 'warning',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const categoryCounts = {
    All: policyDocuments.length,
    'Workplace Conduct': policyDocuments.filter((p) => p.category === 'Workplace Conduct').length,
    Attendance: policyDocuments.filter((p) => p.category === 'Attendance').length,
    Promotion: policyDocuments.filter((p) => p.category === 'Promotion').length,
    Leave: 0,
    Salary: 0,
    Benefits: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Policy Advisory</h1>
        <p className="text-gray-600">
          Access and download official university policies and documents
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{policyDocuments.length}</p>
              <p className="text-xs text-blue-700">Available Policies</p>
            </div>
          </div>
        </Card>

        <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {policyDocuments.filter((p) => p.status === 'Active').length}
              </p>
              <p className="text-xs text-green-700">Active</p>
            </div>
          </div>
        </Card>

        <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-lg">
              <ArrowDownTrayIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{categories.length - 1}</p>
              <p className="text-xs text-purple-700">Categories</p>
            </div>
          </div>
        </Card>

        <Card className="bg-linear-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 rounded-lg">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">
                {new Date(
                  Math.max(...policyDocuments.map((p) => new Date(p.lastUpdated))),
                ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xs text-amber-700">Last Updated</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <InputWithIcon
              type="text"
              placeholder="Search policies by title, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              inputClassName="pr-4 py-2.5 text-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category} {categoryCounts[category] > 0 && `(${categoryCounts[category]})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Policy Documents Grid */}
      {filteredPolicies.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ExclamationCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Found</h3>
            <p className="text-gray-500">
              Try adjusting your search query or filter to find what you're looking for.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredPolicies.map((policy) => (
            <Card key={policy.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-3 bg-blue-50 rounded-lg shrink-0">
                      <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{policy.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <Badge size="xs" variant="info">
                          {policy.category}
                        </Badge>
                        <span>•</span>
                        <span>{policy.format}</span>
                        <span>•</span>
                        <span>{policy.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(policy.status)}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">{policy.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>Updated: {new Date(policy.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <Button size="sm" onClick={() => handleDownload(policy)} className="gap-2">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500 rounded-lg shrink-0">
            <ExclamationCircleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Important Notice</h3>
            <p className="text-sm text-gray-700 mb-3">
              All employees are required to review and acknowledge the policies relevant to their
              role. For questions or clarifications about any policy, please contact the HR
              department.
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Policies are regularly updated to reflect current regulations</li>
              <li>Download and keep a copy for your reference</li>
              <li>Contact HR if you need assistance understanding any policy</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
