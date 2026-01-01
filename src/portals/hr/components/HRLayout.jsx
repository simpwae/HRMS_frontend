import { useMemo } from 'react';
import { useAuthStore } from '../../../state/auth';
import PortalLayout from '../../../app/PortalLayout';
import {
  HomeIcon,
  UsersIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  UserPlusIcon,
  ArrowTrendingUpIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const allNavItems = [
  {
    path: '/hr',
    label: 'Dashboard',
    icon: HomeIcon,
    end: true,
    roles: ['hr', 'admin', 'dean', 'hod'],
  },
  { path: '/hr/employees', label: 'Employees', icon: UsersIcon, roles: ['hr', 'admin'] },
  { path: '/hr/attendance', label: 'Attendance Mgmt', icon: ClockIcon, roles: ['hr', 'admin'] },
  {
    path: '/hr/attendance-list',
    label: 'Attendance List',
    icon: DocumentTextIcon,
    roles: ['hr', 'admin'],
  },
  {
    path: '/hr/recruitment',
    label: 'Recruitment & ATS',
    icon: UserPlusIcon,
    roles: ['hr', 'admin'],
  },
  {
    path: '/hr/operational',
    label: 'Operational Dashboard',
    icon: ChartBarIcon,
    roles: ['hr', 'admin'],
  },
  {
    path: '/hr/promotions',
    label: 'Promotions',
    icon: ArrowTrendingUpIcon,
    roles: ['hr', 'admin'],
  },
  {
    path: '/hr/increments',
    label: 'Bulk Increments',
    icon: BanknotesIcon,
    roles: ['hr', 'admin'],
  },
  {
    path: '/hr/payroll',
    label: 'Payroll',
    icon: CurrencyDollarIcon,
    roles: ['hr', 'admin'],
  },
  {
    path: '/hr/resignations',
    label: 'Resignations',
    icon: ArrowRightOnRectangleIcon,
    roles: ['hr', 'admin'],
  },
  {
    path: '/hr/profile-requests',
    label: 'Profile Requests',
    icon: IdentificationIcon,
    roles: ['hr', 'admin'],
  },
  {
    path: '/hr/ex-employees',
    label: 'Ex-Employees',
    icon: AcademicCapIcon,
    roles: ['hr', 'admin'],
  },
  { path: '/hr/analytics', label: 'Analytics', icon: ChartPieIcon, roles: ['hr', 'admin'] },
  { path: '/hr/reports', label: 'Reports', icon: ChartBarIcon, roles: ['hr', 'admin'] },
  {
    path: '/hr/policy-advisory',
    label: 'Policy Advisory',
    icon: ShieldCheckIcon,
    roles: ['hr', 'admin'],
  },
  { path: '/hr/announcements', label: 'Announcements', icon: BellIcon, roles: ['hr', 'admin'] },
  { path: '/hr/settings', label: 'Settings', icon: Cog6ToothIcon, roles: ['hr', 'admin'] },
];

export default function HRLayout() {
  const user = useAuthStore((s) => s.user);
  const userRole = user?.primaryRole || user?.role;

  const navItems = useMemo(() => {
    return allNavItems.filter((item) => item.roles.includes(userRole));
  }, [userRole]);

  // Determine portal name based on role
  const portalName =
    userRole === 'dean' ? 'Dean Portal' : userRole === 'hod' ? 'HOD Portal' : 'HR Portal';

  return <PortalLayout portalKey="hr" portalName={portalName} navItems={navItems} />;
}
