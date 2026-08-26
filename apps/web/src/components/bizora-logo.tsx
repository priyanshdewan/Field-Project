import { cn } from "@/lib/utils";

interface BizoraLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  subtitle?: string;
  variant?: "default" | "admin" | "owner" | "supplier" | "customer" | "web";
}

export function BizoraLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full drop-shadow-sm", className)}
    >
      <defs>
        <linearGradient id="bz-grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
        <linearGradient id="bz-grad-accent" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="bz-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded container with vibrant gradient */}
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#bz-grad-main)" />

      {/* Sleek geometric B logo paths */}
      <path
        d="M11 10H23C26.3137 10 29 12.6863 29 16C29 19.3137 26.3137 22 23 22H11V10Z"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
      <path
        d="M11 20H24.5C27.8137 20 30.5 22.6863 30.5 26C30.5 29.3137 27.8137 32 24.5 32H11V20Z"
        fill="url(#bz-grad-accent)"
      />
      <circle cx="21" cy="21" r="2.5" fill="#FFFFFF" filter="url(#bz-glow-filter)" />
    </svg>
  );
}

export function BizoraLogo({
  className,
  size = "md",
  subtitle,
  variant = "default",
}: BizoraLogoProps) {
  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
    xl: "h-14 w-14",
  };

  const titleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const variantBadges = {
    default: { text: "AI Decision OS", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    admin: { text: "SUPER ADMIN CONSOLE", color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20" },
    owner: { text: "BUSINESS OWNER PORTAL", color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" },
    supplier: { text: "SUPPLIER NETWORK HUB", color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20" },
    customer: { text: "SHOPPER EXPERIENCE PORTAL", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    web: { text: "ENTERPRISE INTELLIGENCE", color: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20" },
  };

  const badge = variantBadges[variant] || variantBadges.default;
  const sub = subtitle || badge.text;

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div className={cn("shrink-0 rounded-xl shadow-sm transition-transform hover:scale-105", iconSizes[size])}>
        <BizoraLogoIcon />
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span className={cn("font-display font-black tracking-tight text-foreground", titleSizes[size])}>
            Bizora
          </span>
          <span className={cn("font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500", titleSizes[size])}>
            AI
          </span>
        </div>
        {sub && (
          <span className={cn("mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border w-fit leading-none hidden sm:inline-block", badge.color)}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
