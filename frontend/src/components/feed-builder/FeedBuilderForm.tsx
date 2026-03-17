import { useState } from "react";
import { useFeedBuilder } from "../../hooks/useFeedBuilder";
import { TagInput } from "./TagInput";
import { CountryLanguageSelect } from "./CountryLanguageSelect";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { UrlPreview } from "./UrlPreview";
import { FeedPreview } from "../feed-preview/FeedPreview";
import { useToast } from "../ui/use-toast";
import type { Feed } from "../../types/feed";

interface FeedBuilderFormProps {
  feed?: Feed;
  feedId?: string;
  onSuccess?: (feed: Feed) => void;
}

export function FeedBuilderForm({ feed, feedId, onSuccess }: FeedBuilderFormProps) {
  const { state, generatedUrl, loading, error, update, setSlug, loadFeed, submit } = useFeedBuilder(feedId);
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);

  // Load existing feed on mount
  if (feed && !initialized) {
    loadFeed(feed);
    setInitialized(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const saved = await submit();
      toast({ title: "Feed saved!", description: `"${saved.name}" has been saved.` });
      onSuccess?.(saved);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save feed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">Feed Name <span className="text-destructive">*</span></label>
          <input
            id="name"
            value={state.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="My Tech Feed"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="slug" className="text-sm font-medium">Slug <span className="text-destructive">*</span></label>
          <input
            id="slug"
            value={state.slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-tech-feed"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p className="text-xs text-muted-foreground">Used in your RSS URL: /rss/<span className="font-mono">{state.slug || "slug"}</span></p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea
          id="description"
          value={state.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Optional description for this feed"
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>

      {/* Search Parameters */}
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Search Filters</h3>

        <TagInput
          label="Keywords (AND)"
          placeholder="Add keyword..."
          tags={state.keywords}
          onChange={(v) => update("keywords", v)}
          helpText="All keywords must appear in the article"
        />
        <TagInput
          label="Exact Phrases"
          placeholder="Add exact phrase..."
          tags={state.exact_phrases}
          onChange={(v) => update("exact_phrases", v)}
          maxTags={10}
          helpText='Wrapped in quotes — e.g. "artificial intelligence"'
        />
        <TagInput
          label="OR Keywords"
          placeholder="Add OR keyword..."
          tags={state.or_keywords}
          onChange={(v) => update("or_keywords", v)}
          helpText="At least one of these must appear"
        />
        <TagInput
          label="Excluded Keywords"
          placeholder="Add excluded keyword..."
          tags={state.excluded_keywords}
          onChange={(v) => update("excluded_keywords", v)}
          helpText="Articles containing these will be excluded"
        />
        <TagInput
          label="Domains"
          placeholder="e.g. reuters.com"
          tags={state.domains}
          onChange={(v) => update("domains", v)}
          maxTags={10}
          helpText="Filter to specific news sources"
        />
      </div>

      {/* Locale & Time */}
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Locale & Time</h3>
        <CountryLanguageSelect
          country={state.country}
          language={state.language}
          ceid={state.ceid}
          onChange={(country, language, ceid) => {
            update("country", country);
            update("language", language);
            update("ceid", ceid);
          }}
        />
        <TimeRangeSelector
          timeRange={state.time_range}
          dateAfter={state.date_after}
          dateBefore={state.date_before}
          onChange={(tr, da, db) => {
            update("time_range", tr);
            update("date_after", da);
            update("date_before", db);
          }}
        />
      </div>

      {/* URL Preview */}
      <UrlPreview url={generatedUrl} />

      {/* Feed Preview */}
      <FeedPreview url={generatedUrl} />

      {/* Visibility */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_public"
          checked={state.is_public}
          onChange={(e) => update("is_public", e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <label htmlFor="is_public" className="text-sm">Make this feed publicly accessible</label>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Saving..." : feedId ? "Update Feed" : "Save Feed"}
      </button>
    </form>
  );
}
