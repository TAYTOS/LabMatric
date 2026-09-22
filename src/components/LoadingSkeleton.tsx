import { cn } from '../utils/cn';

export function Skeleton({ className }: {className?: string;}) {
  return <div className={cn('animate-pulse rounded-lg bg-border/70', className)} />;
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-3/4" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>);

}

export function CourseListSkeleton({ count = 4 }: {count?: number;}) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) =>
      <CourseCardSkeleton key={i} />
      )}
    </div>);

}

export function EnrollmentCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-2/3" />
    </div>);

}