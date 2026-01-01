/**
 * LoadingSpinner - Loading indicator component
 *
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} color - Color class or 'primary'
 */
export default function LoadingSpinner({ size = 'md', color = 'primary', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    primary: 'border-[hsl(var(--color-primary))]',
    white: 'border-white',
    gray: 'border-gray-400',
  };

  return (
    <div
      className={`${sizes[size]} ${colors[color] || color} rounded-full border-t-transparent animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * PageLoader - Full page loading state
 */
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
}

/**
 * ContentLoader - Loading state for content areas
 */
export function ContentLoader({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-500">{message}</p>
    </div>
  );
}

/**
 * SkeletonLoader - Skeleton loading placeholder
 */
export function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    avatar: 'w-10 h-10 rounded-full',
    card: 'h-32 rounded-xl',
    button: 'h-10 w-24 rounded-lg',
  };

  return <div className={`bg-gray-200 animate-pulse ${variants[variant]} ${className}`} />;
}

/**
 * SkeletonCard - Card skeleton for loading states
 */
export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-5/6" />
    </div>
  );
}

/**
 * SkeletonTable - Table skeleton for loading states
 */
export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-4 py-3 flex gap-4 border-b border-gray-100 last:border-0">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
