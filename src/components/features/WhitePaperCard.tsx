import Link from "next/link";

interface WhitePaperCardProps {
  title: string;
  version?: string;
  date?: string;
  description?: string;
  pdfUrl: string;
  fileSize?: string;
}

export function WhitePaperCard({
  title,
  version,
  date,
  description,
  pdfUrl,
  fileSize,
}: WhitePaperCardProps) {
  return (
    <div className="group relative rounded-2xl border border-border bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Glass highlight on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-light/0 to-primary-light/0 group-hover:from-primary-light/30 group-hover:to-transparent transition-all duration-300" />

      <div className="relative z-10">
        {/* Version Badge */}
        {version && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary mb-4">
            {version}
          </span>
        )}

        {/* PDF Icon + Title */}
        <div className="flex items-start gap-3 mb-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 mt-0.5 text-red-500"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h3 className="text-base font-semibold text-primary-dark leading-tight">
            {title}
          </h3>
        </div>

        {/* Date */}
        {date && (
          <p className="text-xs text-text-secondary mb-2">{date}</p>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-text-secondary mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Download Link */}
        <Link
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF
          {fileSize && (
            <span className="text-text-secondary">({fileSize})</span>
          )}
        </Link>
      </div>
    </div>
  );
}
