type Props = {
  error?: string;
  endpoint?: string;
};

export function CmsErrorBanner({ error, endpoint }: Props) {
  const isDev = process.env.NODE_ENV !== "production";
  const showDetails = Boolean(error || endpoint);

  return (
    <div className="py-8">
      <p className="text-center text-gray-600">
        Error: cannot retrieve content from CMS. Please check back later,
        hopefully this will be fixed! Thank you!
      </p>
      {showDetails && (
        <details
          open={isDev}
          className="mt-4 max-w-2xl mx-auto text-left text-xs text-gray-500"
        >
          <summary className="cursor-pointer select-none text-gray-600 hover:text-gray-800">
            Show detailed error
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded overflow-x-auto whitespace-pre-wrap break-words font-mono">
            {endpoint && `Endpoint: ${endpoint}\n`}
            {error && `Error: ${error}`}
          </pre>
        </details>
      )}
    </div>
  );
}
