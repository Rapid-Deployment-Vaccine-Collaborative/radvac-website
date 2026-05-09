import type { WpBlock } from "@/lib/wordpress/types";
import { Paragraph } from "./Paragraph";
import { Heading } from "./Heading";
import { ListBlock } from "./List";
import { ImageBlock } from "./Image";
import { HtmlBlock } from "./Html";
import { Group } from "./Group";
import { Columns } from "./Columns";
import { FallbackBlock } from "./FallbackBlock";

interface BlockRendererProps {
  blocks: WpBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockComponent key={i} block={block} />
      ))}
    </>
  );
}

function BlockComponent({ block }: { block: WpBlock }) {
  switch (block.name) {
    case "core/paragraph":
      return <Paragraph attributes={block.attributes} />;

    case "core/heading":
      return <Heading attributes={block.attributes} />;

    case "core/list":
      return <ListBlock attributes={block.attributes} />;

    case "core/image":
      return <ImageBlock attributes={block.attributes} />;

    case "core/html":
      return <HtmlBlock attributes={block.attributes} />;

    case "core/group":
      return (
        <Group attributes={block.attributes}>
          {block.innerBlocks && <BlockRenderer blocks={block.innerBlocks} />}
        </Group>
      );

    case "core/columns":
      return (
        <Columns attributes={block.attributes} innerBlocks={block.innerBlocks} />
      );

    case "core/column":
      return (
        <div className={block.attributes?.className as string || ""}>
          {block.innerBlocks && <BlockRenderer blocks={block.innerBlocks} />}
        </div>
      );

    default:
      return <FallbackBlock block={block} />;
  }
}
