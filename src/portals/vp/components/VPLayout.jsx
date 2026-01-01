import {
  ChartBarIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  DocumentChartBarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import PortalLayout from '../../../app/PortalLayout';

const navItems = [
  { path: '/vp', label: 'Dashboard', icon: ChartBarIcon, end: true },
  { path: '/vp/employees', label: 'All Employees', icon: UsersIcon },
  { path: '/vp/reports', label: 'Reports', icon: DocumentChartBarIcon },
  { path: '/vp/analytics', label: 'Analytics', icon: ChartPieIcon },
  { path: '/vp/advisory', label: 'Advisory', icon: ChatBubbleLeftRightIcon },
  { path: '/vp/settings', label: 'Settings', icon: Cog6ToothIcon },
];

export default function VPLayout() {
  return <PortalLayout portalKey="vp" portalName="VP Portal" navItems={navItems} />;
}
