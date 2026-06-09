'use client'

import { motion } from 'framer-motion'
import type { ReactNode, CSSProperties } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

interface WrapperProps {
  delay?: number
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function FadeUp({ delay = 0, children, className, style }: WrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, delay, ease: EASE }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// No opacity in initial — content is always visible, only translates up on scroll.
// This ensures sections are readable without JS and for crawlers.
export function InView({ delay = 0, children, className }: WrapperProps) {
  return (
    <motion.div
      initial={{ y: 36 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScrollIndicator() {
  return (
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
  )
}
