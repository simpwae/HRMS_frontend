export default function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    primary:
      'bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] border-[hsl(var(--color-primary)/0.2)]',
    secondary:
      'bg-[hsl(var(--color-secondary)/0.1)] text-[hsl(var(--color-secondary))] border-[hsl(var(--color-secondary)/0.2)]',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border whitespace-nowrap ${sizeClasses[size] || sizeClasses.sm} ${variants[variant] || variants.default}`}
    >
      {children}
    </span>
  );
}
