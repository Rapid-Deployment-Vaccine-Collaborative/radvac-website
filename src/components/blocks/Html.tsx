import sanitizeHtml from "sanitize-html";
import type { CoreHtmlAttributes } from "@/lib/wordpress/types";

interface Props {
  attributes?: Record<string, unknown>;
}

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "iframe",
    "form",
    "input",
    "button",
    "label",
    "select",
    "option",
    "textarea",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    iframe: [
      "src",
      "width",
      "height",
      "frameborder",
      "allow",
      "allowfullscreen",
      "title",
      "style",
      "loading",
    ],
    form: ["action", "method", "class", "id"],
    input: ["type", "name", "value", "placeholder", "required", "class", "id"],
    button: ["type", "class", "id"],
    label: ["for", "class"],
    select: ["name", "class", "id"],
    option: ["value"],
    textarea: ["name", "rows", "cols", "placeholder", "class", "id"],
    div: ["class", "id", "style"],
    "*": ["class", "id", "style"],
  },
  allowedIframeHostnames: [
    "www.google.com",
    "www.youtube.com",
    "youtube.com",
    "player.vimeo.com",
    "radvac.us17.list-manage.com",
  ],
};

export function HtmlBlock({ attributes }: Props) {
  const attrs = attributes as unknown as CoreHtmlAttributes | undefined;
  if (!attrs?.content) return null;

  const sanitized = sanitizeHtml(attrs.content, sanitizeOptions);

  return (
    <div
      className="my-6 [&>iframe]:w-full [&>iframe]:aspect-video [&>iframe]:rounded-lg [&>iframe]:border-0"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
