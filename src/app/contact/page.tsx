import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <section className="section">
      <div className="sec-num">
        <strong>Contact</strong>
      </div>
      <div>
        <p className="section-lede">
          Send us a message at{" "}
          <a href="https://radvac.org/contact/">radvac.org/contact</a>. Please
          let us know how you would like to help, and any skills and knowledge
          you would like to contribute to the effort.
        </p>
      </div>
    </section>
  );
}
