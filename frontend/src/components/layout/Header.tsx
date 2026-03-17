import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "vi", label: "VI" },
];

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">{t("header.brand")}</Link>
        <nav className="flex items-center gap-4">
          <div className="flex items-center border rounded-md overflow-hidden text-sm">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`px-2 py-1 transition-colors ${
                  i18n.language === lang.code
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">{t("header.dashboard")}</Link>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 rounded-md border hover:bg-accent transition-colors"
                >
                  {t("header.logout")}
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              {t("header.login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
