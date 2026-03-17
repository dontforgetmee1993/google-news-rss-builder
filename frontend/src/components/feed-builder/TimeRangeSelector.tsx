import { useTranslation } from "react-i18next";

interface TimeRangeSelectorProps {
  timeRange?: string;
  dateAfter?: string;
  dateBefore?: string;
  onChange: (timeRange?: string, dateAfter?: string, dateBefore?: string) => void;
}

const PRESET_VALUES = ["1d", "7d", "1m", "1y"] as const;

export function TimeRangeSelector({ timeRange, dateAfter, dateBefore, onChange }: TimeRangeSelectorProps) {
  const { t } = useTranslation();
  const isCustom = !timeRange && (!!dateAfter || !!dateBefore);
  const activePreset = timeRange && (PRESET_VALUES as readonly string[]).includes(timeRange) ? timeRange : undefined;

  function selectPreset(value: string) {
    if (value === "none") {
      onChange(undefined, undefined, undefined);
    } else if (value === "custom") {
      onChange(undefined, dateAfter, dateBefore);
    } else {
      onChange(value, undefined, undefined);
    }
  }

  const options = [
    { label: t("timeRange.noFilter"), value: "none" },
    { label: t("timeRange.last24h"), value: "1d" },
    { label: t("timeRange.last7d"), value: "7d" },
    { label: t("timeRange.last30d"), value: "1m" },
    { label: t("timeRange.lastYear"), value: "1y" },
    { label: t("timeRange.customRange"), value: "custom" },
  ];

  const currentValue = activePreset ?? (isCustom ? "custom" : "none");

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{t("timeRange.label")}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => selectPreset(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              currentValue === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-input hover:bg-accent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {currentValue === "custom" && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t("timeRange.afterDate")}</label>
            <input
              type="date"
              value={dateAfter ?? ""}
              onChange={(e) => onChange(undefined, e.target.value || undefined, dateBefore)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t("timeRange.beforeDate")}</label>
            <input
              type="date"
              value={dateBefore ?? ""}
              onChange={(e) => onChange(undefined, dateAfter, e.target.value || undefined)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      )}
    </div>
  );
}
