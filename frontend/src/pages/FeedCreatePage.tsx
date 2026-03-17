import { useNavigate } from "react-router-dom";
import { FeedBuilderForm } from "../components/feed-builder/FeedBuilderForm";
import { useToast } from "../components/ui/use-toast";
import type { Feed } from "../types/feed";

export default function FeedCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleSuccess(feed: Feed) {
    toast({ title: "Feed created!", description: `"${feed.name}" is ready to use.` });
    navigate("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Feed</h1>
        <p className="text-muted-foreground mt-1">Configure your Google News RSS feed filters.</p>
      </div>
      <FeedBuilderForm onSuccess={handleSuccess} />
    </div>
  );
}
