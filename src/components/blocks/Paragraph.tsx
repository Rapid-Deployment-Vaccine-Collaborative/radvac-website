import type { CoreParagraphAttributes } from "@/lib/wordpress/types";
import { rewriteWordPressUrls } from "@/lib/utils";

interface Props {
  attributes?: Record<string, unknown>;
}

export function Paragraph({ attributes }: Props) {
  const attrs = attributes as unknown as CoreParagraphAttributes | undefined;
  if (!attrs?.content) return null;

  const html = rewriteWordPressUrls(attrs.content);
  const alignClass = attrs.align ? `text-${attrs.align}` : "";

  return (
    <p
      className={`text-text leading-relaxed mb-4 ${alignClass} ${attrs.className || ""}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
