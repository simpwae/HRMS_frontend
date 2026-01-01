import React from 'react';


export default function InputWithIcon({
  icon: Icon,
  type = 'text',
  value,
  onChange,
  name,
  id,
  placeholder,
  className = '',
  inputClassName = '',
  iconClassName = '',
  disabled,
  autoComplete,
  required,
  onBlur,
  onFocus,
  'aria-label': ariaLabel,
  children,
}) {
  return (
    <div className={`relative ${className}`}>
      {Icon && <Icon className={`input-icon ${iconClassName}`} />}
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        required={required}
        onBlur={onBlur}
        onFocus={onFocus}
        aria-label={ariaLabel}
        className={`input-with-icon ${inputClassName}`}
      />
      {/* Optional right adornments (e.g., buttons) */}
      {children}
    </div>
  );
}
