import { AppHeader } from "@/components/foundation";

export default function ScanLoading() {
  return (
    <div className="min-h-dvh bg-card text-foreground">
      <AppHeader />

      <main className="py-6 sm:py-12">
        <div className="mx-auto grid max-w-5xl gap-5 px-4 sm:gap-6 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          {/* Left panel skeleton */}
          <section className="lg:pt-3 space-y-5">
            {/* Tab skeleton */}
            <div className="flex gap-2 rounded-2xl border bg-muted/50 p-1.5">
              <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
              <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
            </div>

            {/* Badge skeleton */}
            <div className="h-8 w-32 animate-pulse rounded-full bg-muted" />

            {/* Title skeleton */}
            <div className="space-y-3">
              <div className="h-9 w-4/5 animate-pulse rounded-lg bg-muted" />
              <div className="h-9 w-3/5 animate-pulse rounded-lg bg-muted" />
            </div>

            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-5 w-full animate-pulse rounded bg-muted" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-5 w-3/5 animate-pulse rounded bg-muted" />
            </div>

            {/* Info cards skeleton */}
            <div className="space-y-3">
              <div className="h-28 animate-pulse rounded-2xl border bg-muted/40" />
              <div className="h-28 animate-pulse rounded-2xl border bg-muted/40" />
            </div>
          </section>

          {/* Right panel skeleton */}
          <div className="space-y-5">
            {/* Camera area skeleton */}
            <div className="rounded-2xl border-2 border-primary/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 animate-pulse rounded bg-muted" />
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-[280px] animate-pulse rounded-2xl bg-muted/60" />
            </div>

            {/* Manual input skeleton */}
            <div className="rounded-2xl border bg-muted/20 p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="size-10 shrink-0 animate-pulse rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-12 flex-1 animate-pulse rounded-xl bg-muted" />
                <div className="h-12 w-20 animate-pulse rounded-xl bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
