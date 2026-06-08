import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function BookNotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-2">Book not found</h1>
      <p className="text-muted-foreground mb-6">
        This book isn&apos;t on this shelf, or the link may be outdated.
      </p>
      <Link href="/" className={buttonVariants()}>Go home</Link>
    </div>
  )
}
