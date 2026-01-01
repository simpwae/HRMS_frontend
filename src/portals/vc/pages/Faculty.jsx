import { useMemo, useState } from 'react';
import { useDataStore } from '../../../state/data';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Avatar from '../../../components/Avatar';
import {
  AcademicCapIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import InputWithIcon from '../../../components/InputWithIcon';

export default function Faculty() {
  const { employees } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('all');

  const facultyData = useMemo(() => {
    const active = employees.filter((e) => e.status === 'Active');
    const byFaculty = {};

    active.forEach((emp) => {
      if (!emp.faculty) return;
      if (!byFaculty[emp.faculty]) {
        byFaculty[emp.faculty] = {
          name: emp.faculty,
          count: 0,
          departments: {},
          employees: [],
        };
      }
      byFaculty[emp.faculty].count++;
      byFaculty[emp.faculty].employees.push(emp);

      if (emp.department) {
        byFaculty[emp.faculty].departments[emp.department] =
          (byFaculty[emp.faculty].departments[emp.department] || 0) + 1;
      }
    });

    return Object.values(byFaculty);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    let result = employees.filter((e) => e.status === 'Active');

    if (selectedFaculty !== 'all') {
      result = result.filter((e) => e.faculty === selectedFaculty);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.code?.toLowerCase().includes(q) ||
          e.department?.toLowerCase().includes(q) ||
          e.designation?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [employees, selectedFaculty, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <AcademicCapIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Faculty Overview</h1>
            <p className="text-indigo-100 mt-1">Academic staff across all faculties</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {facultyData.map((faculty) => (
          <Card
            key={faculty.name}
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setSelectedFaculty(faculty.name)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{faculty.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{faculty.count}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Object.keys(faculty.departments).length} depts
                </p>
              </div>
              <BuildingOfficeIcon className="w-10 h-10 text-indigo-400" />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <InputWithIcon
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees..."
              className="w-full"
              inputClassName="pr-3 py-2.5"
            />
          </div>
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
          >
            <option value="all">All Faculties</option>
            {facultyData.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
            >
              <Avatar name={emp.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{emp.name}</p>
                <p className="text-sm text-gray-600">{emp.designation}</p>
              </div>
              <div className="text-right">
                <Badge variant="info">{emp.department}</Badge>
                <p className="text-xs text-gray-500 mt-1">{emp.code}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
