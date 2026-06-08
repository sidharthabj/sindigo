import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function ProfileNotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-2">User not found</h1>
      <p className="text-muted-foreground mb-6">
        This profile doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/" className={buttonVariants()}>Go home</Link>
    </div>
  )
}
