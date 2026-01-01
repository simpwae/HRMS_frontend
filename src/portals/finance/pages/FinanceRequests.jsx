import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import DataTable from '../../../components/DataTable';
import {
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const REQUESTS = [
  {
    id: 'r-1',
    name: 'John Doe',
    type: 'Refundable',
    requested: 90000,
    eligible: 80000,
    status: 'Approved',
    submittedOn: '2025-12-12',
  },
  {
    id: 'r-2',
    name: 'Sara Khan',
    type: 'Non-Refundable',
    requested: 100000,
    eligible: 96000,
    status: 'Pending',
    submittedOn: '2025-12-10',
  },
  {
    id: 'r-3',
    name: 'Ali Raza',
    type: 'Refundable',
    requested: 70000,
    eligible: 64000,
    status: 'Rejected',
    submittedOn: '2025-12-08',
  },
];

export default function FinanceRequests() {
  const [requests] = useState(REQUESTS);

  const columns = useMemo(
    () => [
      {
        header: 'Employee',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div>
            <div className="font-semibold">{row.original.name}</div>
            <div className="text-xs text-gray-500">{row.original.type}</div>
          </div>
        ),
      },
      {
        header: 'Requested',
        accessorKey: 'requested',
        cell: ({ row }) => `PKR ${row.original.requested.toLocaleString()}`,
      },
      {
        header: 'Eligible',
        accessorKey: 'eligible',
        cell: ({ row }) => `PKR ${row.original.eligible.toLocaleString()}`,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge variant={s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : 'warning'}>
              {s}
            </Badge>
          );
        },
      },
      {
        header: 'Date',
        accessorKey: 'submittedOn',
        cell: ({ row }) => format(new Date(row.original.submittedOn), 'MMM d, yyyy'),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Provident Fund Requests</h1>
        <p className="text-gray-600">View and manage all employee requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
            <BanknotesIcon className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((r) => r.status === 'Approved').length}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((r) => r.status === 'Rejected').length}
              </p>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-400" />
          </div>
        </Card>
      </div>

      <DataTable
        data={requests}
        columns={columns}
        searchPlaceholder="Search requests..."
        showSearch
        pageSize={10}
      />
    </div>
  );
}
