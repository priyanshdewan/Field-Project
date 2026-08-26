import { BizoraLogo, BizoraLogoIcon } from "@/components/bizora-logo";
import { LanguageSelector } from "@/components/language-selector";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  Receipt,
  Users,
  Building2,
  PieChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Sparkles,
  Menu,
  X,
  Bot,
  Warehouse,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  FileText,
  BadgeAlert,
  ArrowRight,
  TrendingDown,
  Building,
  DollarSign,
  Settings,
  Truck,
  Store,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBusinessData } from "@/lib/business-context";
import {
  Product360Drawer,
  Customer360Drawer,
  Supplier360Drawer,
  RecommendationInvestigateDrawer,
} from "@/components/details-drawers";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }: { location: any }) => {
    const { getCurrentSessionServer } = await import("@/lib/server-auth");
    const res = await getCurrentSessionServer();
    if (!res.user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AppShell,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };
type NavSection = { section: string; items: NavItem[] };

const NAV: NavSection[] = [
  {
    section: "My Account",
    items: [
      { to: "/customer-portal", label: "Amazon Fresh Storefront", icon: Store },
      { to: "/transactions", label: "My Orders & Digital Receipts", icon: Receipt },
    ],
  },
  {
    section: "Shopping & Delivery",
    items: [
      { to: "/logistics", label: "Live 10-Min Delivery Tracking", icon: Truck },
    ],
  },
];

function AppShell() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readNotifs, setReadNotifs] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s: any) => s.location.pathname });

  const {
    activeProductId,
    activeCustomerId,
    activeSupplierId,
    activeRecId,
    closeProduct360,
    closeCustomer360,
    closeSupplier360,
    closeRecommendation,
  } = useBusinessData();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-3">
      <div className="space-y-4">
        {/* Logo Header */}
        <div className="flex items-center justify-between px-2 py-1">
          {!collapsed && (
            <Link to="/customer-portal" className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold tracking-tight text-foreground">
                  Bizora Customer
                </p>
                <p className="text-[9px] text-muted-foreground">Hyperlocal 10-Min Shopping</p>
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:grid h-6 w-6 place-items-center rounded-md border border-hairline text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4">
          {NAV.map((sec) => (
            <div key={sec.section}>
              {!collapsed && (
                <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  {sec.section}
                </p>
              )}
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="border-t border-hairline pt-3">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-400">
                {user?.name?.[0] || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{user?.name || "Customer"}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive mx-auto"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden md:block shrink-0 border-r border-hairline bg-sidebar transition-all duration-200",
          collapsed ? "w-14" : "w-60",
        )}
      >
        {navContent}
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-12 items-center justify-between border-b border-hairline bg-sidebar px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden grid h-8 w-8 place-items-center rounded-md border border-hairline text-muted-foreground"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <BizoraLogoIcon className="h-5 w-5 shrink-0" />
              <span>Bizora AI — Hyperlocal Customer Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Sign Out
            </Button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          <Outlet />
        </main>
      </div>

      {/* 360 Drawers */}
      {activeProductId && <Product360Drawer productId={activeProductId} onClose={closeProduct360} />}
      {activeCustomerId && <Customer360Drawer customerId={activeCustomerId} onClose={closeCustomer360} />}
      {activeSupplierId && <Supplier360Drawer supplierId={activeSupplierId} onClose={closeSupplier360} />}
      {activeRecId && (
        <RecommendationInvestigateDrawer recId={activeRecId} onClose={closeRecommendation} />
      )}
    </div>
  );
}
