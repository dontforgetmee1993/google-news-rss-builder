import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Copy, Check, MoreVertical, Pencil, Trash2, Power } from "lucide-react";
import type { Feed } from "../../types/feed";

interface FeedCardProps {
  feed: Feed;
  onDelete: () => void;
  onToggleActive: () => void;
}

export function FeedCard({ feed, onDelete, onToggleActive }: FeedCardProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { t } = useTranslation();

  const proxyUrl = `${window.location.origin}/rss/${feed.slug}`;
  const visibleKeywords = feed.keywords.slice(0, 5);
  const extraKeywords = feed.keywords.length - 5;

  function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return t("feedCard.today");
    if (days === 1) return t("feedCard.yesterday");
    if (days < 30) return t("feedCard.daysAgo", { count: days });
    const months = Math.floor(days / 30);
    return t("feedCard.monthsAgo", { count: months });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(proxyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{feed.name}</h3>
          {feed.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{feed.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${feed.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
            {feed.is_active ? t("feedCard.active") : t("feedCard.inactive")}
          </span>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title={t("feedCard.actions")}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-44 z-20 rounded-md border bg-popover shadow-md py-1">
                  <button
                    onClick={() => { handleCopy(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
                  >
                    <Copy className="h-3.5 w-3.5" /> {t("feedCard.copyRssUrl")}
                  </button>
                  <Link
                    to={`/feeds/${feed.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" /> {t("common.edit")}
                  </Link>
                  <button
                    onClick={() => { onToggleActive(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {feed.is_active ? t("feedCard.deactivate") : t("feedCard.activate")}
                  </button>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-accent"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {t("common.delete")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Keywords */}
      {feed.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {visibleKeywords.map((kw) => (
            <span key={kw} className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-xs font-medium">
              {kw}
            </span>
          ))}
          {extraKeywords > 0 && (
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
              {t("feedCard.moreKeywords", { count: extraKeywords })}
            </span>
          )}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{feed.country} · {feed.language}</span>
        <span>·</span>
        <span>{t("feedCard.views", { count: feed.access_count })}</span>
        <span>·</span>
        <span>{t("feedCard.created", { time: relativeTime(feed.created_at) })}</span>
      </div>

      {/* Proxy URL */}
      <div className="flex items-center gap-2 rounded-md bg-muted/50 border px-2.5 py-1.5">
        <code className="flex-1 text-xs font-mono truncate text-foreground/70">{proxyUrl}</code>
        <button onClick={handleCopy} title="Copy" className="shrink-0 p-1 rounded hover:bg-accent transition-colors">
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
          <p className="text-sm font-medium text-destructive">{t("feedCard.deleteConfirm", { name: feed.name })}</p>
          <p className="text-xs text-muted-foreground">{t("feedCard.deleteWarning")}</p>
          <div className="flex gap-2">
            <button
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              className="h-7 px-3 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-colors"
            >
              {t("common.delete")}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="h-7 px-3 rounded-md border text-xs font-medium hover:bg-accent transition-colors"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
