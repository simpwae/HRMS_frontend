export default function CECOSLogo({ className = '', variant = 'full', size = 'md' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  if (variant === 'icon') {
    return (
      <svg
        className={`${sizeClasses[size]} ${className}`}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield Background */}
        <path
          d="M32 4L8 16V28C8 43.5 17.5 57 32 60C46.5 57 56 43.5 56 28V16L32 4Z"
          fill="#0066CC"
        />
        <path
          d="M32 4L8 16V28C8 43.5 17.5 57 32 60C46.5 57 56 43.5 56 28V16L32 4Z"
          stroke="#003366"
          strokeWidth="1.5"
        />
        {/* C Letter */}
        <path
          d="M38 24C38 19.5817 34.4183 16 30 16C25.5817 16 22 19.5817 22 24V40C22 44.4183 25.5817 48 30 48C34.4183 48 38 44.4183 38 40"
          stroke="#FF9900"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Inner Accent */}
        <circle cx="30" cy="32" r="3" fill="white" />
        {/* Book Pages */}
        <path
          d="M40 28L48 26L40 24"
          stroke="#FF9900"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 32L48 30L40 28"
          stroke="#FF9900"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg className="h-12 w-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield Background */}
        <path
          d="M32 4L8 16V28C8 43.5 17.5 57 32 60C46.5 57 56 43.5 56 28V16L32 4Z"
          fill="#800020"
        />
        <path
          d="M32 4L8 16V28C8 43.5 17.5 57 32 60C46.5 57 56 43.5 56 28V16L32 4Z"
          stroke="#001F3F"
          strokeWidth="1.5"
        />
        {/* C Letter */}
        <path
          d="M38 24C38 19.5817 34.4183 16 30 16C25.5817 16 22 19.5817 22 24V40C22 44.4183 25.5817 48 30 48C34.4183 48 38 44.4183 38 40"
          stroke="#D4AF37"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Inner Accent */}
        <circle cx="30" cy="32" r="3" fill="white" />
        {/* Book Pages */}
        <path
          d="M40 28L48 26L40 24"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 32L48 30L40 28"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-[#800020] leading-tight">CECOS</span>
        <span className="text-xs font-semibold text-[#001F3F] leading-tight">
          University, Peshawar
        </span>
      </div>
    </div>
  );
}
