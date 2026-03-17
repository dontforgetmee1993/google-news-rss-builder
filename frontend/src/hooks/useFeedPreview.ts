import { useState, useRef } from "react";
import { apiFetch } from "../lib/api";
import type { RSSItem } from "../types/feed";

function parseXmlItems(xml: string): RSSItem[] {
  try {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    const itemEls = Array.from(doc.querySelectorAll("item"));
    return itemEls.map((el) => ({
      title: el.querySelector("title")?.textContent ?? "",
      link: el.querySelector("link")?.textContent ?? "",
      pubDate: el.querySelector("pubDate")?.textContent ?? "",
      guid: el.querySelector("guid")?.textContent ?? "",
      description: el.querySelector("description")?.textContent ?? "",
      source: {
        name: el.querySelector("source")?.textContent ?? "",
        url: el.querySelector("source")?.getAttribute("url") ?? "",
      },
    }));
  } catch {
    return [];
  }
}

export function useFeedPreview() {
  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function preview(url: string) {
    if (!url) return;
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ xml: string }>("/api/feeds/preview", {
        method: "POST",
        body: JSON.stringify({ url }),
        signal: abortRef.current.signal,
      });
      setItems(parseXmlItems(res.xml));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch preview");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    abortRef.current?.abort();
    setItems([]);
    setError(null);
    setLoading(false);
  }

  return { items, loading, error, preview, clear };
}
