const PAGE_SHELL_CLASS_NAME =
  "fixed inset-0 flex items-center justify-center p-3";
const PAGE_CONTENT_WIDTH_CLASS_NAME =
  "w-full max-w-[30.625rem] sm:max-w-[30rem] md:max-w-[40rem] lg:max-w-3xl";

export default function Loading() {
  return (
    <main className="relative w-full min-h-screen bg-gray-100">
      <div className={PAGE_SHELL_CLASS_NAME}>
        <div className={PAGE_CONTENT_WIDTH_CLASS_NAME}>
          <div className="w-full overflow-hidden rounded-xl border bg-white p-4 shadow-sm">
            <div className="mb-8 h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mb-4 flex gap-2">
              <div className="h-10 flex-1 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-28 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="mb-4 h-10 animate-pulse rounded bg-gray-100" />
            <div className="space-y-2">
              <div className="h-10 animate-pulse rounded bg-gray-100" />
              <div className="h-10 animate-pulse rounded bg-gray-100" />
              <div className="h-10 animate-pulse rounded bg-gray-100" />
              <div className="h-10 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
