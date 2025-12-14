import { cn } from '@/lib/utils';

type GrookLogoProps = {
  className?: string;
  compact?: boolean;
};

export function GrookLogo({ className, compact = false }: GrookLogoProps) {
  const text = 'GROOK';
  return (
    <span
      className={cn(
        'relative inline-flex font-black uppercase tracking-[0.3em] text-slate-500 dark:text-white',
        compact ? 'text-lg' : 'text-2xl',
        className
      )}
      aria-label="Grook"
    >
      <span className="relative">
        <span className="relative inline-block">
          {text}
          <span className="pointer-events-none absolute inset-0 translate-x-[1px] translate-y-[1px] text-purple-600 opacity-60 blur-[0.5px]">
            {text}
          </span>
          <span className="pointer-events-none absolute inset-0 -translate-x-[1px] -translate-y-[0.5px] text-fuchsia-900 opacity-60 mix-blend-color-dodge blur-[0.5px]">
            {text}
          </span>
        </span>
      </span>
    </span>
  );
}
