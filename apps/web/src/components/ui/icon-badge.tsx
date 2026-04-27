import { cn } from '@/lib/utils';

export interface IconBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  variant: 'snippet' | 'prompt' | 'note' | 'link' | 'image' | 'file' | 'collection';
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantClasses: Record<string, string> = {
  snippet: 'bg-primary/10 text-primary',
  prompt: 'bg-tertiary-container/20 text-tertiary',
  note: 'bg-amber-500/10 text-amber-400',
  link: 'bg-cyan-500/10 text-cyan-400',
  image: 'bg-rose-500/10 text-rose-400',
  file: 'bg-violet-500/10 text-violet-400',
  collection: '',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
};

const iconSizes: Record<string, string> = {
  sm: 'h-[14px] w-[14px]',
  md: 'h-[18px] w-[18px]',
  lg: 'h-5 w-5',
};

export function IconBadge({ icon: Icon, variant, color, size = 'md', className }: IconBadgeProps) {
  const colorClasses = variant === 'collection' && color ? color : variantClasses[variant];

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg',
        colorClasses,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}
