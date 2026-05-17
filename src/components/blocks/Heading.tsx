import type { CoreHeadingAttributes } from "@/lib/wordpress/types";
import { sanitizeWpHtml } from "@/lib/utils";

interface Props {
  attributes?: Record<string, unknown>;
}

const levelStyles: Record<number, string> = {
  1: "text-4xl md:text-5xl font-bold mt-12 mb-6",
  2: "text-3xl md:text-4xl font-bold mt-10 mb-5",
  3: "text-2xl md:text-3xl font-semibold mt-8 mb-4",
  4: "text-xl md:text-2xl font-semibold mt-6 mb-3",
  5: "text-lg md:text-xl font-medium mt-4 mb-2",
  6: "text-base md:text-lg font-medium mt-4 mb-2",
};

export function Heading({ attributes }: Props) {
  const attrs = attributes as unknown as CoreHeadingAttributes | undefined;
  if (!attrs?.content) return null;

  const level = attrs.level || 2;
  const html = sanitizeWpHtml(attrs.content);
  const style = levelStyles[level] || levelStyles[2];
  const alignClass = attrs.textAlign ? `text-${attrs.textAlign}` : "";
  const className = `font-heading text-primary-dark ${style} ${alignClass} ${attrs.className || ""}`.trim();

  const props = { className, dangerouslySetInnerHTML: { __html: html } };

  switch (level) {
    case 1: return <h1 {...props} />;
    case 2: return <h2 {...props} />;
    case 3: return <h3 {...props} />;
    case 4: return <h4 {...props} />;
    case 5: return <h5 {...props} />;
    case 6: return <h6 {...props} />;
    default: return <h2 {...props} />;
  }
}
