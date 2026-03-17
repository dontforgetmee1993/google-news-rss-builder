import { XMLParser } from "fast-xml-parser";

export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  guid: string;
  description: string;
  source: { name: string; url: string };
}

export interface RSSFeed {
  title: string;
  link: string;
  language: string;
  lastBuildDate: string;
  items: RSSItem[];
  total: number;
}

/**
 * Parses a Google News RSS XML string into a structured RSSFeed object.
 * Handles single-item feeds, missing fields, and non-XML responses gracefully.
 */
export function parseRSSXml(xml: string): RSSFeed {
  const empty: RSSFeed = { title: "", link: "", language: "", lastBuildDate: "", items: [], total: 0 };

  if (!xml || !xml.trim().startsWith("<")) return empty;

  try {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const result = parser.parse(xml);
    const channel = result?.rss?.channel;
    if (!channel) return empty;

    const rawItems = channel.item;
    const itemArray = !rawItems ? [] : Array.isArray(rawItems) ? rawItems : [rawItems];

    const items: RSSItem[] = itemArray.map((item: any) => ({
      title: item.title ?? "",
      link: item.link ?? "",
      pubDate: item.pubDate ?? "",
      guid: typeof item.guid === "object" ? (item.guid["#text"] ?? "") : (item.guid ?? ""),
      description: item.description ?? "",
      source: {
        name: typeof item.source === "object" ? (item.source["#text"] ?? "") : (item.source ?? ""),
        url: typeof item.source === "object" ? (item.source["@_url"] ?? "") : "",
      },
    }));

    return {
      title: channel.title ?? "",
      link: channel.link ?? "",
      language: channel.language ?? "",
      lastBuildDate: channel.lastBuildDate ?? "",
      items,
      total: items.length,
    };
  } catch {
    return empty;
  }
}
