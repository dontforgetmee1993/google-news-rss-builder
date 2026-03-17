import { useState } from "react";
import type { KeyboardEvent, ClipboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface TagInputProps {
  label: string;
  placeholder: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  helpText?: string;
}

export function TagInput({ label, placeholder, tags, onChange, maxTags = 20, helpText }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  function addTags(raw: string[]) {
    const cleaned = raw
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !tags.includes(t));
    if (cleaned.length === 0) return;
    const next = [...tags, ...cleaned].slice(0, maxTags);
    onChange(next);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTags([inputValue]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text");
    if (pasted.includes(",")) {
      e.preventDefault();
      addTags(pasted.split(","));
      setInputValue("");
    }
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  const atMax = tags.length >= maxTags;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
      <div
        className={cn(
          "min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          atMax && "opacity-60"
        )}
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {!atMax && (
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={tags.length === 0 ? placeholder : ""}
              className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground text-sm"
            />
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {atMax ? `Maximum ${maxTags} tags reached` : `${tags.length}/${maxTags} · Press Enter or comma to add`}
      </p>
    </div>
  );
}
