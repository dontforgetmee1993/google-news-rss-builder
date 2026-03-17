import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { COUNTRIES } from "../../constants/countries";
import { cn } from "../../lib/utils";

interface CountryLanguageSelectProps {
  country: string;
  language: string;
  ceid: string;
  onChange: (country: string, language: string, ceid: string) => void;
}

export function CountryLanguageSelect({ country, language, ceid, onChange }: CountryLanguageSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = COUNTRIES.find((c) => c.gl === country);
  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.gl.toLowerCase().includes(search.toLowerCase())
  );

  function select(cfg: typeof COUNTRIES[0]) {
    onChange(cfg.gl, cfg.hl, cfg.ceid);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">Country & Language</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span>{selected ? `${selected.flag} ${selected.name}` : "Select country..."}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="p-2 border-b">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="py-2 px-3 text-sm text-muted-foreground">No results.</p>
              ) : (
                filtered.map((cfg) => (
                  <button
                    key={cfg.gl}
                    type="button"
                    onClick={() => select(cfg)}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <Check className={cn("h-4 w-4 shrink-0", cfg.gl === country ? "opacity-100" : "opacity-0")} />
                    <span>{cfg.flag}</span>
                    <span>{cfg.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{cfg.hl}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Language: <span className="font-mono">{language}</span> · CEID: <span className="font-mono">{ceid}</span>
      </p>
    </div>
  );
}
