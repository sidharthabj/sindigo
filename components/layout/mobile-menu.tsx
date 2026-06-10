'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  username: string | null
}

export function MobileMenu({ username }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md hover:bg-accent"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-background border-b z-50 px-4 py-2 flex flex-col gap-1">
          <Link
            href="/feed"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ variant: 'ghost' }), 'justify-start')}
          >
            Feed
          </Link>
          <Link
            href="/recommendation"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ variant: 'ghost' }), 'justify-start')}
          >
            Recommendation
          </Link>
          <Link
            href="/find-people"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ variant: 'ghost' }), 'justify-start')}
          >
            Find People
          </Link>
          <Link
            href="/search"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ variant: 'ghost' }), 'justify-start')}
          >
            Add Book
          </Link>
          {username && (
            <Link
              href={`/${username}`}
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ variant: 'ghost' }), 'justify-start')}
            >
              Profile
            </Link>
          )}
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ variant: 'ghost' }), 'justify-start')}
          >
            Settings
          </Link>
        </div>
      )}
    </div>
  )
}
