import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex gap-4 mb-10">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-md" />
        ))}
      </div>
    </div>
  )
}
