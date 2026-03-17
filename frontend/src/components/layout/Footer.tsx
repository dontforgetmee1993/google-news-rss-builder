import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 h-14 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {t("footer.text", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
