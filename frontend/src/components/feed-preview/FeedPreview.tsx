import { useFeedPreview } from "../../hooks/useFeedPreview";
import { FeedPreviewItem } from "./FeedPreviewItem";
import { Skeleton } from "../ui/skeleton";

interface FeedPreviewProps {
  url: string;
}

export function FeedPreview({ url }: FeedPreviewProps) {
  const { items, loading, error, preview } = useFeedPreview();

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Feed Preview</h3>
        <button
          type="button"
          onClick={() => preview(url)}
          disabled={!url || loading}
          className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Loading..." : "Preview"}
        </button>
      </div>

      <div className="px-4">
        {loading && (
          <div className="space-y-3 py-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 py-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="py-4 text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground text-center">
            Click "Preview" to see matching articles, or try different keywords.
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <p className="pt-3 pb-1 text-xs text-muted-foreground">
              Showing {items.length} article{items.length !== 1 ? "s" : ""}
            </p>
            {items.map((item, i) => (
              <FeedPreviewItem key={i} item={item} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
