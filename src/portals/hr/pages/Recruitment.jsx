import { useMemo, useState } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import InputWithIcon from '../../../components/InputWithIcon';
import { useDataStore, atsStages } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import {
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const stageBadge = {
  applied: 'default',
  screening: 'info',
  shortlisted: 'info',
  technical: 'warning',
  panel: 'warning',
  selection_board: 'info',
  offer: 'success',
  hired: 'success',
  rejected: 'error',
};

export default function Recruitment() {
  const user = useAuthStore((s) => s.user);
  const {
    candidates,
    addCandidate,
    updateCandidateStage,
    addCandidateEvaluation,
    addSelectionBoardApproval,
  } = useDataStore();

  const [activeStage, setActiveStage] = useState('shortlisted');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [decision, setDecision] = useState({ stage: 'offer', notes: '' });
  const [boardDecision, setBoardDecision] = useState({ decision: 'approved', notes: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    source: 'Direct',
    resumeUrl: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Derived lists for filters
  const filteredCandidates = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return candidates.filter((c) => {
      const matchesSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.role?.toLowerCase().includes(q);
      const matchesDept = departmentFilter === 'all' || c.department === departmentFilter;
      const matchesRole = roleFilter === 'all' || c.role === roleFilter;
      const matchesSource =
        sourceFilter === 'all' || (c.source || '').toLowerCase() === sourceFilter;
      return matchesSearch && matchesDept && matchesRole && matchesSource;
    });
  }, [candidates, searchTerm, departmentFilter, roleFilter, sourceFilter]);

  const candidatesByStage = useMemo(() => {
    return atsStages.reduce((acc, stage) => {
      acc[stage.id] = filteredCandidates.filter((c) => c.stage === stage.id);
      return acc;
    }, {});
  }, [filteredCandidates]);

  // Options for filters
  const departmentOptions = useMemo(() => {
    const setDept = new Set(candidates.map((c) => c.department).filter(Boolean));
    return Array.from(setDept);
  }, [candidates]);

  const roleOptions = useMemo(() => {
    const setRole = new Set(candidates.map((c) => c.role).filter(Boolean));
    return Array.from(setRole);
  }, [candidates]);

  const sourceOptions = useMemo(() => {
    const setSource = new Set(
      candidates.map((c) => (c.source || '').toLowerCase()).filter(Boolean),
    );
    return Array.from(setSource);
  }, [candidates]);

  // KPI stats
  const stats = useMemo(() => {
    const total = candidates.length;
    const offers = candidates.filter((c) => c.stage === 'offer').length;
    const hired = candidates.filter((c) => c.stage === 'hired').length;
    const now = new Date();
    const timeInStageDays = candidates
      .map((c) => {
        const ref = c.stageUpdatedOn || c.appliedOn;
        if (!ref) return null;
        return Math.max(0, differenceInDays(now, parseISO(ref)));
      })
      .filter((d) => d !== null);
    const avgStage = timeInStageDays.length
      ? Math.round(timeInStageDays.reduce((a, b) => a + b, 0) / timeInStageDays.length)
      : 0;

    return {
      total,
      offers,
      hired,
      avgStage,
    };
  }, [candidates]);

  const handleAdvanceStage = () => {
    if (!selectedCandidate) return;
    updateCandidateStage(selectedCandidate.id, decision.stage, { decisionNotes: decision.notes });
    setSelectedCandidate(null);
    setDecision({ stage: 'offer', notes: '' });
  };

  const handleBoardApproval = () => {
    if (!selectedCandidate) return;
    addSelectionBoardApproval(selectedCandidate.id, {
      by: user?.name || 'Selection Board',
      decision: boardDecision.decision,
      notes: boardDecision.notes,
    });
    setBoardDecision({ decision: 'approved', notes: '' });
  };

  const daysInStage = (c) => {
    const ref = c.stageUpdatedOn || c.appliedOn;
    if (!ref) return null;
    return Math.max(0, differenceInDays(new Date(), parseISO(ref)));
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!newCandidate.name || !newCandidate.email || !newCandidate.role) return;
    addCandidate({
      ...newCandidate,
      stage: 'applied',
      stageUpdatedOn: format(new Date(), 'yyyy-MM-dd'),
      source: newCandidate.source || 'Direct',
      documents: newCandidate.resumeUrl
        ? [
            {
              id: `doc-${Date.now()}`,
              name: 'Resume',
              url: newCandidate.resumeUrl,
              type: 'resume',
              storage: newCandidate.resumeUrl.includes('drive.google') ? 'google-drive' : 'web',
              version: 1,
            },
          ]
        : [],
    });
    setShowAddModal(false);
    setNewCandidate({
      name: '',
      email: '',
      phone: '',
      department: '',
      role: '',
      source: 'Direct',
      resumeUrl: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment & ATS</h1>
          <p className="text-gray-600">
            Track candidates, interviews, and Selection Board approvals
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UserPlusIcon className="w-5 h-5" /> {candidates.length} candidates
          <Button size="sm" onClick={() => setShowAddModal(true)} className="ml-2">
            Add Candidate
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: UserPlusIcon, color: 'indigo' },
          { label: 'Offers', value: stats.offers, icon: CheckCircleIcon, color: 'emerald' },
          { label: 'Hired', value: stats.hired, icon: CheckCircleIcon, color: 'green' },
          { label: 'Avg days in stage', value: stats.avgStage, icon: ClockIcon, color: 'amber' },
        ].map((stat) => (
          <Card key={stat.label} className={`border-${stat.color}-100 bg-${stat.color}-50`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm text-${stat.color}-600`}>{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-800`}>{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 text-${stat.color}-500`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-72">
          <InputWithIcon
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, role"
            className="w-full"
            inputClassName="pr-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Departments</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Sources</option>
            {sourceOptions.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Tabs value={activeStage} onValueChange={setActiveStage}>
        <TabsList className="flex-wrap">
          {atsStages.map((stage) => (
            <TabsTrigger key={stage.id} value={stage.id}>
              {stage.name} ({candidatesByStage[stage.id]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {atsStages.map((stage) => (
          <TabsContent key={stage.id} value={stage.id}>
            <Card>
              {(candidatesByStage[stage.id] || []).length === 0 ? (
                <div className="text-center py-10 text-gray-500">No candidates in this stage</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {candidatesByStage[stage.id].map((c) => (
                    <div
                      key={c.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedCandidate(c)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{c.name}</p>
                          <p className="text-sm text-gray-600">{c.role}</p>
                        </div>
                        <Badge variant={stageBadge[c.stage] || 'default'}>{c.stage}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>Applied {c.appliedOn}</span>
                        {daysInStage(c) !== null && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                            <ClockIcon className="w-3.5 h-3.5" /> {daysInStage(c)}d in stage
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-gray-700">
                        <p>Department: {c.department}</p>
                        <p>Source: {c.source || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Modal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        title="Candidate Details"
        size="lg"
      >
        {selectedCandidate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedCandidate.name}</h3>
                <p className="text-sm text-gray-600">{selectedCandidate.role}</p>
              </div>
              <Badge variant={stageBadge[selectedCandidate.stage] || 'default'}>
                {selectedCandidate.stage}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <p>Email: {selectedCandidate.email}</p>
              <p>Phone: {selectedCandidate.phone}</p>
              <p>Department: {selectedCandidate.department}</p>
              <p>Applied On: {format(parseISO(selectedCandidate.appliedOn), 'PPP')}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Evaluations</p>
              {selectedCandidate.evaluations?.length ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Avg score</span>
                    <span className="font-semibold">
                      {(
                        selectedCandidate.evaluations.reduce(
                          (sum, ev) => sum + (ev.score || 0),
                          0,
                        ) / selectedCandidate.evaluations.length
                      ).toFixed(1)}
                    </span>
                  </div>
                  {selectedCandidate.evaluations.map((ev, idx) => (
                    <div key={idx} className="border rounded p-2 flex justify-between">
                      <div>
                        <p className="font-medium capitalize">{ev.stage}</p>
                        <p className="text-xs text-gray-500">{ev.notes}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>Score: {ev.score ?? '-'}</p>
                        <p>{ev.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No evaluations yet</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800">Selection Board</p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-indigo-600" />
                {selectedCandidate.selectionBoard?.status || 'pending'}
                {selectedCandidate.selectionBoard?.approvals && (
                  <span className="text-xs text-gray-500">
                    {
                      (selectedCandidate.selectionBoard.approvals || []).filter(
                        (a) => a.decision === 'approved',
                      ).length
                    }
                    /{selectedCandidate.selectionBoard.approvals?.length || 0} approvals
                  </span>
                )}
              </div>
              {selectedCandidate.selectionBoard?.approvals?.length ? (
                <div className="space-y-1 text-xs text-gray-600">
                  {selectedCandidate.selectionBoard.approvals.map((ap, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded border px-2 py-1"
                    >
                      <span className="font-medium capitalize">{ap.by || 'Member'}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={ap.decision === 'approved' ? 'success' : 'error'}>
                          {ap.decision}
                        </Badge>
                        <span>{ap.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="flex gap-2 text-sm">
                <select
                  value={boardDecision.decision}
                  onChange={(e) => setBoardDecision((d) => ({ ...d, decision: e.target.value }))}
                  className="rounded border px-3 py-1 text-sm"
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
                <input
                  value={boardDecision.notes}
                  onChange={(e) => setBoardDecision((d) => ({ ...d, notes: e.target.value }))}
                  placeholder="Notes"
                  className="flex-1 rounded border px-3 py-1 text-sm"
                />
                <Button size="sm" variant="outline" onClick={handleBoardApproval}>
                  Record
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800">Advance Stage</p>
              <div className="flex gap-2">
                <select
                  value={decision.stage}
                  onChange={(e) => setDecision((d) => ({ ...d, stage: e.target.value }))}
                  className="rounded border px-3 py-1 text-sm"
                >
                  {atsStages.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
                <input
                  value={decision.notes}
                  onChange={(e) => setDecision((d) => ({ ...d, notes: e.target.value }))}
                  placeholder="Decision notes"
                  className="flex-1 rounded border px-3 py-1 text-sm"
                />
                <Button size="sm" onClick={handleAdvanceStage}>
                  Move
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800 mb-2">Documents</p>
              {selectedCandidate.documents?.length ? (
                <ul className="space-y-1 text-sm text-gray-700">
                  {selectedCandidate.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4" />
                      <a
                        href={doc.url || doc.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {doc.name || doc.title}
                      </a>
                      <span className="text-xs text-gray-500">v{doc.version || 1}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No documents linked</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Candidate Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Candidate">
        <form className="space-y-3" onSubmit={handleAddCandidate}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-700">Name</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate((c) => ({ ...c, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input
                type="email"
                className="w-full rounded border px-3 py-2 text-sm"
                value={newCandidate.email}
                onChange={(e) => setNewCandidate((c) => ({ ...c, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Phone</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={newCandidate.phone}
                onChange={(e) => setNewCandidate((c) => ({ ...c, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Department</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={newCandidate.department}
                onChange={(e) => setNewCandidate((c) => ({ ...c, department: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Role</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={newCandidate.role}
                onChange={(e) => setNewCandidate((c) => ({ ...c, role: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Source</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={newCandidate.source}
                onChange={(e) => setNewCandidate((c) => ({ ...c, source: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700">Resume Link (Drive/Web)</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={newCandidate.resumeUrl}
                onChange={(e) => setNewCandidate((c) => ({ ...c, resumeUrl: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
