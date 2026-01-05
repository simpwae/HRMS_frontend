import { useMemo, useState } from 'react';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import FileUpload from '../../../components/FileUpload';
import { useAuthStore } from '../../../state/auth';
import { useDataStore } from '../../../state/data';

const statusVariant = {
  'dean-review': 'info',
  returned: 'warning',
  'dean-confirmed': 'success',
};

export default function DeanPAMS() {
  const { user } = useAuthStore();
  const getPamsForDean = useDataStore((s) => s.getPamsForDean);
  const deanReviewPams = useDataStore((s) => s.deanReviewPams);
  const updatePamsSubmission = useDataStore((s) => s.updatePamsSubmission);

  const items = useMemo(
    () => (user?.faculty ? getPamsForDean(user.faculty) : []),
    [getPamsForDean, user],
  );

  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [attachments, setAttachments] = useState([]);

  const select = (p) => {
    setSelected(p);
    setComment('');
    setMeetingDate('');
    setFollowUpDate('');
    setAttachments(p.attachments || []);
  };

  const saveAttachments = () => {
    if (!selected) return;
    updatePamsSubmission(selected.id, {
      attachments: attachments.map((f) => ({ id: f.id, name: f.name, size: f.size, type: f.type })),
    });
  };

  const decide = (action) => {
    if (!selected) return;
    deanReviewPams(selected.id, {
      action,
      comment,
      meetingDate,
      followUpDate,
      by: 'dean',
    });
    setSelected(null);
    setAttachments([]);
    setComment('');
    setMeetingDate('');
    setFollowUpDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardDocumentListIcon className="w-6 h-6 text-gray-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HOD PAMS Review</h1>
          <p className="text-gray-600">
            Meet with HODs, request corrections, and confirm submissions.
          </p>
        </div>
      </div>

      <Card>
        {items.length === 0 ? (
          <p className="text-sm text-gray-600">No HOD submissions awaiting review.</p>
        ) : (
          <div className="space-y-2">
            {items.map((p) => (
              <button
                key={p.id}
                onClick={() => select(p)}
                className={`w-full text-left border rounded-lg p-3 hover:border-[hsl(var(--color-primary))] ${selected?.id === p.id ? 'border-[hsl(var(--color-primary))] shadow-sm' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{p.employeeName || p.employeeId}</p>
                    <p className="text-xs text-gray-500">{p.period}</p>
                  </div>
                  <Badge variant={statusVariant[p.status] || 'secondary'}>{p.status}</Badge>
                </div>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{p.workload?.admin}</p>
              </button>
            ))}
          </div>
        )}
      </Card>

      {selected && (
        <Card>
          <div className="grid gap-3 md:grid-cols-2">
            <Info label="Teaching load" value={selected.workload?.teachingLoad} />
            <Info label="Project supervision" value={selected.workload?.projectSupervision} />
            <Info label="Advisory" value={selected.workload?.advisory} />
            <Info label="Administrative" value={selected.workload?.admin} />
            <Info label="Teaching effectiveness" value={selected.rubric?.teaching} />
            <Info label="Research & funding" value={selected.rubric?.research} />
            <Info label="Service & community" value={selected.rubric?.service} />
            <Info label="Grievance/Suggestion" value={selected.grievance || 'None'} />
          </div>

          {selected.followUpMeeting && (
            <div className="mt-3 border rounded-lg p-3 bg-gray-50">
              <p className="text-sm font-semibold text-gray-800">
                Department performance follow-up
              </p>
              <p className="text-sm text-gray-700">
                Scheduled: {selected.followUpMeeting.scheduledAt || 'TBD'} · Status:{' '}
                {selected.followUpMeeting.status || 'pending'}
              </p>
              {selected.followUpMeeting.topic && (
                <p className="text-xs text-gray-500 mt-1">{selected.followUpMeeting.topic}</p>
              )}
            </div>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium text-gray-700">
              Meeting date
              <input
                type="date"
                className="mt-1"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Follow-up meeting
              <input
                type="date"
                className="mt-1"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                placeholder="Optional"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Comments / corrections
              <textarea
                rows={2}
                className="mt-1"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Meeting notes or required changes"
              />
            </label>
          </div>

          <div className="mt-4">
            <FileUpload
              label="Attachments"
              value={attachments}
              onChange={setAttachments}
              helper="Upload corrected forms or evidence after dean meeting."
              maxFiles={10}
              maxSizeMB={15}
            />
            <div className="flex justify-end mt-2">
              <Button variant="secondary" onClick={saveAttachments} disabled={!selected}>
                Save attachments
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => decide('return')}
              className="flex items-center gap-2"
            >
              <ArrowUturnLeftIcon className="w-4 h-4" /> Return
            </Button>
            <Button onClick={() => decide('confirm')} className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4" /> Confirm after meeting
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="border rounded-lg p-3 bg-white">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm text-gray-800 mt-1 whitespace-pre-line min-h-12">{value || '—'}</p>
    </div>
  );
}
