import {Sprout} from 'lucide-react'

import {cn} from '@/lib/utils'

interface LogoProps {
  className?: string
  variant?: 'icon' | 'full' | 'monochrome'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Logo({className, variant = 'full', size = 'md'}: LogoProps) {
  // Size mapping
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  }

  const textSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }

  if (variant === 'icon') {
    return (
      <div
        className={cn(
          'bg-primary relative flex aspect-square items-center justify-center rounded-xl',
          sizes[size],
          className
        )}
      >
        <Sprout
          className={cn('text-white', iconSizes[size])}
          strokeWidth={2.5}
        />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'bg-primary relative flex aspect-square shrink-0 items-center justify-center rounded-xl shadow-sm',
          sizes[size]
        )}
      >
        <Sprout
          className={cn('text-white', iconSizes[size])}
          strokeWidth={2.5}
        />
      </div>
      <div
        className={cn(
          'font-heading leading-none font-bold tracking-tight',
          textSize[size]
        )}
      >
        <span className="text-primary">MyHome</span>
        <span className="text-foreground">Farmer</span>
      </div>
    </div>
  )
}

export function LogoMonochrome({className, size = 'md'}: LogoProps) {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  }

  const textSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'relative flex aspect-square shrink-0 items-center justify-center rounded-lg border-2 border-current',
          sizes[size]
        )}
      >
        <Sprout
          className={cn('text-current', iconSizes[size])}
          strokeWidth={2.5}
        />
      </div>
      <div
        className={cn(
          'font-heading font-bold tracking-tight uppercase',
          textSize[size]
        )}
      >
        MyHome Farmer
      </div>
    </div>
  )
}
