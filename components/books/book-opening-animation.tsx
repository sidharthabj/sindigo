'use client'

import { motion } from 'framer-motion'

interface BookOpeningAnimationProps {
  bookId: string
  children: React.ReactNode
}

export function BookOpeningAnimation({ bookId, children }: BookOpeningAnimationProps) {
  return (
    <motion.div
      layoutId={`book-${bookId}`}
      initial={{ opacity: 0, rotateY: -15, perspective: 1200 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      style={{ transformOrigin: 'left center' }}
    >
      {children}
    </motion.div>
  )
}
