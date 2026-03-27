import * as React from 'react';

import { cn } from '@/lib/utils';

function Avatar({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border/70 bg-muted',
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img className={cn('aspect-square h-full w-full object-cover', className)} alt={alt} {...props} />;
}

function AvatarFallback({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full text-xs font-semibold text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };
