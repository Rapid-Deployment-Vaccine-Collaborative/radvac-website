import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <section className="bg-gradient-to-b from-primary-dark to-primary pt-32 pb-16 px-6">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white">
            404
          </h1>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-2xl font-heading font-bold text-primary-dark mb-4">
            Page Not Found
          </h2>
          <p className="text-text-secondary mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all"
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
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
