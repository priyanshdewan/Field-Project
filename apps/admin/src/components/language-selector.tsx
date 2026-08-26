import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INDIAN_LANGUAGES, useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

export function LanguageSelector({ className }: { className?: string }) {
  const { currentLang, selectedLanguage, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="h-8 gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-hairline bg-surface hover:bg-surface-2 transition-colors"
        title="Select Regional Language"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold text-foreground hidden sm:inline">{selectedLanguage.nativeName}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </Button>

      {open && (
        <div className="fixed inset-x-3 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full mt-2 sm:w-64 rounded-2xl border border-hairline bg-popover p-2.5 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95">
          <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-hairline mb-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search language / भाषा खोजें..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Indian Regional Languages
            </div>
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left",
                  currentLang === lang.code
                    ? "bg-primary/10 text-primary font-bold"
                    : "hover:bg-surface text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lang.flag}</span>
                  <div>
                    <span className="font-medium block leading-tight">{lang.nativeName}</span>
                    <span className="text-[10px] text-muted-foreground block leading-tight">
                      {lang.name}
                    </span>
                  </div>
                </div>
                {currentLang === lang.code && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
            {filteredLanguages.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">No language found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
