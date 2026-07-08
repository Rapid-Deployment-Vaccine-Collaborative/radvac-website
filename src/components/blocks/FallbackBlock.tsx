import type { WpBlock } from "@/lib/wordpress/types";
import { sanitizeWpHtml } from "@/lib/utils";

interface Props {
  block: WpBlock;
}

export function FallbackBlock({ block }: Props) {
  // If there's rendered HTML from WordPress, use it as fallback
  if (block.renderedHtml) {
    const html = sanitizeWpHtml(block.renderedHtml);
    return (
      <div
        className="prose max-w-none my-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // If we have inner blocks, try to render those
  if (block.innerBlocks && block.innerBlocks.length > 0) {
    // Lazy import to avoid circular dependency at module level
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { BlockRenderer } = require("./BlockRenderer");
    return <BlockRenderer blocks={block.innerBlocks} />;
  }

  // For truly unknown blocks in development, show a notice
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="my-4 p-3 border border-dashed border-border rounded text-sm text-text-secondary">
        Unknown block: <code className="font-mono">{block.name}</code>
      </div>
    );
  }

  return null;
}
