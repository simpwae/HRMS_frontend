import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useDataStore, faculties, sendMeetingNotification } from '../../../state/data';
import { useAuthStore } from '../../../state/auth';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import EmptyState from '../../../components/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/Tabs';
import InputWithIcon from '../../../components/InputWithIcon';
import {
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function DeanPromotions() {
  const user = useAuthStore((s) => s.user);
  const { promotions, updatePromotionStatus } = useDataStore();

  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('10:00');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingAgenda, setMeetingAgenda] = useState('');

  // Filter promotions - Dean sees all faculty promotions
  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      // Status filter
      if (activeTab === 'pending' && p.status !== 'Pending') return false;
      if (activeTab === 'review' && p.status !== 'Under Review') return false;
      if (activeTab === 'completed' && !['Approved', 'Rejected'].includes(p.status)) return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (
          !p.employeeName?.toLowerCase().includes(search) &&
          !p.department?.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      // Department filter
      if (departmentFilter !== 'all' && p.department !== departmentFilter) return false;

      return true;
    });
  }, [promotions, activeTab, searchTerm, departmentFilter]);

  const handleScheduleMeeting = (promotion) => {
    setSelectedPromotion(promotion);
    setShowScheduleModal(true);
    setMeetingDate(format(new Date(), 'yyyy-MM-dd'));
    setMeetingTime('10:00');
    setMeetingLocation('');
    setMeetingAgenda(
      `Promotion Committee Meeting for ${promotion.employeeName}\n\nPromotion Request:\nFrom: ${promotion.currentDesignation}\nTo: ${promotion.requestedDesignation}\n\nReason: ${promotion.reason}`,
    );
  };

  const handleSubmitSchedule = async () => {
    if (!selectedPromotion || !meetingDate || !meetingLocation) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Update promotion status to Under Review
      updatePromotionStatus(selectedPromotion.id, 'Under Review', {
        type: 'committee',
        meetingDate: `${meetingDate} ${meetingTime}`,
        notes: meetingAgenda,
        scheduledBy: user?.name,
        date: format(new Date(), 'yyyy-MM-dd'),
      });

      // Send meeting notification to all employees
      await sendMeetingNotification(
        {
          title: `Promotion Committee Meeting - ${selectedPromotion.employeeName}`,
          date: meetingDate,
          time: meetingTime,
          location: meetingLocation,
          agenda: meetingAgenda,
          convener: user?.name || 'Dean',
        },
        user?.email,
      );

      alert('Committee meeting scheduled successfully! Notifications sent to all employees.');
      setShowScheduleModal(false);
      setSelectedPromotion(null);
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Pending: 'warning',
      'Under Review': 'info',
      Approved: 'success',
      Rejected: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const allDepartments = Object.values(faculties).flat();

  const stats = {
    pending: promotions.filter((p) => p.status === 'Pending').length,
    underReview: promotions.filter((p) => p.status === 'Under Review').length,
    approved: promotions.filter((p) => p.status === 'Approved').length,
    rejected: promotions.filter((p) => p.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Promotion Requests</h1>
        <p className="text-gray-600">
          Review promotion requests and schedule committee meetings as Dean/Convener
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: stats.pending, color: 'amber', icon: ClockIcon },
          { label: 'Under Review', value: stats.underReview, color: 'blue', icon: UserGroupIcon },
          { label: 'Approved', value: stats.approved, color: 'green', icon: CheckCircleIcon },
          { label: 'Rejected', value: stats.rejected, color: 'red', icon: XCircleIcon },
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

      {/* Tabs & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="review">Under Review ({stats.underReview})</TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({stats.approved + stats.rejected})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-3">
          <InputWithIcon
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
            inputClassName="pr-4 py-2 text-sm"
          />
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
      </div>

      {/* Info Box for Dean */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <UserGroupIcon className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
          <div>
            <p className="font-medium text-blue-900">Dean Role - Committee Convener</p>
            <p className="text-sm text-blue-700 mt-1">
              As the Dean, you are authorized to schedule committee meetings for promotion reviews.
              When you schedule a meeting, all employees will be notified automatically.
            </p>
          </div>
        </div>
      </Card>

      {/* Promotions List */}
      <Card>
        {filteredPromotions.length === 0 ? (
          <div>
            <EmptyState
              icon={SparklesIcon}
              title="No Promotions Found"
              description={
                activeTab === 'pending'
                  ? 'No pending promotion requests'
                  : activeTab === 'review'
                    ? 'No promotions under review'
                    : 'No completed promotions'
              }
            />
            <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
              Debug: promotions array length: {promotions.length}, filteredPromotions:{' '}
              {filteredPromotions.length}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPromotions.map((promotion) => (
              <div
                key={promotion.id}
                className="border rounded-xl p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Employee Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {promotion.employeeName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{promotion.employeeName}</h4>
                      <p className="text-sm text-gray-500">
                        {promotion.department} • {promotion.faculty}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-indigo-600">
                        <span>{promotion.currentDesignation}</span>
                        <ArrowUpIcon className="w-4 h-4" />
                        <span className="font-medium">{promotion.requestedDesignation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-sm text-gray-500">
                      <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                      {format(parseISO(promotion.appliedOn), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {promotion.yearsInService} years service
                    </div>
                    {getStatusBadge(promotion.status)}
                  </div>

                  {/* Actions - Only show for Pending status */}
                  {promotion.status === 'Pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleScheduleMeeting(promotion)}
                      className="gap-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <UserGroupIcon className="w-4 h-4" />
                      Schedule Committee Meeting
                    </Button>
                  )}
                </div>

                {/* Details */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Reason for Promotion:</p>
                  <p className="text-sm text-gray-600">{promotion.reason}</p>
                  {promotion.documents?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {promotion.documents.map((doc, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          📄 {doc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Committee Review Info */}
                {promotion.committeeReview && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Committee Meeting Scheduled</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Date: {promotion.committeeReview.meetingDate} • Scheduled by:{' '}
                      {promotion.committeeReview.scheduledBy}
                    </p>
                    {promotion.committeeReview.notes && (
                      <p className="text-sm text-blue-600 mt-1">
                        Agenda: {promotion.committeeReview.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Committee Meeting"
      >
        {selectedPromotion && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedPromotion.employeeName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedPromotion.currentDesignation} → {selectedPromotion.requestedDesignation}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                placeholder="e.g., Conference Room A, Admin Building"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Agenda</label>
              <textarea
                value={meetingAgenda}
                onChange={(e) => setMeetingAgenda(e.target.value)}
                rows={6}
                placeholder="Meeting agenda and discussion points..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                📧 All employees will be notified about this committee meeting via email.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitSchedule} className="bg-indigo-600 hover:bg-indigo-700">
                Schedule Meeting & Notify All
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
