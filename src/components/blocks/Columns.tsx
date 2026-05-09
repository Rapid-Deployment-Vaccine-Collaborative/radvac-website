import type { WpBlock } from "@/lib/wordpress/types";
import { BlockRenderer } from "./BlockRenderer";

interface Props {
  attributes?: Record<string, unknown>;
  innerBlocks?: WpBlock[];
}

export function Columns({ attributes, innerBlocks }: Props) {
  const className = (attributes?.className as string) || "";

  return (
    <div
      className={`grid gap-6 md:grid-cols-${innerBlocks?.length || 2} my-6 ${className}`.trim()}
    >
      {innerBlocks?.map((column, i) => (
        <div key={i} className="space-y-4">
          {column.innerBlocks && (
            <BlockRenderer blocks={column.innerBlocks} />
          )}
        </div>
      ))}
    </div>
  );
}
