import { useState, createContext, useContext } from 'react';

// Context for tabs
const TabsContext = createContext(null);

/**
 * Tabs - Root component for tabbed interface (Radix-like API)
 */
export function Tabs({ children, value, onValueChange, defaultValue, className = '' }) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;
  const handleChange = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

/**
 * TabsList - Container for tab triggers
 */
export function TabsList({ children, className = '' }) {
  return (
    <div
      className={`flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto scrollbar-hide ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * TabsTrigger - Individual tab button
 */
export function TabsTrigger({ children, value, className = '' }) {
  const context = useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      onClick={() => context?.onChange?.(value)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
        isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      } ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * TabsContent - Content panel for a tab
 */
export function TabsContent({ children, value, className = '' }) {
  const context = useContext(TabsContext);
  if (context?.value !== value) return null;

  return <div className={`animate-fade-in ${className}`}>{children}</div>;
}

/**
 * SimpleTabs - Simple tab navigation component (original API)
 *
 * @param {Array} tabs - Array of {id, label, icon?, count?}
 * @param {string} activeTab - Currently active tab id
 * @param {Function} onChange - Callback when tab changes
 * @param {string} variant - 'underline' | 'pills' | 'boxed'
 */
export default function SimpleTabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) {
  const variants = {
    underline: {
      container: 'border-b border-gray-200',
      tab: 'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
      active: 'border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary))]',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    },
    pills: {
      container: 'flex gap-2 bg-gray-100 p-1 rounded-xl',
      tab: 'px-4 py-2 text-sm font-medium rounded-lg transition-all',
      active: 'bg-white text-gray-900 shadow-sm',
      inactive: 'text-gray-500 hover:text-gray-700',
    },
    boxed: {
      container: 'flex gap-1',
      tab: 'px-4 py-2 text-sm font-medium rounded-lg border transition-all',
      active: 'bg-[hsl(var(--color-primary))] text-white border-transparent',
      inactive: 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
    },
  };

  const style = variants[variant];

  return (
    <div className={`${style.container} ${className}`}>
      <nav className={variant === 'underline' ? 'flex gap-4' : 'flex'}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange?.(tab.id)}
            className={`${style.tab} ${
              activeTab === tab.id ? style.active : style.inactive
            } flex items-center gap-2`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-white/20 text-current' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

/**
 * TabPanel - Container for tab content
 */
export function TabPanel({ children, value, activeValue }) {
  if (value !== activeValue) return null;
  return <div className="animate-fade-in">{children}</div>;
}

/**
 * TabsWithContent - Self-contained tabs with panels
 */
export function TabsWithContent({ tabs = [], defaultTab, variant = 'underline' }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      <SimpleTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant={variant} />
      <div className="mt-4">
        {tabs.map((tab) => (
          <TabPanel key={tab.id} value={tab.id} activeValue={activeTab}>
            {tab.content}
          </TabPanel>
        ))}
      </div>
    </div>
  );
}
