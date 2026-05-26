import type { SelectHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, className = '', children, ...rest },
  ref,
) {
  return (
    <label className="block w-full">
      {label && <span className="block text-sm text-black/60 mb-1.5">{label}</span>}
      <select
        ref={ref}
        {...rest}
        className={`w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-base text-black focus:outline-none focus:border-black/40 transition-colors appearance-none ${className}`}
      >
        {children}
      </select>
    </label>
  );
});
