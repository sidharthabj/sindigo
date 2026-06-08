import { Skeleton } from '@/components/ui/skeleton'

export default function FeedLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-16 w-full ml-12" />
        </div>
      ))}
    </div>
  )
}
