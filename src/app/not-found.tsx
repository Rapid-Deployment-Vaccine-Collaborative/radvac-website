import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" />
      <section className="section">
        <div />
        <div>
          <p className="section-lede">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link className="btn primary" href="/">
            ← Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
