'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.72, delay, ease: EASE },
  }
}

function inView(delay = 0) {
  return {
    initial: { opacity: 0, y: 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-64px' },
    transition: { duration: 0.8, delay, ease: EASE },
  }
}

const FRAME_STYLE: React.CSSProperties = {
  border: '1px solid var(--border)',
  boxShadow: '0 16px 48px oklch(0.14 0 0 / 0.08)',
}

export function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-background text-foreground">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-16 text-center">
        <motion.p
          {...fadeUp(0)}
          className="mb-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
        >
          A reading life worth keeping
        </motion.p>

        <motion.h1
          {...fadeUp(0.1)}
          className="font-serif text-[clamp(2.75rem,7.5vw,6.5rem)] font-normal leading-[1.04] tracking-[-0.01em]"
        >
          Your books.
          <br />
          Your voice.
          <br />
          Your shelf.
        </motion.h1>

        <motion.p
          {...fadeUp(0.22)}
          className="mt-7 max-w-[38ch] text-[1.0625rem] leading-relaxed text-muted-foreground"
        >
          Track what you read, write what you think, and follow friends who take books seriously.
        </motion.p>

        <motion.div
          {...fadeUp(0.34)}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }))}>
            Get started
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
            Log in
          </Link>
        </motion.div>

        {/* scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground opacity-50">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="h-7 w-px bg-muted-foreground opacity-25"
          />
        </motion.div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section className="bg-secondary py-28">
        <div className="mx-auto max-w-6xl space-y-32 px-6">

          {/* 1 — Shelves */}
          <motion.div
            {...inView()}
            className="grid items-center gap-16 md:grid-cols-2"
          >
            <div className="space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Organized
              </p>
              <h2 className="font-serif text-[2.25rem] font-normal leading-[1.1] tracking-tight">
                A place for every book
              </h2>
              <p className="max-w-[42ch] text-[1rem] leading-relaxed text-muted-foreground">
                Wishlist. Reading. Read. Your entire reading life, organized without the clutter. Every book you want, are in, or have finished, always exactly where you left it.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl" style={FRAME_STYLE}>
              <div className="overflow-hidden" style={{ maxHeight: 360 }}>
                <Image
                  src="/screenshots/profile.png"
                  alt="Sindigo bookshelves showing Read and Wishlist"
                  width={960}
                  height={360}
                  className="w-full object-cover object-top"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* 2 — Notes */}
          <motion.div
            {...inView()}
            className="grid items-center gap-16 md:grid-cols-2"
          >
            <div className="order-2 overflow-hidden rounded-xl md:order-1" style={FRAME_STYLE}>
              <div className="overflow-hidden" style={{ maxHeight: 360 }}>
                <Image
                  src="/screenshots/book-detail.png"
                  alt="Book detail page with rating and review"
                  width={960}
                  height={360}
                  className="w-full object-cover object-top"
                />
              </div>
            </div>

            <div className="order-1 space-y-5 md:order-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Thoughtful
              </p>
              <h2 className="font-serif text-[2.25rem] font-normal leading-[1.1] tracking-tight">
                Write what you actually think
              </h2>
              <p className="max-w-[42ch] text-[1rem] leading-relaxed text-muted-foreground">
                Ratings don't capture why a book changed you. Sindigo gives you space for a note, a reaction, a full review. Yours to keep, yours to share.
              </p>
            </div>
          </motion.div>

          {/* 3 — Feed */}
          <motion.div
            {...inView()}
            className="grid items-center gap-16 md:grid-cols-2"
          >
            <div className="space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Social
              </p>
              <h2 className="font-serif text-[2.25rem] font-normal leading-[1.1] tracking-tight">
                The best books come from people you trust
              </h2>
              <p className="max-w-[42ch] text-[1rem] leading-relaxed text-muted-foreground">
                Follow readers whose taste you trust. Your feed shows what they're adding, finishing, and loving. No algorithm. No recommendations. Just the people you follow.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl" style={FRAME_STYLE}>
              <div className="overflow-hidden" style={{ maxHeight: 360 }}>
                <Image
                  src="/screenshots/feed.png"
                  alt="Activity feed showing friends' reading"
                  width={960}
                  height={360}
                  className="w-full object-cover object-top"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── CLOSING CTA ─────────────────────────────────────────────── */}
      <section className="px-6 py-32 text-center">
        <motion.div {...inView()} className="mx-auto max-w-md space-y-9">
          <h2 className="font-serif text-[clamp(2rem,5vw,3.25rem)] font-normal leading-[1.1] tracking-tight">
            Track your reading journey.
          </h2>
          <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }))}>
            Get started
          </Link>
        </motion.div>
      </section>

    </div>
  )
}
