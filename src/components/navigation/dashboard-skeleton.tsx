export function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-slate-100" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="app-card h-28 animate-pulse bg-white p-4">
            <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
            <div className="h-8 w-16 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="app-card h-56 animate-pulse bg-white p-6">
            <div className="mb-4 h-5 w-32 rounded bg-slate-200" />
            <div className="space-y-3">
              <div className="h-12 rounded-lg bg-slate-100" />
              <div className="h-12 rounded-lg bg-slate-100" />
              <div className="h-12 rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PropertiesSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading properties">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-md bg-slate-200" />
          <div className="h-4 w-56 animate-pulse rounded-md bg-slate-100" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="app-card flex h-20 animate-pulse items-center justify-between bg-white px-4">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-3 w-28 rounded bg-slate-100" />
            </div>
            <div className="h-6 w-20 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
