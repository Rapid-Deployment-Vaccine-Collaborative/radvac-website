import type { FaqItem } from "@/data/faq";

const PANEL_RE = /<!--\s*Inner panel Start\s*-->([\s\S]*?)<!--\s*Inner panel End\s*-->/g;
const TITLE_RE = /<span class="ac_title_class">([\s\S]*?)<\/span>\s*<\/a>/;
const BODY_RE = /<div class="wpsm_panel-body">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/;

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&nbsp;/g, " ");
}

function extractQuestion(panelHtml: string): string {
  const titleMatch = panelHtml.match(TITLE_RE);
  if (!titleMatch) return "";
  const inner = titleMatch[1]
    .replace(/<span[^>]*>[\s\S]*?<\/span>/g, "")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(inner).replace(/\s+/g, " ").trim();
}

function extractAnswer(panelHtml: string): string {
  const bodyMatch = panelHtml.match(BODY_RE);
  if (!bodyMatch) return "";
  const raw = bodyMatch[1].trim();
  return /^<(p|div|ul|ol|h\d|blockquote)\b/i.test(raw) ? raw : `<p>${raw}</p>`;
}

export function parseWpsmAccordion(html: string): FaqItem[] {
  if (!html) return [];
  const items: FaqItem[] = [];
  let m: RegExpExecArray | null;
  PANEL_RE.lastIndex = 0;
  while ((m = PANEL_RE.exec(html)) !== null) {
    const panel = m[1];
    const question = extractQuestion(panel);
    const answer = extractAnswer(panel);
    if (!question) continue;
    const index = items.length + 1;
    items.push({
      id: `q${index}`,
      num: String(index).padStart(2, "0"),
      question,
      answer,
    });
  }
  return items;
}
