import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      toast({ title: t("feedBuilder.feedSaved"), description: t("feedBuilder.feedSavedDesc", { name: saved.name }) });
      onSuccess?.(saved);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("feedBuilder.failedToSave");
      toast({ title: t("common.error"), description: msg, variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">{t("feedBuilder.feedName")} <span className="text-destructive">*</span></label>
          <input
            id="name"
            value={state.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={t("feedBuilder.feedNamePlaceholder")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="slug" className="text-sm font-medium">{t("feedBuilder.slug")} <span className="text-destructive">*</span></label>
          <input
            id="slug"
            value={state.slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={t("feedBuilder.slugPlaceholder")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p className="text-xs text-muted-foreground">{t("feedBuilder.slugHelp", { slug: state.slug || "slug" })}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium">{t("feedBuilder.descriptionLabel")}</label>
        <textarea
          id="description"
          value={state.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder={t("feedBuilder.descriptionPlaceholder")}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>

      {/* Search Parameters */}
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t("feedBuilder.searchFilters")}</h3>

        <TagInput
          label={t("feedBuilder.keywordsAnd")}
          placeholder={t("feedBuilder.keywordsPlaceholder")}
          tags={state.keywords}
          onChange={(v) => update("keywords", v)}
          helpText={t("feedBuilder.keywordsHelp")}
        />
        <TagInput
          label={t("feedBuilder.exactPhrases")}
          placeholder={t("feedBuilder.exactPhrasesPlaceholder")}
          tags={state.exact_phrases}
          onChange={(v) => update("exact_phrases", v)}
          maxTags={10}
          helpText={t("feedBuilder.exactPhrasesHelp")}
        />
        <TagInput
          label={t("feedBuilder.orKeywords")}
          placeholder={t("feedBuilder.orKeywordsPlaceholder")}
          tags={state.or_keywords}
          onChange={(v) => update("or_keywords", v)}
          helpText={t("feedBuilder.orKeywordsHelp")}
        />
        <TagInput
          label={t("feedBuilder.excludedKeywords")}
          placeholder={t("feedBuilder.excludedKeywordsPlaceholder")}
          tags={state.excluded_keywords}
          onChange={(v) => update("excluded_keywords", v)}
          helpText={t("feedBuilder.excludedKeywordsHelp")}
        />
        <TagInput
          label={t("feedBuilder.domains")}
          placeholder={t("feedBuilder.domainsPlaceholder")}
          tags={state.domains}
          onChange={(v) => update("domains", v)}
          maxTags={10}
          helpText={t("feedBuilder.domainsHelp")}
        />
      </div>

      {/* Locale & Time */}
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t("feedBuilder.localeTime")}</h3>
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
        <label htmlFor="is_public" className="text-sm">{t("feedBuilder.makePublic")}</label>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? t("feedBuilder.saving") : feedId ? t("feedBuilder.updateFeed") : t("feedBuilder.saveFeed")}
      </button>
    </form>
  );
}
