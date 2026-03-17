import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { user, login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError(t("login.invalidEmail"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("login.genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">{t("login.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("login.subtitle")}</p>
          </div>

          {sent ? (
            <div className="text-center space-y-2">
              <p className="text-green-600 font-medium">{t("login.magicLinkSent")}</p>
              <p
                className="text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: t("login.magicLinkSentDesc", { email }) }}
              />
              <button
                className="text-sm text-primary underline mt-4"
                onClick={() => { setSent(false); setEmail(""); }}
              >
                {t("login.useDifferentEmail")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">{t("login.emailLabel")}</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.emailPlaceholder")}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t("login.sending") : t("login.sendMagicLink")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
