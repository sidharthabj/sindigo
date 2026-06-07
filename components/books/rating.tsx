import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  value: number
  onChange?: (v: number) => void
  className?: string
}

export function Rating({ value, onChange, className }: RatingProps) {
  return (
    <div className={cn('flex gap-0.5', className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < value
        return (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1} book${i === 0 ? '' : 's'}`}
            data-filled={filled}
            onClick={() => onChange?.(i + 1)}
            className={cn(
              'transition-colors',
              onChange ? 'cursor-pointer hover:text-primary' : 'cursor-default',
              filled ? 'text-primary' : 'text-muted-foreground/30'
            )}
            disabled={!onChange}
          >
            <BookOpen className="w-4 h-4" aria-hidden role="img" />
          </button>
        )
      })}
    </div>
  )
}
