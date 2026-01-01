import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { sendMeetingNotification } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import {
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function CommitteeMeetings() {
  const user = useAuthStore((s) => s.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetings, setMeetings] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '10:00',
      location: '',
      agenda: '',
    },
  });

  const committeeMembers = [
    'registrar@cecos.edu.pk',
    'vp@cecos.edu.pk',
    'vc@cecos.edu.pk',
    'president@cecos.edu.pk',
    'manager-hr@cecos.edu.pk',
  ];

  const onSubmit = async (data) => {
    try {
      const newMeeting = {
        id: `m-${Date.now()}`,
        ...data,
        convener: user?.name || 'Dean',
        createdBy: user?.email,
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm'),
        status: 'Scheduled',
        attendees: committeeMembers,
      };

      setMeetings([newMeeting, ...meetings]);

      // Send meeting notification emails to all employees except current user
      await sendMeetingNotification(
        {
          title: data.title,
          date: data.date,
          time: data.time,
          location: data.location,
          agenda: data.agenda,
          convener: user?.name || 'Dean',
          attendees: committeeMembers,
        },
        user?.email,
      );

      alert('Meeting scheduled successfully! Notifications sent to all employees.');
      handleCloseModal();
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const handleDeleteMeeting = (id) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      setMeetings(meetings.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Committee Meetings</h1>
          <p className="text-gray-600">Schedule and manage committee meetings as Dean/Convener</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Schedule Meeting
        </Button>
      </div>

      {/* Scheduled Meetings */}
      <Card>
        {meetings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No meetings scheduled yet</p>
            <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
              Debug: meetings array length: {meetings.length}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{meeting.title}</h3>
                      <Badge variant="success">{meeting.status}</Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{format(new Date(meeting.date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>{meeting.time}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{meeting.location}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-sm font-medium text-gray-700">Agenda:</p>
                      <p className="text-sm text-gray-600 mt-1">{meeting.agenda}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Convener: {meeting.convener}</span>
                      <span>Attendees: {meeting.attendees.length} members</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 ml-2"
                    onClick={() => handleDeleteMeeting(meeting.id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Schedule Committee Meeting"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('title', { required: 'Meeting title is required' })}
              placeholder="e.g., Academic Committee Meeting"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('date', { required: 'Date is required' })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                {...register('time', { required: 'Time is required' })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.time && <p className="text-sm text-red-600 mt-1">{errors.time.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('location', { required: 'Location is required' })}
              placeholder="e.g., Board Room, Main Campus"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.location && (
              <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agenda <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('agenda', {
                required: 'Agenda is required',
                minLength: { value: 10, message: 'Agenda must be at least 10 characters' },
              })}
              rows={4}
              placeholder="Describe the meeting agenda and topics to be discussed..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.agenda && <p className="text-sm text-red-600 mt-1">{errors.agenda.message}</p>}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Committee Members to be Notified:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Registrar</li>
              <li>• Vice President</li>
              <li>• Vice Chancellor</li>
              <li>• President</li>
              <li>• Manager HR</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              Email notifications will be sent to all committee members automatically.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
