export function PageLoader() {
  return (
    <div className="min-h-screen w-full bg-background px-4 py-6">
      <div className="mx-auto max-w-[1400px] space-y-6 animate-pulse">
        <div className="h-12 w-full rounded-3xl border bg-muted/40" />

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="h-24 rounded-3xl border bg-muted/40" />
          <div className="h-24 rounded-3xl border bg-muted/40" />
          <div className="h-24 rounded-3xl border bg-muted/40" />
          <div className="h-24 rounded-3xl border bg-muted/40" />
        </div>

        <div className="h-72 rounded-3xl border bg-muted/40" />
        <div className="h-72 rounded-3xl border bg-muted/40" />
      </div>
    </div>
  )
}
