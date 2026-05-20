import type { CoreHtmlAttributes } from "@/lib/wordpress/types";

interface Props {
  attributes?: Record<string, unknown>;
}

export function HtmlBlock({ attributes }: Props) {
  const attrs = attributes as unknown as CoreHtmlAttributes | undefined;
  if (!attrs?.content) return null;

  return (
    <div
      className="my-6 [&>iframe]:w-full [&>iframe]:aspect-video [&>iframe]:rounded-lg [&>iframe]:border-0"
      dangerouslySetInnerHTML={{ __html: attrs.content }}
    />
  );
}
