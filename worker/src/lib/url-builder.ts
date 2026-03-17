export interface UrlParams {
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
 * The q parameter is constructed with AND logic for keywords, quoted exact phrases,
 * minus-prefixed exclusions, OR-joined or_keywords, and site:-prefixed domains.
 */
export function buildGoogleNewsUrl(params: UrlParams): string {
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
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", q);
  url.searchParams.set("hl", params.language);
  url.searchParams.set("gl", params.country);
  url.searchParams.set("ceid", params.ceid);

  const built = url.toString();
  if (built.length > 2000) {
    throw new Error(`Generated URL exceeds 2000 characters (${built.length})`);
  }

  return built;
}

/**
 * Parses a Google News RSS URL back into structured UrlParams.
 */
export function parseGoogleNewsUrl(urlString: string): Partial<UrlParams> {
  const url = new URL(urlString);
  const q = url.searchParams.get("q") || "";
  const language = url.searchParams.get("hl") || "en-US";
  const country = url.searchParams.get("gl") || "US";
  const ceid = url.searchParams.get("ceid") || "US:en";

  const keywords: string[] = [];
  const exact_phrases: string[] = [];
  const excluded_keywords: string[] = [];
  const or_keywords: string[] = [];
  const domains: string[] = [];
  let time_range: string | undefined;
  let date_after: string | undefined;
  let date_before: string | undefined;

  // Parse quoted phrases first
  const quotedRegex = /"([^"]+)"/g;
  let quotedQ = q;
  let match;
  while ((match = quotedRegex.exec(q)) !== null) {
    exact_phrases.push(match[1]);
    quotedQ = quotedQ.replace(match[0], "");
  }

  const tokens = quotedQ.trim().split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (token.startsWith("-")) {
      excluded_keywords.push(token.slice(1));
    } else if (token.startsWith("site:")) {
      domains.push(token.slice(5));
    } else if (token.startsWith("when:")) {
      time_range = token.slice(5);
    } else if (token.startsWith("after:")) {
      date_after = token.slice(6);
    } else if (token.startsWith("before:")) {
      date_before = token.slice(7);
    } else if (token === "OR") {
      // skip OR tokens
    } else {
      keywords.push(token);
    }
  }

  return { keywords, exact_phrases, excluded_keywords, or_keywords, domains, country, language, ceid, time_range, date_after, date_before };
}
