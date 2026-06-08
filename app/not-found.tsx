import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-6">
        We couldn&apos;t find what you were looking for.
      </p>
      <Button asChild><Link href="/">Go home</Link></Button>
    </div>
  )
}
