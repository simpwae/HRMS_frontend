export default function EmptyState({
  icon: Icon,
  title,
  subtitle,
  description,
  action,
  className = '',
}) {
  // Support both 'subtitle' and 'description' props
  const desc = subtitle || description;

  // Check if Icon is a valid React component (function or forwardRef object)
  const isValidComponent = Icon && (typeof Icon === 'function' || Icon.$$typeof);

  return (
    <div className={`text-center py-8 sm:py-12 px-4 ${className}`}>
      {Icon && (
        <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400">
          {isValidComponent ? <Icon className="h-10 w-10 sm:h-12 sm:w-12" /> : Icon}
        </div>
      )}
      <h3 className="mt-3 text-sm sm:text-base font-medium text-gray-900">{title}</h3>
      {desc && <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">{desc}</p>}
      {action && <div className="mt-4 sm:mt-6">{action}</div>}
    </div>
  );
}
