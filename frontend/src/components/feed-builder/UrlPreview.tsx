import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface UrlPreviewProps {
  url: string;
}

export function UrlPreview({ url }: UrlPreviewProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  async function handleCopy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: t("urlPreview.copied"), description: t("urlPreview.copiedDesc") });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{t("urlPreview.label")}</label>
      <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2">
        {url ? (
          <>
            <code className="flex-1 text-xs break-all font-mono text-foreground/80 line-clamp-2">
              {url}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy URL"
              className="shrink-0 p-1.5 rounded hover:bg-accent transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            </button>
          </>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            {t("urlPreview.placeholder")}
          </span>
        )}
      </div>
    </div>
  );
}
