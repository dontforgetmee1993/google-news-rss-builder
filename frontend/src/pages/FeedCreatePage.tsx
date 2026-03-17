import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FeedBuilderForm } from "../components/feed-builder/FeedBuilderForm";
import { useToast } from "../components/ui/use-toast";
import type { Feed } from "../types/feed";

export default function FeedCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  function handleSuccess(feed: Feed) {
    toast({ title: t("feedCreate.feedCreated"), description: t("feedCreate.feedCreatedDesc", { name: feed.name }) });
    navigate("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("feedCreate.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("feedCreate.description")}</p>
      </div>
      <FeedBuilderForm onSuccess={handleSuccess} />
    </div>
  );
}
