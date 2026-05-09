import NextImage from "next/image";
import type { CoreImageAttributes } from "@/lib/wordpress/types";
import { rewriteWordPressUrls } from "@/lib/utils";

interface Props {
  attributes?: Record<string, unknown>;
}

export function ImageBlock({ attributes }: Props) {
  const attrs = attributes as unknown as CoreImageAttributes | undefined;
  if (!attrs?.src) return null;

  const src = rewriteWordPressUrls(attrs.src);

  return (
    <figure className={`my-6 ${attrs.className || ""}`.trim()}>
      <NextImage
        src={src}
        alt={attrs.alt || ""}
        width={attrs.width || 800}
        height={attrs.height || 600}
        className="rounded-lg w-full h-auto"
        sizes="(max-width: 768px) 100vw, 800px"
      />
      {attrs.caption && (
        <figcaption
          className="mt-2 text-sm text-text-secondary text-center"
          dangerouslySetInnerHTML={{ __html: attrs.caption }}
        />
      )}
    </figure>
  );
}
