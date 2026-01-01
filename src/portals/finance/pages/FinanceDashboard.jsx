import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import Card from '../../../components/Card';
import StatCard from '../../../components/StatCard';
import DataTable from '../../../components/DataTable';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import {
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const INIT_REQUESTS = [
  {
    id: 'r-1',
    name: 'John Doe',
    balance: 100000,
    requested: 90000,
    serviceYears: 5,
    type: 'Refundable',
    age: 40,
    submittedOn: '2025-12-12',
    status: 'Pending',
  },
  {
    id: 'r-2',
    name: 'Sara Khan',
    balance: 120000,
    requested: 100000,
    serviceYears: 7,
    type: 'Non-Refundable',
    age: 52,
    submittedOn: '2025-12-10',
    status: 'Pending',
  },
  {
    id: 'r-3',
    name: 'Ali Raza',
    balance: 80000,
    requested: 70000,
    serviceYears: 2,
    type: 'Refundable',
    age: 29,
    submittedOn: '2025-12-08',
    status: 'Rejected',
  },
];

export default function FinanceDashboard() {
  const [requests, setRequests] = useState(INIT_REQUESTS);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null); // selected request for modal

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'Pending').length;
    const approvedThisMonth = requests.filter((r) => r.status === 'Approved').length;
    const totalDisbursed = requests
      .filter((r) => r.status === 'Approved')
      .reduce((sum, r) => sum + r.requested, 0);
    const overLimit = requests.filter((r) => r.requested > r.balance * 0.8).length;
    return { pending, approvedThisMonth, totalDisbursed, overLimit };
  }, [requests]);

  const filtered = useMemo(() => {
    return requests.filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter));
  }, [requests, statusFilter]);

  const columns = useMemo(
    () => [
      {
        header: 'Employee',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
              {row.original.name?.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5" /> {row.original.type}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: 'Requested',
        accessorKey: 'requested',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.requested.toLocaleString()}</span>
        ),
      },
      {
        header: 'Eligible (80%)',
        accessorKey: 'eligible',
        cell: ({ row }) => (row.original.balance * 0.8).toLocaleString(),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => {
          const s = row.original.status;
          const over = row.original.requested > row.original.balance * 0.8;
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant={s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : 'warning'}
              >
                {s}
              </Badge>
              {over && (
                <Badge variant="danger" size="xs">
                  Over Limit
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        header: 'Submitted',
        accessorKey: 'submittedOn',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <CalendarDaysIcon className="w-4 h-4" />
            {format(new Date(row.original.submittedOn), 'MMM d, yyyy')}
          </div>
        ),
      },
      {
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          const over = r.requested > r.balance * 0.8;
          const disabled = r.status !== 'Pending' || over;
          return (
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={disabled} onClick={() => setSelected(r)}>
                <CheckCircleIcon className="w-4 h-4" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={r.status !== 'Pending'}
                onClick={() => handleReject(r.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircleIcon className="w-4 h-4" /> Reject
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const handleApprove = (id) => {
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r)));
    setSelected(null);
  };

  const handleReject = (id) => {
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CECPF Provident Fund Requests</h1>
        <p className="text-gray-600">Review and process employee fund withdrawals/loans</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={ExclamationTriangleIcon}
          color="warning"
          trendValue={`+${Math.max(0, stats.pending - 0)}`}
          subtitle="Awaiting decision"
        />
        <StatCard
          title="Approved (Month)"
          value={stats.approvedThisMonth}
          icon={CheckCircleIcon}
          color="success"
          trendValue={`+${stats.approvedThisMonth}`}
          subtitle="This month"
        />
        <StatCard
          title="Total Disbursed"
          value={stats.totalDisbursed.toLocaleString()}
          icon={BanknotesIcon}
          color="primary"
          trendValue={stats.totalDisbursed ? `+PKR ${stats.totalDisbursed.toLocaleString()}` : '+0'}
          subtitle="All-time"
        />
        <StatCard
          title="Over-Limit"
          value={stats.overLimit}
          icon={XCircleIcon}
          color="danger"
          trendValue={`+${stats.overLimit}`}
          subtitle="Exceed 80%"
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'Pending', 'Approved', 'Rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <DataTable
        data={filtered}
        columns={columns}
        searchPlaceholder="Search employees..."
        showSearch
        pageSize={5}
        emptyMessage="No requests match the filter"
      />

      {/* Approve Modal */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title="Approve Request"
          size="lg"
          actions={
            <>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleApprove(selected.id)}
                disabled={selected.requested > selected.balance * 0.8}
              >
                Approve
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold">
                {selected.name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selected.name}</p>
                <p className="text-sm text-gray-600">
                  Type: <span className="font-medium">{selected.type}</span> • Service:{' '}
                  <span className="font-medium">{selected.serviceYears} yrs</span>
                </p>
                <p className="text-sm text-gray-600">
                  Requested:{' '}
                  <span className="font-medium">{selected.requested.toLocaleString()}</span>
                  {' • '}Eligible (80%):{' '}
                  <span className="font-medium">{(selected.balance * 0.8).toLocaleString()}</span>
                </p>
              </div>
            </div>

            {selected.requested > selected.balance * 0.8 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                Requested amount exceeds 80% eligibility. Adjust before approval.
              </div>
            )}

            <div className="text-sm text-gray-600">
              <span className="font-medium">Submitted:</span>{' '}
              {format(new Date(selected.submittedOn), 'PPP')}
            </div>
            <p className="text-sm text-gray-700">Recovery will be in 30 monthly installments.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
