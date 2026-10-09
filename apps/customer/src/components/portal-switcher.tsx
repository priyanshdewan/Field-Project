import { useState, useRef, useEffect } from "react";
import { ChevronDown, ExternalLink, Globe, LayoutDashboard, ShoppingBag, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalSwitcherProps {
  currentPortal?: "web" | "owner" | "customer";
  className?: string;
}

const PORTALS = [
  {
    id: "owner",
    name: "Owner Portal",
    badge: "Executive & POS",
    url: "https://bizora-owner.onrender.com",
    icon: LayoutDashboard,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    desc: "POS Billing, GL Ledger, Barcode, AI",
  },
  {
    id: "customer",
    name: "Customer Express",
    badge: "10-Min Delivery",
    url: "https://bizora-customer.onrender.com",
    icon: ShoppingBag,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    desc: "Customer CRM, Digital WhatsApp Receipts",
  },
  {
    id: "web",
    name: "Marketing Web",
    badge: "Public Portal",
    url: "https://bizora-web.onrender.com",
    icon: Globe,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30",
    desc: "Feature overview, Store registration",
  },
  {
    id: "backend",
    name: "Backend REST API",
    badge: "Microservice",
    url: "https://bizora-backend-gtoe.onrender.com",
    icon: Terminal,
    color: "text-pink-500 bg-pink-500/10 border-pink-500/30",
    desc: "NestJS, Twilio WhatsApp, Gemini AI",
  },
];

export function PortalSwitcher({ currentPortal = "customer", className }: PortalSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-surface-2 transition-all h-8 shadow-xs"
        title="Switch between Bizora AI Portals"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="hidden sm:inline">Portals</span>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-xl border border-hairline bg-popover/95 p-2 shadow-2xl backdrop-blur-xl z-50">
          <div className="px-2 py-1.5 border-b border-hairline mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Bizora AI Ecosystem
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
              3 Live Portals
            </span>
          </div>

          <div className="space-y-1">
            {PORTALS.map((portal) => {
              const Icon = portal.icon;
              const isCurrent = portal.id === currentPortal;

              return (
                <a
                  key={portal.id}
                  href={portal.url}
                  target={isCurrent ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg p-2 transition-all hover:bg-surface-2 group",
                    isCurrent && "bg-surface border border-hairline"
                  )}
                >
                  <div className={cn("p-1.5 rounded-md border shrink-0 mt-0.5", portal.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {portal.name}
                      </span>
                      {isCurrent ? (
                        <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                          Current
                        </span>
                      ) : (
                        <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{portal.desc}</p>
                  </div>
                </a>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-hairline text-center">
            <a
              href="https://priyanshdewan.github.io/Field-Project/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
            >
              🚀 Open Unified Launchpad Hub <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
