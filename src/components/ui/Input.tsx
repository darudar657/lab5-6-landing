import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = '', ...rest },
  ref,
) {
  return (
    <label className="block w-full">
      {label && <span className="block text-sm text-black/60 mb-1.5">{label}</span>}
      <input
        ref={ref}
        {...rest}
        className={`w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-base text-black placeholder-black/40 focus:outline-none focus:border-black/40 transition-colors ${
          error ? 'border-red-400 focus:border-red-500' : ''
        } ${className}`}
      />
      {error && <span className="block text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
});
