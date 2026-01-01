import {
  HomeIcon,
  UsersIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import PortalLayout from '../../../app/PortalLayout';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: HomeIcon, end: true },
  { path: '/admin/users', label: 'User Management', icon: UsersIcon },
  { path: '/admin/settings', label: 'System Settings', icon: Cog6ToothIcon },
  { path: '/admin/audit', label: 'Audit Logs', icon: ClipboardDocumentListIcon },
];

export default function AdminLayout() {
  return <PortalLayout portalKey="admin" portalName="Admin Portal" navItems={navItems} />;
}
