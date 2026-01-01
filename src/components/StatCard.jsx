import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

/**
 * StatCard - Dashboard statistic card with trend indicator
 *
 * @param {string} title - Stat label
 * @param {string|number} value - Main value to display
 * @param {string} subtitle - Additional context
 * @param {React.Component} icon - Heroicon component
 * @param {string} iconBg - Background color class for icon
 * @param {string} color - Color theme: 'primary', 'success', 'warning', 'danger', 'default'
 * @param {number} trend - Percentage change (positive/negative)
 * @param {string} trendValue - Custom trend display value
 * @param {string} trendLabel - Label for trend (e.g., "vs last month")
 * @param {Function} onClick - Click handler
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  color = 'default',
  trend,
  trendValue,
  trendLabel = 'vs last month',
  onClick,
  className = '',
}) {
  const colorStyles = {
    primary: 'bg-[hsl(var(--color-primary))]',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    default: 'bg-blue-500',
    info: 'bg-blue-500',
  };

  const isPositiveTrend = trend > 0 || (trendValue && trendValue.startsWith('+'));
  const hasTrend = trend !== undefined || trendValue;

  const iconBackground = iconBg || colorStyles[color] || colorStyles.default;

  return (
    <div
      className={`glass rounded-2xl p-4 sm:p-6 card-hover ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight truncate">
            {value}
          </p>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{subtitle}</p>}
          {hasTrend && (
            <div className="flex items-center gap-1 mt-2 sm:mt-3 flex-wrap">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                  isPositiveTrend ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                }`}
              >
                {isPositiveTrend ? (
                  <ArrowUpIcon className="w-3 h-3" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3" />
                )}
                {trendValue || `${Math.abs(trend)}%`}
              </span>
              <span className="text-xs text-gray-400">{trendLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2 sm:p-3 rounded-xl ${iconBackground} text-white shadow-lg shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * StatCardCompact - Smaller stat card for dense layouts
 */
export function StatCardCompact({ title, value, icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
    indigo: 'text-indigo-600 bg-indigo-100',
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
      {Icon && (
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

/**
 * StatCardRow - Horizontal stat display for lists
 */
export function StatCardRow({ items = [] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <StatCardCompact key={index} {...item} />
      ))}
    </div>
  );
}
