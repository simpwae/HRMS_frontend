/**
 * Avatar - User avatar component with fallback
 *
 * @param {string} src - Image source URL
 * @param {string} name - User name for fallback initials
 * @param {string} size - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} status - 'online' | 'offline' | 'busy' | 'away'
 */
export default function Avatar({ src, name = '', size = 'md', status, className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-linear-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] flex items-center justify-center text-white font-semibold ring-2 ring-white`}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]} rounded-full ring-2 ring-white`}
        />
      )}
    </div>
  );
}

/**
 * AvatarGroup - Stack of avatars
 */
export function AvatarGroup({ avatars = [], max = 4, size = 'md' }) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const overlapClass = {
    xs: '-ml-2',
    sm: '-ml-3',
    md: '-ml-4',
    lg: '-ml-5',
    xl: '-ml-6',
  };

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div className="flex items-center">
      {visible.map((avatar, index) => (
        <div key={index} className={index > 0 ? overlapClass[size] : ''}>
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`${overlapClass[size]} ${sizes[size]} rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium ring-2 ring-white`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
