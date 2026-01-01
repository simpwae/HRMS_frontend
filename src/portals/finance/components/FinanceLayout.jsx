import {
  HomeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import PortalLayout from '../../../app/PortalLayout';

const navItems = [
  { path: '/finance/dashboard', label: 'Dashboard', icon: HomeIcon, end: true },
  { path: '/finance/requests', label: 'Requests', icon: BanknotesIcon },
  { path: '/finance/reports', label: 'Reports', icon: ChartBarIcon },
  { path: '/finance/policy-advisory', label: 'Policy Advisory', icon: DocumentTextIcon },
  { path: '/finance/settings', label: 'Settings', icon: Cog6ToothIcon },
];

export default function FinanceLayout() {
  return <PortalLayout portalKey="finance" portalName="Finance Portal" navItems={navItems} />;
}
