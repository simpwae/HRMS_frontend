import { useMemo, useState } from 'react';
import { useDataStore } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

const statusBadge = (status) => {
  const variants = { Pending: 'warning', Approved: 'success', Rejected: 'error' };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
};

export default function ProfileRequests() {
  const user = useAuthStore((s) => s.user);
  const { profileUpdateRequests, reviewProfileUpdateRequest } = useDataStore();

  const [tab, setTab] = useState('Pending');
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState({ status: 'Approved', notes: '' });

  const filtered = useMemo(
    () => profileUpdateRequests.filter((r) => r.status === tab),
    [profileUpdateRequests, tab],
  );

  const handleDecision = () => {
    if (!selected) return;
    reviewProfileUpdateRequest(selected.id, {
      status: decision.status,
      notes: decision.notes,
      reviewer: user?.name || 'HR',
    });
    setSelected(null);
    setDecision({ status: 'Approved', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Update Requests</h1>
          <p className="text-gray-600">
            HR-controlled approvals for employee self-service changes.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClipboardDocumentCheckIcon className="w-5 h-5" />
          {profileUpdateRequests.length} requests
        </div>
      </div>

      <Card>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
            <TabsTrigger value="Approved">Approved</TabsTrigger>
            <TabsTrigger value="Rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ClockIcon className="w-4 h-4" /> No requests in this state
            </div>
          ) : (
            filtered.map((req) => (
              <div
                key={req.id}
                className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-gray-50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{req.employeeName}</h3>
                    {statusBadge(req.status)}
                  </div>
                  <p className="text-sm text-gray-600">Requested by {req.requestedBy}</p>
                  <p className="text-xs text-gray-500">Submitted {req.requestedOn}</p>
                  <div className="text-xs text-gray-600 flex flex-wrap gap-1">
                    {Object.keys(req.changes || {}).map((field) => (
                      <span key={field} className="px-2 py-1 bg-gray-100 rounded-full">
                        {field}
                      </span>
                    ))}
                  </div>
                  {req.notes && <p className="text-sm text-gray-500">Note: {req.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelected(req)}>
                    <PencilSquareIcon className="w-4 h-4" />
                    Review
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Review Profile Update"
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <UserIcon className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-900">{selected.employeeName}</p>
                <p className="text-sm text-gray-500">Requested on {selected.requestedOn}</p>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
              <p className="text-sm font-medium text-gray-800">Requested Changes</p>
              {Object.entries(selected.changes || {}).map(([field, value]) => (
                <div key={field} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{field}</span>
                  <span className="text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" /> {selected.status}
              </div>
              {selected.reviewedBy && (
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" /> Reviewed by{' '}
                  {selected.reviewedBy}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
              <select
                value={decision.status}
                onChange={(e) => setDecision((d) => ({ ...d, status: e.target.value }))}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Approved">Approve</option>
                <option value="Rejected">Reject</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={decision.notes}
                onChange={(e) => setDecision((d) => ({ ...d, notes: e.target.value }))}
                rows={3}
                placeholder="Add optional comments for audit trail"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleDecision}
                className={decision.status === 'Rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {decision.status === 'Rejected' ? (
                  <span className="flex items-center gap-1">
                    <XCircleIcon className="w-4 h-4" /> Reject
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" /> Approve
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
