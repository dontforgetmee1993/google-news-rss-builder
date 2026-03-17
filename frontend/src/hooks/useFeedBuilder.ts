import { useState, useEffect, useRef } from "react";
import { buildGoogleNewsUrl } from "../lib/rss-url-builder";
import { apiFetch } from "../lib/api";
import type { Feed } from "../types/feed";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

export interface FeedBuilderState {
  name: string;
  slug: string;
  description: string;
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
  is_public: boolean;
}

const DEFAULT_STATE: FeedBuilderState = {
  name: "",
  slug: "",
  description: "",
  keywords: [],
  exact_phrases: [],
  excluded_keywords: [],
  or_keywords: [],
  domains: [],
  country: "US",
  language: "en-US",
  ceid: "US:en",
  time_range: undefined,
  date_after: undefined,
  date_before: undefined,
  is_public: false,
};

export function useFeedBuilder(feedId?: string) {
  const [state, setState] = useState<FeedBuilderState>(DEFAULT_STATE);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-generate slug from name (unless manually edited)
  useEffect(() => {
    if (!slugManuallyEdited) {
      setState((s) => ({ ...s, slug: slugify(s.name) }));
    }
  }, [state.name, slugManuallyEdited]);

  // Debounced URL generation
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const url = buildGoogleNewsUrl(state);
      setGeneratedUrl(url);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [
    state.keywords, state.exact_phrases, state.excluded_keywords,
    state.or_keywords, state.domains, state.country, state.language,
    state.ceid, state.time_range, state.date_after, state.date_before,
  ]);

  function update<K extends keyof FeedBuilderState>(key: K, value: FeedBuilderState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function setSlug(value: string) {
    setSlugManuallyEdited(true);
    setState((s) => ({ ...s, slug: value }));
  }

  function loadFeed(feed: Feed) {
    setState({
      name: feed.name,
      slug: feed.slug,
      description: feed.description ?? "",
      keywords: feed.keywords,
      exact_phrases: feed.exact_phrases,
      excluded_keywords: feed.excluded_keywords,
      or_keywords: feed.or_keywords,
      domains: feed.domains,
      country: feed.country,
      language: feed.language,
      ceid: feed.ceid,
      time_range: feed.time_range ?? undefined,
      date_after: feed.date_after ?? undefined,
      date_before: feed.date_before ?? undefined,
      is_public: feed.is_public,
    });
    setSlugManuallyEdited(true);
  }

  function validate(): string | null {
    if (!state.name.trim()) return "Feed name is required.";
    if (!state.slug.trim()) return "Slug is required.";
    if (
      state.keywords.length === 0 &&
      state.domains.length === 0 &&
      state.exact_phrases.length === 0 &&
      state.or_keywords.length === 0
    ) return "At least one keyword, phrase, or domain is required.";
    return null;
  }

  async function submit(): Promise<Feed> {
    const validationError = validate();
    if (validationError) throw new Error(validationError);

    setLoading(true);
    setError(null);
    try {
      const body = { ...state, generated_url: generatedUrl };
      let result: { feed: Feed };
      if (feedId) {
        result = await apiFetch<{ feed: Feed }>(`/api/feeds/${feedId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        result = await apiFetch<{ feed: Feed }>("/api/feeds", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      return result.feed;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { state, generatedUrl, loading, error, update, setSlug, loadFeed, submit, validate };
}
