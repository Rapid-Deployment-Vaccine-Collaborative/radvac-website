import type { CoreGroupAttributes } from "@/lib/wordpress/types";

interface Props {
  attributes?: Record<string, unknown>;
  children?: React.ReactNode;
}

export function Group({ attributes, children }: Props) {
  const attrs = attributes as unknown as CoreGroupAttributes | undefined;
  const tagName = attrs?.tagName || "div";

  const className = `my-4 ${attrs?.className || ""}`.trim();

  switch (tagName) {
    case "section":
      return <section className={className}>{children}</section>;
    case "article":
      return <article className={className}>{children}</article>;
    case "aside":
      return <aside className={className}>{children}</aside>;
    case "main":
      return <main className={className}>{children}</main>;
    default:
      return <div className={className}>{children}</div>;
  }
}
