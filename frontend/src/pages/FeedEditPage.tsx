import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../lib/api";
import { FeedBuilderForm } from "../components/feed-builder/FeedBuilderForm";
import { useToast } from "../components/ui/use-toast";
import type { Feed } from "../types/feed";

export default function FeedEditPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch<{ feed: Feed }>(`/api/feeds/${id}`)
      .then((res) => setFeed(res.feed))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function handleSuccess(updated: Feed) {
    setFeed(updated);
    toast({ title: t("feedEdit.feedUpdated"), description: t("feedEdit.feedUpdatedDesc", { name: updated.name }) });
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (notFound || !feed) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">{t("feedEdit.notFoundTitle")}</h1>
        <p className="text-muted-foreground mb-4">{t("feedEdit.notFoundDesc")}</p>
        <Link to="/dashboard" className="text-primary underline">{t("feedEdit.backToDashboard")}</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("feedEdit.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("feedEdit.description", { name: feed.name })}</p>
      </div>
      <FeedBuilderForm feed={feed} feedId={id} onSuccess={handleSuccess} />
    </div>
  );
}
