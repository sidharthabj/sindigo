'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Recommendation } from '@/lib/types'

interface RecommendationResultsProps {
  recommendations: Recommendation[]
  renderAction?: (rec: Recommendation) => React.ReactNode
}

export function RecommendationResults({ recommendations, renderAction }: RecommendationResultsProps) {
  return (
    <ul className="space-y-4">
      {recommendations.map((rec, i) => (
        <motion.li
          key={`${rec.title}-${i}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="flex gap-4 rounded-xl border bg-card p-4 shadow-sm"
        >
          <div className="flex-shrink-0">
            {rec.coverUrl ? (
              <Image src={rec.coverUrl} alt={rec.title} width={56} height={84} className="rounded-md object-cover shadow-sm" />
            ) : (
              <div className="w-14 h-[84px] rounded-md bg-muted flex items-center justify-center px-1">
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{rec.title}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="font-semibold text-sm leading-snug">{rec.title}</p>
            <p className="text-xs text-muted-foreground">{rec.author}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{rec.reason}</p>
            {renderAction && <div className="pt-0.5">{renderAction(rec)}</div>}
          </div>
        </motion.li>
      ))}
    </ul>
  )
}
