import {
  ChartBarIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import PortalLayout from '../../../app/PortalLayout';

const navItems = [
  { path: '/vc', label: 'Dashboard', icon: ChartBarIcon, end: true },
  { path: '/vc/medical-leaves', label: 'Medical Leaves', icon: DocumentTextIcon },
  { path: '/vc/analytics', label: 'Analytics', icon: ClipboardDocumentCheckIcon },
];

export default function VCLayout() {
  return <PortalLayout portalKey="vc" portalName="VC Portal" navItems={navItems} />;
}
