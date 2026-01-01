import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import { useDataStore, sendAnnouncementNotification } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import {
  BellIcon,
  PlusIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

// Mock announcements data (in real app, this would be in the store)
const initialAnnouncements = [
  {
    id: 'a1',
    title: 'University Holiday Notice',
    content:
      'The university will remain closed on the upcoming national holiday. All staff are advised to complete their pending work before the holiday.',
    category: 'holiday',
    priority: 'high',
    targetAudience: 'all',
    createdBy: 'HR Department',
    createdAt: '2024-01-20',
    expiresAt: '2024-02-01',
    isActive: true,
  },
  {
    id: 'a2',
    title: 'New Leave Policy Update',
    content:
      'Please be informed that the leave policy has been updated. Employees can now carry forward up to 5 days of annual leave to the next year.',
    category: 'policy',
    priority: 'medium',
    targetAudience: 'all',
    createdBy: 'HR Department',
    createdAt: '2024-01-15',
    expiresAt: null,
    isActive: true,
  },
  {
    id: 'a3',
    title: 'IT System Maintenance',
    content:
      'The HRMS system will undergo maintenance this weekend. Please save all your work before Friday 6 PM.',
    category: 'maintenance',
    priority: 'medium',
    targetAudience: 'all',
    createdBy: 'IT Department',
    createdAt: '2024-01-10',
    expiresAt: '2024-01-14',
    isActive: false,
  },
];

export default function Announcements() {
  const user = useAuthStore((s) => s.user);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filter, setFilter] = useState('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      targetAudience: 'all',
      expiresAt: '',
    },
  });

  const filteredAnnouncements = useMemo(() => {
    if (filter === 'all') return announcements;
    if (filter === 'active') return announcements.filter((a) => a.isActive);
    if (filter === 'expired') return announcements.filter((a) => !a.isActive);
    return announcements.filter((a) => a.category === filter);
  }, [announcements, filter]);

  const onSubmit = (data) => {
    const newAnnouncement = {
      id: `a${Date.now()}`,
      ...data,
      createdBy: user?.name || 'HR Department',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      isActive: true,
    };

    setAnnouncements([newAnnouncement, ...announcements]);

    // Send announcement notification emails to all employees except current user
    sendAnnouncementNotification(
      {
        title: data.title,
        description: data.content,
        audience: data.targetAudience,
        postedBy: user?.name || 'HR Department',
      },
      user?.email,
    );

    reset();
    setShowModal(false);
  };

  const toggleActive = (id) => {
    setAnnouncements(announcements.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
  };

  const deleteAnnouncement = (id) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter((a) => a.id !== id));
    }
  };

  const getCategoryBadge = (category) => {
    const variants = {
      holiday: 'error',
      policy: 'primary',
      maintenance: 'warning',
      general: 'default',
      event: 'success',
    };
    return variants[category] || 'default';
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'error',
      medium: 'warning',
      low: 'default',
    };
    return variants[priority] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Create and manage university announcements</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <PlusIcon className="w-5 h-5" />
          New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <MegaphoneIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{announcements.length}</p>
              <p className="text-sm text-blue-700">Total Announcements</p>
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <EyeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {announcements.filter((a) => a.isActive).length}
              </p>
              <p className="text-sm text-green-700">Active</p>
            </div>
          </div>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <CalendarDaysIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">
                {announcements.filter((a) => a.priority === 'high').length}
              </p>
              <p className="text-sm text-amber-700">High Priority</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'active', 'expired', 'holiday', 'policy', 'maintenance'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <MegaphoneIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No announcements found</p>
            </div>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className={!announcement.isActive ? 'opacity-60' : ''}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                    <Badge variant={getCategoryBadge(announcement.category)}>
                      {announcement.category}
                    </Badge>
                    <Badge variant={getPriorityBadge(announcement.priority)}>
                      {announcement.priority}
                    </Badge>
                    {!announcement.isActive && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{announcement.content}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDaysIcon className="w-4 h-4" />
                      Created: {format(parseISO(announcement.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      Target: {announcement.targetAudience}
                    </span>
                    <span>By: {announcement.createdBy}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(announcement.id)}>
                    {announcement.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedAnnouncement(announcement)}
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteAnnouncement(announcement.id)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Announcement"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter announcement title"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              rows={4}
              placeholder="Enter announcement details..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.content && (
              <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                {...register('category')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="holiday">Holiday</option>
                <option value="policy">Policy</option>
                <option value="maintenance">Maintenance</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                {...register('priority')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <select
                {...register('targetAudience')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Employees</option>
                <option value="faculty">Faculty Only</option>
                <option value="staff">Staff Only</option>
                <option value="management">Management Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires On</label>
              <input
                type="date"
                {...register('expiresAt')}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Publish Announcement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
