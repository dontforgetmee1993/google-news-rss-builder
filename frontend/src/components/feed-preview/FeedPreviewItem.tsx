import type { RSSItem } from "../../types/feed";

interface FeedPreviewItemProps {
  item: RSSItem;
}

function relativeTime(pubDate: string): string {
  if (!pubDate) return "";
  const diff = Date.now() - new Date(pubDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function FeedPreviewItem({ item }: FeedPreviewItemProps) {
  const snippet = item.description
    ? item.description.replace(/<[^>]+>/g, "").slice(0, 150)
    : "";

  return (
    <div className="py-3 border-b last:border-0 space-y-1">
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium hover:underline line-clamp-2 text-foreground"
      >
        {item.title}
      </a>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {item.source.name && (
          <a
            href={item.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {item.source.name}
          </a>
        )}
        {item.source.name && item.pubDate && <span>·</span>}
        {item.pubDate && <span>{relativeTime(item.pubDate)}</span>}
      </div>
      {snippet && <p className="text-xs text-muted-foreground line-clamp-2">{snippet}</p>}
    </div>
  );
}
