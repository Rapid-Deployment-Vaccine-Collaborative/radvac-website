import type { ReactNode } from "react";

type Props = {
  error?: string;
  endpoint?: string;
  /**
   * Static content to show in place of the generic "cannot retrieve
   * content" message, for sections that have curated fallback copy to
   * ride out a CMS outage. The detailed-error `<details>` block still
   * renders underneath so the outage remains visible to maintainers.
   */
  fallback?: ReactNode;
};

export function CmsErrorBanner({ error, endpoint, fallback }: Props) {
  const isDev = process.env.NODE_ENV !== "production";
  const showDetails = Boolean(error || endpoint);

  const details = showDetails && (
    <details
      open={isDev}
      className={
        fallback
          ? "mt-4 text-left text-xs text-gray-500"
          : "mt-4 max-w-2xl mx-auto text-left text-xs text-gray-500"
      }
    >
      <summary className="cursor-pointer select-none text-gray-600 hover:text-gray-800">
        {fallback
          ? "CMS unavailable — showing fallback content. Show detailed error"
          : "Show detailed error"}
      </summary>
      <pre className="mt-2 p-3 bg-gray-100 rounded overflow-x-auto whitespace-pre-wrap break-words font-mono">
        {endpoint && `Endpoint: ${endpoint}\n`}
        {error && `Error: ${error}`}
      </pre>
    </details>
  );

  if (fallback) {
    return (
      <>
        {fallback}
        {details}
      </>
    );
  }

  return (
    <div className="py-8">
      <p className="text-center text-gray-600">
        Error: cannot retrieve content from CMS. Please check back later,
        hopefully this will be fixed! Thank you!
      </p>
      {details}
    </div>
  );
}
