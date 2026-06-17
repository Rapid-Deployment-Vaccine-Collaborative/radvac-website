#!/usr/bin/env node
// Generate wordpress/import/faq-page.xml (WXR) from src/data/faq.ts.
// Mirrors the ACF repeater postmeta storage convention so that, after WXR
// import + ACF field-group import, the FAQ page renders fully populated in
// the WP admin without any manual data entry.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { faqData } from "../src/data/faq";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "wordpress", "import", "faq-page.xml");
const POST_ID = 99001; // high id to avoid collision with radvac-content.xml

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cdata(s) {
  // CDATA can't contain "]]>" — split if needed.
  return `<![CDATA[${String(s).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function meta(key, value) {
  return `\t\t<wp:postmeta>\n\t\t\t<wp:meta_key>${cdata(key)}</wp:meta_key>\n\t\t\t<wp:meta_value>${cdata(value)}</wp:meta_value>\n\t\t</wp:postmeta>`;
}

const metas = [];

// Top-level repeater row count + ACF field-key reference
metas.push(meta("faq_sections", String(faqData.length)));
metas.push(meta("_faq_sections", "field_faq_sections"));

faqData.forEach((section, i) => {
  metas.push(meta(`faq_sections_${i}_label`, section.label));
  metas.push(meta(`_faq_sections_${i}_label`, "field_faq_section_label"));

  metas.push(meta(`faq_sections_${i}_items`, String(section.items.length)));
  metas.push(meta(`_faq_sections_${i}_items`, "field_faq_section_items"));

  section.items.forEach((item, j) => {
    metas.push(meta(`faq_sections_${i}_items_${j}_question`, item.question));
    metas.push(meta(`_faq_sections_${i}_items_${j}_question`, "field_faq_item_question"));

    metas.push(meta(`faq_sections_${i}_items_${j}_answer`, item.answer));
    metas.push(meta(`_faq_sections_${i}_items_${j}_answer`, "field_faq_item_answer"));

    metas.push(meta(`faq_sections_${i}_items_${j}_default_open`, item.open ? "1" : "0"));
    metas.push(meta(`_faq_sections_${i}_items_${j}_default_open`, "field_faq_item_default_open"));
  });
});

const now = new Date().toISOString().replace("T", " ").slice(0, 19);
const nowGmt = now;
const pubDate = new Date().toUTCString();

const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
\txmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
\txmlns:content="http://purl.org/rss/1.0/modules/content/"
\txmlns:wfw="http://wellformedweb.org/CommentAPI/"
\txmlns:dc="http://purl.org/dc/elements/1.1/"
\txmlns:wp="http://wordpress.org/export/1.2/">

<channel>
\t<title>Radvac FAQ import</title>
\t<link>https://radvac.org</link>
\t<description>FAQ page (slug: faq) with ACF-backed sections + items.</description>
\t<pubDate>${pubDate}</pubDate>
\t<language>en-US</language>
\t<wp:wxr_version>1.2</wp:wxr_version>
\t<wp:base_site_url>https://radvac.org</wp:base_site_url>
\t<wp:base_blog_url>https://radvac.org</wp:base_blog_url>

\t<item>
\t\t<title>${xmlEscape("FAQ")}</title>
\t\t<link>https://radvac.org/faq/</link>
\t\t<pubDate>${pubDate}</pubDate>
\t\t<dc:creator>${cdata("admin")}</dc:creator>
\t\t<guid isPermaLink="false">https://radvac.org/?page_id=${POST_ID}</guid>
\t\t<description></description>
\t\t<content:encoded>${cdata("")}</content:encoded>
\t\t<excerpt:encoded>${cdata("")}</excerpt:encoded>
\t\t<wp:post_id>${POST_ID}</wp:post_id>
\t\t<wp:post_date>${cdata(now)}</wp:post_date>
\t\t<wp:post_date_gmt>${cdata(nowGmt)}</wp:post_date_gmt>
\t\t<wp:comment_status>${cdata("closed")}</wp:comment_status>
\t\t<wp:ping_status>${cdata("closed")}</wp:ping_status>
\t\t<wp:post_name>${cdata("faq")}</wp:post_name>
\t\t<wp:status>${cdata("publish")}</wp:status>
\t\t<wp:post_parent>0</wp:post_parent>
\t\t<wp:menu_order>0</wp:menu_order>
\t\t<wp:post_type>${cdata("page")}</wp:post_type>
\t\t<wp:post_password>${cdata("")}</wp:post_password>
\t\t<wp:is_sticky>0</wp:is_sticky>
${metas.join("\n")}
\t</item>

</channel>
</rss>
`;

writeFileSync(OUT, xml, "utf8");
console.log(`Wrote ${OUT} — ${faqData.length} sections, ${faqData.reduce((n, s) => n + s.items.length, 0)} items, ${metas.length} postmeta rows.`);
