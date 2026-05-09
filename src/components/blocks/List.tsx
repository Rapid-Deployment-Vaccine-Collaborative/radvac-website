import type { CoreListAttributes } from "@/lib/wordpress/types";
import { rewriteWordPressUrls } from "@/lib/utils";

interface Props {
  attributes?: Record<string, unknown>;
}

export function ListBlock({ attributes }: Props) {
  const attrs = attributes as unknown as CoreListAttributes | undefined;
  if (!attrs?.values) return null;

  const html = rewriteWordPressUrls(attrs.values);
  const Tag = attrs.ordered ? "ol" : "ul";

  return (
    <Tag
      className={`mb-4 pl-6 space-y-1 ${
        attrs.ordered
          ? "list-decimal marker:text-primary"
          : "list-disc marker:text-primary"
      } ${attrs.className || ""}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
