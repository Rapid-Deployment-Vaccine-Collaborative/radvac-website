import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="sec-num">
        <strong>404</strong>
      </div>
      <div>
        <p className="section-lede">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link className="btn primary" href="/">
          ← Back to home
        </Link>
      </div>
    </section>
  );
}
