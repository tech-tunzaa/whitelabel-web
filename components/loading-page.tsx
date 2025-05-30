import { Skeleton } from "@/components/ui/skeleton";

export function LoadingPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 animate-pulse">
      {/* Header area */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>

      {/* Card with skeleton table */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between mb-4">
          <Skeleton className="h-6 w-[200px]" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </div>
        
        {/* Table header */}
        <div className="grid grid-cols-4 gap-4 mb-4 px-4 py-3 bg-muted/40 rounded-md">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
        
        {/* Table rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 px-4 py-4 border-b last:border-b-0">
            {[...Array(4)].map((_, j) => (
              <Skeleton key={j} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <Skeleton className="h-8 w-[300px]" />
      </div>
    </div>
  );
}
