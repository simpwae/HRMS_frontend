import {
  ChartBarIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  DocumentChartBarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import PortalLayout from '../../../app/PortalLayout';

const navItems = [
  { path: '/president', label: 'Dashboard', icon: ChartBarIcon, end: true },
  { path: '/president/employees', label: 'All Employees', icon: UsersIcon },
  { path: '/president/medical-leaves', label: 'Medical Leaves', icon: DocumentTextIcon },
  { path: '/president/reports', label: 'Reports', icon: DocumentChartBarIcon },
  { path: '/president/analytics', label: 'Analytics', icon: ChartPieIcon },
  { path: '/president/advisory', label: 'Advisory', icon: ChatBubbleLeftRightIcon },
  { path: '/president/settings', label: 'Settings', icon: Cog6ToothIcon },
];

export default function PresidentLayout() {
  return <PortalLayout portalKey="president" portalName="President Portal" navItems={navItems} />;
}
