import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Sindigo</h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        Track what you&apos;re reading, share reviews with friends, and discover your next book.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className={cn(buttonVariants({ variant: 'default' }))}>
          Get started
        </Link>
        <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }))}>
          Log in
        </Link>
      </div>
    </div>
  )
}
