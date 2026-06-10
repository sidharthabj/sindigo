'use client'

import { motion } from 'framer-motion'

const FLOATERS = [
  { emoji: '📖', x: 5,  y: 10, dx: 40,  dy: -30, r: 12,  dur: 12, delay: 0   },
  { emoji: '📚', x: 15, y: 70, dx: -25, dy: -40, r: -8,  dur: 10, delay: 1.2 },
  { emoji: '📕', x: 75, y: 15, dx: 30,  dy: 35,  r: 15,  dur: 14, delay: 0.5 },
  { emoji: '📗', x: 85, y: 60, dx: -35, dy: -25, r: -12, dur: 11, delay: 2.1 },
  { emoji: '📘', x: 45, y: 5,  dx: 20,  dy: 40,  r: 8,   dur: 13, delay: 0.8 },
  { emoji: '📙', x: 25, y: 85, dx: -30, dy: -20, r: -10, dur: 9,  delay: 1.7 },
  { emoji: '📔', x: 65, y: 80, dx: 25,  dy: -35, r: 14,  dur: 11, delay: 0.3 },
  { emoji: '📓', x: 90, y: 35, dx: -20, dy: 30,  r: -6,  dur: 13, delay: 2.5 },
]

export function FloatingBooksBg() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {FLOATERS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{ left: `${f.x}%`, top: `${f.y}%` }}
          animate={{
            x: [0, f.dx, 0],
            y: [0, f.dy, 0],
            rotate: [0, f.r, 0],
            opacity: [0.18, 0.35, 0.18],
          }}
          transition={{
            duration: f.dur,
            repeat: Infinity,
            delay: f.delay,
            ease: 'easeInOut',
          }}
        >
          {f.emoji}
        </motion.div>
      ))}
    </div>
  )
}
