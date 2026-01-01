import {
  AcademicCapIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import PortalLayout from '../../../app/PortalLayout';

const navItems = [
  { path: '/oric', label: 'Dashboard', icon: AcademicCapIcon, end: true },
  { path: '/oric/publications', label: 'Publications', icon: DocumentTextIcon },
  { path: '/oric/funding', label: 'Funding & Grants', icon: CurrencyDollarIcon },
];

export default function ORICLayout({ children }) {
  return (
    <PortalLayout portalKey="oric" portalName="ORIC Portal" navItems={navItems}>
      {children}
    </PortalLayout>
  );
}
