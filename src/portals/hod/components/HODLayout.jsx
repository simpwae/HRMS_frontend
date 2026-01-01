import {
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import PortalLayout from '../../../app/PortalLayout';

const navItems = [
  { path: '/hod', label: 'Dashboard', icon: ChartBarIcon, end: true },
  { path: '/hod/employees', label: 'Department Staff', icon: UsersIcon },
  { path: '/hod/attendance', label: 'Attendance', icon: ClockIcon },
  { path: '/hod/leaves', label: 'Leave Requests', icon: CalendarDaysIcon },
  { path: '/hod/self-service', label: 'Manager Self-Service', icon: ClipboardDocumentListIcon },
  { path: '/hod/reports', label: 'Reports', icon: DocumentChartBarIcon },
  { path: '/hod/settings', label: 'Settings', icon: Cog6ToothIcon },
];

export default function HODLayout() {
  return <PortalLayout portalKey="hod" portalName="HOD Portal" navItems={navItems} />;
}
