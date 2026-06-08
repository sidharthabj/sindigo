import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Profile header */}
      <div className="flex items-start gap-4 py-6">
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-4 mt-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      <div className="space-y-10 pb-16">
        {/* Currently Reading — horizontal scroll row */}
        <section>
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-28 space-y-2">
                <Skeleton className="aspect-[2/3] rounded-md" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </section>

        {/* Read — responsive grid matching ShelfSection */}
        <section>
          <Skeleton className="h-6 w-12 mb-4" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] rounded-md" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </section>

        {/* Wishlist — responsive grid matching ShelfSection */}
        <section>
          <Skeleton className="h-6 w-20 mb-4" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] rounded-md" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
