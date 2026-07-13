/**
 * Instant skeleton while a page's data loads — tab switches render
 * immediately instead of showing a blank pause.
 */
export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="h-11 w-44 animate-pulse rounded-lg bg-slate-200" />
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}
