import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";
import { useFeeds } from "../hooks/useFeeds";
import { FeedCard } from "../components/feed-list/FeedCard";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../components/ui/use-toast";

const PAGE_SIZE = 12;

export default function DashboardPage() {
  const { feeds, loading, error, total, currentPage, fetchFeeds, deleteFeed, toggleActive } = useFeeds();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const doSearch = useCallback(() => {
    fetchFeeds(1, search);
  }, [fetchFeeds, search]);

  // Search on Enter
  function handleSearchKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") doSearch();
  }

  async function handleDelete(id: string, name: string) {
    try {
      await deleteFeed(id);
      toast({ title: t("dashboard.feedDeleted"), description: t("dashboard.feedDeletedDesc", { name }) });
    } catch {
      toast({ title: t("common.error"), description: t("dashboard.couldNotDelete"), variant: "destructive" });
    }
  }

  async function handleToggle(id: string, current: boolean) {
    try {
      await toggleActive(id, !current);
      toast({ title: current ? t("dashboard.feedDeactivated") : t("dashboard.feedActivated") });
    } catch {
      toast({ title: t("common.error"), description: t("dashboard.couldNotUpdate"), variant: "destructive" });
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
          {total > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">{t("dashboard.feedCount", { count: total })}</p>
          )}
        </div>
        <Link
          to="/feeds/new"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t("dashboard.createNewFeed")}
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKey}
          placeholder={t("dashboard.searchPlaceholder")}
          className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 mb-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && feeds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            {search ? t("dashboard.noMatchTitle") : t("dashboard.emptyTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            {search ? t("dashboard.noMatchDesc") : t("dashboard.emptyDesc")}
          </p>
          {!search && (
            <Link
              to="/feeds/new"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("dashboard.createFirstFeed")}
            </Link>
          )}
        </div>
      )}

      {/* Feed grid */}
      {!loading && feeds.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {feeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              onDelete={() => handleDelete(feed.id, feed.name)}
              onToggleActive={() => handleToggle(feed.id, feed.is_active)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => fetchFeeds(currentPage - 1, search)}
            disabled={currentPage <= 1}
            className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t("common.previous")}
          </button>
          <span className="text-sm text-muted-foreground">
            {t("dashboard.pageOf", { current: currentPage, total: totalPages })}
          </span>
          <button
            onClick={() => fetchFeeds(currentPage + 1, search)}
            disabled={currentPage >= totalPages}
            className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t("common.next")}
          </button>
        </div>
      )}
    </div>
  );
}
