export default function Card({
  title,
  subtitle,
  children,
  actions,
  className = '',
  noPadding = false,
}) {
  return (
    <div className={`glass rounded-2xl ${noPadding ? '' : 'p-4 sm:p-6'} card-hover ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            {title && (
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
            )}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2 sm:gap-3 flex-wrap">{actions}</div>}
        </div>
      )}
      <div className="text-gray-700">{children}</div>
    </div>
  );
}
