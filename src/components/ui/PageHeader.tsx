import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
      <div>
        <h1
          className="text-black text-4xl md:text-5xl font-medium leading-none"
          style={{ letterSpacing: '-0.04em' }}
        >
          {title}
        </h1>
        {subtitle && <p className="text-black/60 text-base mt-3 max-w-xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
