export interface BuildUrlParams {
  keywords: string[];
  exact_phrases: string[];
  excluded_keywords: string[];
  or_keywords: string[];
  domains: string[];
  country: string;
  language: string;
  ceid: string;
  time_range?: string;
  date_after?: string;
  date_before?: string;
}

/**
 * Builds a Google News RSS search URL from structured parameters.
 */
export function buildGoogleNewsUrl(params: BuildUrlParams): string {
  const parts: string[] = [];

  if (params.keywords.length > 0) {
    parts.push(params.keywords.join(" "));
  }
  for (const phrase of params.exact_phrases) {
    parts.push(`"${phrase}"`);
  }
  for (const kw of params.excluded_keywords) {
    parts.push(`-${kw}`);
  }
  if (params.or_keywords.length > 0) {
    parts.push(params.or_keywords.join(" OR "));
  }
  if (params.domains.length > 0) {
    parts.push(params.domains.map((d) => `site:${d}`).join(" OR "));
  }
  if (params.time_range) {
    parts.push(`when:${params.time_range}`);
  }
  if (params.date_after) {
    parts.push(`after:${params.date_after}`);
  }
  if (params.date_before) {
    parts.push(`before:${params.date_before}`);
  }

  const q = parts.join(" ");
  if (!q.trim()) return "";

  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", q);
  url.searchParams.set("hl", params.language);
  url.searchParams.set("gl", params.country);
  url.searchParams.set("ceid", params.ceid);

  return url.toString();
}
