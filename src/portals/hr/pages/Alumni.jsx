import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useDataStore, faculties } from '../../../state/data';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import EmptyState from '../../../components/EmptyState';
import InputWithIcon from '../../../components/InputWithIcon';
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Papa from 'papaparse';

const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
];

export default function Alumni() {
  const { alumni } = useDataStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter alumni
  const filteredAlumni = useMemo(() => {
    return alumni.filter((a) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (
          !a.name?.toLowerCase().includes(search) &&
          !a.department?.toLowerCase().includes(search) &&
          !a.designation?.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      // Department filter
      if (departmentFilter !== 'all' && a.department !== departmentFilter) return false;

      // Faculty filter
      if (facultyFilter !== 'all' && a.faculty !== facultyFilter) return false;

      return true;
    });
  }, [alumni, searchTerm, departmentFilter, facultyFilter]);

  // Analytics
  const analytics = useMemo(() => {
    // Exit reasons distribution
    const reasonCounts = {};
    alumni.forEach((a) => {
      const reason = a.exitReason || 'Other';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    const reasonData = Object.entries(reasonCounts).map(([name, value]) => ({ name, value }));

    // Department distribution
    const deptCounts = {};
    alumni.forEach((a) => {
      deptCounts[a.department] = (deptCounts[a.department] || 0) + 1;
    });
    const deptData = Object.entries(deptCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Average tenure
    const avgTenure = alumni.length
      ? (alumni.reduce((sum, a) => sum + (a.yearsOfService || 0), 0) / alumni.length).toFixed(1)
      : 0;

    // Satisfaction scores
    const satisfactionScores = alumni.filter((a) => a.exitSurvey?.satisfaction);
    const avgSatisfaction = satisfactionScores.length
      ? (
          satisfactionScores.reduce((sum, a) => sum + a.exitSurvey.satisfaction, 0) /
          satisfactionScores.length
        ).toFixed(1)
      : 0;

    // Would recommend percentage
    const recommendCount = alumni.filter((a) => a.exitSurvey?.wouldRecommend).length;
    const recommendPct = alumni.length ? Math.round((recommendCount / alumni.length) * 100) : 0;

    return { reasonData, deptData, avgTenure, avgSatisfaction, recommendPct };
  }, [alumni]);

  const handleExport = () => {
    const exportData = filteredAlumni.map((a) => ({
      Name: a.name,
      Email: a.email,
      Department: a.department,
      Faculty: a.faculty,
      Designation: a.designation,
      'Join Date': a.joinDate,
      'Exit Date': a.exitDate,
      'Years of Service': a.yearsOfService,
      'Exit Reason': a.exitReason,
      Satisfaction: a.exitSurvey?.satisfaction || 'N/A',
      'Would Recommend': a.exitSurvey?.wouldRecommend ? 'Yes' : 'No',
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alumni-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const allDepartments = Object.values(faculties).flat();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">University Alumni</h1>
          <p className="text-gray-600">Former employees and exit analytics</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <ArrowDownTrayIcon className="w-5 h-5" />
          Export CSV
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Alumni', value: alumni.length, icon: UserGroupIcon, color: 'indigo' },
          {
            label: 'Avg. Tenure',
            value: `${analytics.avgTenure} yrs`,
            icon: CalendarDaysIcon,
            color: 'purple',
          },
          {
            label: 'Avg. Satisfaction',
            value: `${analytics.avgSatisfaction}/5`,
            icon: ChartBarIcon,
            color: 'blue',
          },
          {
            label: 'Would Recommend',
            value: `${analytics.recommendPct}%`,
            icon: AcademicCapIcon,
            color: 'green',
          },
        ].map((stat) => (
          <Card key={stat.label} className={`bg-${stat.color}-50 border-${stat.color}-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm text-${stat.color}-600`}>{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Exit Reasons" subtitle="Distribution of departure reasons">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.reasonData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {analytics.reasonData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Department Distribution" subtitle="Alumni by department">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={60} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <InputWithIcon
          type="text"
          placeholder="Search alumni..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
          inputClassName="pr-4 py-2 text-sm"
        />
        <select
          value={facultyFilter}
          onChange={(e) => setFacultyFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Faculties</option>
          {Object.keys(faculties).map((fac) => (
            <option key={fac} value={fac}>
              {fac}
            </option>
          ))}
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Departments</option>
          {allDepartments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Alumni List */}
      <Card title={`Alumni Directory (${filteredAlumni.length})`}>
        {filteredAlumni.length === 0 ? (
          <EmptyState
            icon={UserGroupIcon}
            title="No Alumni Found"
            description="No former employees match your search criteria"
          />
        ) : (
          <div className="space-y-4">
            {filteredAlumni.map((alumnus) => (
              <div
                key={alumnus.id}
                className="border rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedAlumni(alumnus);
                  setShowDetailsModal(true);
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold">
                      {alumnus.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{alumnus.name}</h4>
                      <p className="text-sm text-gray-500">
                        {alumnus.designation} • {alumnus.department}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                        <EnvelopeIcon className="w-4 h-4" />
                        {alumnus.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-sm text-gray-500">
                      <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                      {alumnus.yearsOfService} years
                    </div>
                    <div className="text-sm text-gray-500">
                      Left:{' '}
                      {alumnus.exitDate ? format(parseISO(alumnus.exitDate), 'MMM yyyy') : 'N/A'}
                    </div>
                    <Badge variant="default">{alumnus.exitReason}</Badge>
                    {alumnus.exitSurvey && (
                      <ClipboardDocumentCheckIcon
                        className="w-5 h-5 text-green-500"
                        title="Survey completed"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Alumni Details"
        size="lg"
      >
        {selectedAlumni && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {selectedAlumni.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedAlumni.name}</h3>
                <p className="text-gray-500">{selectedAlumni.designation}</p>
                <p className="text-sm text-gray-400">{selectedAlumni.email}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium">{selectedAlumni.department}</p>
              </div>
              <div>
                <p className="text-gray-500">Faculty</p>
                <p className="font-medium">{selectedAlumni.faculty}</p>
              </div>
              <div>
                <p className="text-gray-500">Join Date</p>
                <p className="font-medium">
                  {selectedAlumni.joinDate
                    ? format(parseISO(selectedAlumni.joinDate), 'MMM d, yyyy')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Exit Date</p>
                <p className="font-medium">
                  {selectedAlumni.exitDate
                    ? format(parseISO(selectedAlumni.exitDate), 'MMM d, yyyy')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Years of Service</p>
                <p className="font-medium">{selectedAlumni.yearsOfService} years</p>
              </div>
              <div>
                <p className="text-gray-500">Exit Reason</p>
                <p className="font-medium">{selectedAlumni.exitReason}</p>
              </div>
            </div>

            {/* Exit Survey Results */}
            {selectedAlumni.exitSurvey && (
              <div className="border rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-500" />
                  Exit Survey Responses
                </h4>

                <div className="space-y-4">
                  {/* Ratings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Satisfaction', value: selectedAlumni.exitSurvey.satisfaction },
                      { label: 'Management', value: selectedAlumni.exitSurvey.management },
                      { label: 'Environment', value: selectedAlumni.exitSurvey.workEnvironment },
                      { label: 'Growth', value: selectedAlumni.exitSurvey.growth },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <div className="flex justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className={`w-5 h-5 rounded text-xs flex items-center justify-center ${
                                i <= (item.value || 0)
                                  ? 'bg-yellow-400 text-white'
                                  : 'bg-gray-200 text-gray-400'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Yes/No Questions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Would Recommend</p>
                      <p className="font-medium">
                        {selectedAlumni.exitSurvey.wouldRecommend ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Would Return</p>
                      <p className="font-medium">
                        {selectedAlumni.exitSurvey.wouldReturn ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                  </div>

                  {/* Feedback */}
                  {selectedAlumni.exitSurvey.feedback && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium mb-1">Feedback</p>
                      <p className="text-sm text-blue-700">{selectedAlumni.exitSurvey.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
