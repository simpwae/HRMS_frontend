import { useNavigate } from 'react-router-dom';
import { ShieldExclamationIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Button from '../components/Button';
import CECOSLogo from '../components/CECOSLogo';
import { useAuthStore, portalRoutes } from '../state/auth';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { activeRole, isAuthenticated } = useAuthStore();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (isAuthenticated && activeRole) {
      navigate(portalRoutes[activeRole] || '/employee');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <CECOSLogo variant="icon" size="lg" className="mx-auto opacity-20" />
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldExclamationIcon className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-8">
            You don't have permission to access this page. Please contact your administrator if you
            believe this is an error.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary" onClick={handleGoBack}>
              <ArrowLeftIcon className="w-4 h-4" />
              Go Back
            </Button>
            <Button onClick={handleGoHome}>
              <HomeIcon className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-400">Error Code: 403 - Forbidden</p>
      </div>
    </div>
  );
}
