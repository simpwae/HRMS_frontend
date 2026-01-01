import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({ open, isOpen, onClose, title, children, actions, size = 'xl' }) {
  // Support both 'open' and 'isOpen' props
  const isModalOpen = open || isOpen;

  if (!isModalOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[98vw] lg:max-w-7xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-0 sm:p-4"
      style={{ overscrollBehavior: 'contain', paddingTop: '80px' }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col`}
        style={{ position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-white shrink-0 sticky top-0 z-10">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          >
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div
          className="px-4 sm:px-6 py-4 overflow-y-auto flex-1"
          style={{ maxHeight: 'calc(85vh - 64px)' }}
        >
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end border-t shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
