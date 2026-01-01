import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../state/auth';

/**
 * ProtectedRoute - Wraps routes that require authentication and specific role access
 *
 * @param {string[]} allowedRoles - Array of roles that can access this route
 * @param {React.ReactNode} children - Child components to render if authorized
 * @param {string} redirectTo - Where to redirect if not authorized (default: /login)
 */
export default function ProtectedRoute({ allowedRoles = [], children, redirectTo = '/login' }) {
  const location = useLocation();
  const { isAuthenticated, activeRole, user } = useAuthStore();

  // Not logged in - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If no roles specified, just require authentication
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user's active role is allowed
  if (!allowedRoles.includes(activeRole)) {
    // Check if user has ANY of the allowed roles (they might need to switch)
    const hasAnyAllowedRole = allowedRoles.some((role) => user.roles?.includes(role));

    if (hasAnyAllowedRole) {
      // User has access but with a different role - could auto-switch or show message
      // For now, redirect to their default portal
      const defaultPortal = {
        admin: '/admin',
        president: '/president',
        vc: '/vc',
        dean: '/dean',
        hod: '/hod',
        hr: '/hr',
        employee: '/employee',
      };
      return <Navigate to={defaultPortal[activeRole] || '/employee'} replace />;
    }

    // User doesn't have permission at all
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * RoleGate - Conditionally render content based on role
 * Use this for showing/hiding UI elements based on permissions
 */
export function RoleGate({ allowedRoles = [], children, fallback = null }) {
  const { activeRole, user } = useAuthStore();

  if (!user) return fallback;

  if (allowedRoles.length === 0) return children;

  if (allowedRoles.includes(activeRole)) {
    return children;
  }

  return fallback;
}

/**
 * useRequireAuth - Hook to check auth status and redirect if needed
 */
export function useRequireAuth(requiredRole = null) {
  const { isAuthenticated, activeRole, hasRole, user } = useAuthStore();

  return {
    isAuthenticated,
    activeRole,
    user,
    hasAccess: requiredRole ? hasRole(requiredRole) : isAuthenticated,
    isCurrentRole: requiredRole ? activeRole === requiredRole : true,
  };
}
