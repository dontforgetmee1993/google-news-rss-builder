import { TIME_RANGES } from "../../constants/time-ranges";

interface TimeRangeSelectorProps {
  timeRange?: string;
  dateAfter?: string;
  dateBefore?: string;
  onChange: (timeRange?: string, dateAfter?: string, dateBefore?: string) => void;
}

const PRESET_VALUES = TIME_RANGES.filter((r) => r.value !== "custom").map((r) => r.value);

export function TimeRangeSelector({ timeRange, dateAfter, dateBefore, onChange }: TimeRangeSelectorProps) {
  const isCustom = !timeRange && (!!dateAfter || !!dateBefore);
  const activePreset = timeRange && PRESET_VALUES.includes(timeRange as typeof PRESET_VALUES[number]) ? timeRange : undefined;

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
    { label: "No filter", value: "none" },
    ...TIME_RANGES,
  ];

  const currentValue = activePreset ?? (isCustom ? "custom" : "none");

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Time Range</label>
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
            <label className="text-xs text-muted-foreground">After date</label>
            <input
              type="date"
              value={dateAfter ?? ""}
              onChange={(e) => onChange(undefined, e.target.value || undefined, dateBefore)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Before date</label>
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
