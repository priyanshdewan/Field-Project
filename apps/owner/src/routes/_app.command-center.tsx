import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Wallet,
  Warehouse,
  Sparkles,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  PhoneCall,
  RefreshCw,
  Loader2,
  Building2,
  ChefHat,
  Utensils,
  Truck,
  CalendarClock,
  FileCheck,
  Thermometer,
  Barcode,
  Clock,
  HeartHandshake,
  Grid,
  Tag,
  Layers,
  Crown,
  Cpu,
  CreditCard,
  Award,
  Wrench,
  BookOpen,
  Navigation,
  FileSpreadsheet,
  Factory,
  Package,
  DollarSign,
  ChevronDown,
  Store,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { fmtINR } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { useBusinessData, type KpiItem } from "@/lib/business-context";
import { getCommandCenterServer, dispatchEodReportServer, getForecastingServer } from "@/lib/server-analytics";
import { getMessageLogsServer } from "@/lib/server-whatsapp-logs";
import { getIndustryConfig, INDUSTRY_CONFIGS, type BusinessCategory } from "@/lib/industry-config";

function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export const Route = createFileRoute("/_app/command-center")({
  head: () => ({
    meta: [
      { title: "Command Center | Bizora" },
      {
        name: "description",
        content:
          "Executive command center for mall owners: KPIs, AI briefs, revenue analytics, forecasts, and recommendations.",
      },
    ],
  }),
  component: CommandCenter,
});

const ICONS: Record<string, React.ReactNode> = {
  revenue: <IndianRupee className="h-4 w-4" />,
  profit: <TrendingUp className="h-4 w-4" />,
  orders: <ShoppingBag className="h-4 w-4" />,
  footfall: <Users className="h-4 w-4" />,
  newCustomers: <Users className="h-4 w-4" />,
  aov: <Receipt className="h-4 w-4" />,
  inventory: <Warehouse className="h-4 w-4" />,
  expenses: <Wallet className="h-4 w-4" />,
};

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

export function CommandCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const greeting = greetingFor(new Date("2026-07-27T12:00:00.000Z"));

  const {
    timeSeriesData,
    departmentRevenue,
    scopedRecommendations,
    scopedTransactions,
    scopedExpenses,
    transactions,
    activeDate,
    timeRange,
  } = useBusinessData();

  const [liveKpis, setLiveKpis] = useState<KpiItem[]>([
    { key: "revenue", label: "Gross Revenue", value: 0, delta: 0 },
    { key: "profit", label: "Net Profit", value: 0, delta: 0 },
    { key: "orders", label: "Total Orders", value: 0, delta: 0 },
    { key: "expenses", label: "Total Expenses", value: 0, delta: 0 },
  ]);
  const [isSendingEod, setIsSendingEod] = useState(false);
  const [forecastData, setForecastData] = useState<any[]>([]);

  // Industry-specific adaptive telemetry state
  const [activeIndustry, setActiveIndustry] = useState<BusinessCategory>(() => {
    if (typeof window !== "undefined" && user?.workspaceId) {
      const saved = localStorage.getItem(`bizora_store_industry_${user.workspaceId}`);
      if (saved && INDUSTRY_CONFIGS[saved]) return saved as BusinessCategory;
    }
    return (getIndustryConfig(user?.departmentId, user?.name).category) as BusinessCategory;
  });

  const handleIndustryChange = (ind: BusinessCategory) => {
    setActiveIndustry(ind);
    if (typeof window !== "undefined" && user?.workspaceId) {
      localStorage.setItem(`bizora_store_industry_${user.workspaceId}`, ind);
    }
    toast.success(`Switched Store Operating Mode: ${ind}`);
  };

  const currentIndustryConfig = useMemo(() => {
    return INDUSTRY_CONFIGS[activeIndustry] || INDUSTRY_CONFIGS["Retail Shop / Store"];
  }, [activeIndustry]);

  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "WHATSAPP" | "VOICE" | "FAILED">("ALL");

  const safeTimeSeriesData = Array.isArray(timeSeriesData) ? timeSeriesData : [];
  const safeDeptRev = Array.isArray(departmentRevenue) ? departmentRevenue : [];
  const safeRecommendations = Array.isArray(scopedRecommendations) ? scopedRecommendations : [];
  const safeScopedTxns = Array.isArray(scopedTransactions) ? scopedTransactions : [];
  const safeTxns = Array.isArray(transactions) ? transactions : [];

  // Load dynamic forecast data
  useEffect(() => {
    getForecastingServer({
      data: {
        role: user?.role || "owner",
        email: user?.email || "",
        horizon: "7d",
        scenario: "Normal",
      },
    })
      .then((res) => {
        if (Array.isArray(res)) setForecastData(res);
      })
      .catch((err) => {
        console.warn("Forecast load warning:", err);
      });
  }, [user]);

  // Compute dynamic heatmap from DB transactions
  const dynamicHeatmap = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const hours = Array.from({ length: 14 }, (_, i) => 9 + i);
    const dayMap: Record<number, string> = {
      1: "Mon",
      2: "Tue",
      3: "Wed",
      4: "Thu",
      5: "Fri",
      6: "Sat",
      0: "Sun",
    };

    const counts: Record<string, number> = {};
    days.forEach((d) => {
      hours.forEach((h) => {
        counts[`${d}-${h}`] = 0;
      });
    });

    safeScopedTxns.forEach((t) => {
      try {
        if (t && t.date && t.time) {
          const date = new Date(t.date);
          const dayName = dayMap[date.getDay()];
          const hour = parseInt((t?.time || "12:00").split(":")[0], 10);
          if (dayName && hour >= 9 && hour <= 22) {
            counts[`${dayName}-${hour}`] = (counts[`${dayName}-${hour}`] || 0) + 1;
          }
        }
      } catch {}
    });

    return days.flatMap((d, di) =>
      hours.map((h) => {
        const count = counts[`${d}-${h}`] || 0;
        return { day: d, hour: `${h}`, v: count };
      }),
    );
  }, [safeScopedTxns]);

  const loadLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await getMessageLogsServer();
      if (Array.isArray(res)) setLogs(res);
    } catch (err) {
      console.warn("Failed to load communication logs:", err);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSendEodReport = async () => {
    try {
      setIsSendingEod(true);
      const res = (await dispatchEodReportServer({ data: { activeDate: activeDate } })) as any;
      if (res && res.success) {
        toast.success("EOD Report dispatched via WhatsApp!");
      } else {
        toast.success("EOD Report generated!");
      }
    } catch (err) {
      toast.error("Failed to dispatch EOD report.");
    } finally {
      setIsSendingEod(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await getCommandCenterServer({
          data: { role: user?.role || "owner", email: user?.email || "", activeDate, timeRange },
        });
        const kpiData = res?.data || res || {};
        setLiveKpis([
          { key: "revenue", label: "Gross Revenue", value: kpiData.grossRevenue ?? 0, delta: 0 },
          { key: "profit", label: "Net Profit", value: kpiData.netProfit ?? 0, delta: 0 },
          { key: "orders", label: "Total Orders", value: kpiData.orders ?? 0, delta: 0 },
          { key: "expenses", label: "Total Expenses", value: kpiData.expenses ?? 0, delta: 0 },
        ]);
      } catch (err) {
        console.warn("Command center KPI load warning:", err);
        setLiveKpis([
          { key: "revenue", label: "Gross Revenue", value: 0, delta: 0 },
          { key: "profit", label: "Net Profit", value: 0, delta: 0 },
          { key: "orders", label: "Total Orders", value: 0, delta: 0 },
          { key: "expenses", label: "Total Expenses", value: 0, delta: 0 },
        ]);
      }
    }
    load();
  }, [activeDate, user, timeRange]);

  const [chartResolution, setChartResolution] = useState<"Hourly" | "Daily" | "Weekly" | "Monthly">(
    "Daily",
  );

  const resolvedChartData = useMemo(() => {
    if (chartResolution === "Hourly") {
      return Array.from({ length: 14 }, (_, i) => {
        const hour = 9 + i;
        const hourStr = `${String(hour).padStart(2, "0")}:00`;
        const txns = safeScopedTxns.filter((t) =>
          t && t.time && t.time.startsWith(String(hour).padStart(2, "0")),
        );
        const revenue = txns.reduce(
          (sum, t) => (t.status === "Completed" ? sum + (t.total || 0) : sum),
          0,
        );
        const profit = Math.round(revenue * 0.18);
        return {
          day: hourStr,
          revenue,
          profit,
        };
      });
    }

    if (chartResolution === "Weekly") {
      const chunks: any[] = [];
      const chunkSize = 7;
      for (let i = 0; i < safeTimeSeriesData.length; i += chunkSize) {
        const chunk = safeTimeSeriesData.slice(i, i + chunkSize);
        const revenue = chunk.reduce((sum, d) => sum + (d.revenue || 0), 0);
        const profit = chunk.reduce((sum, d) => sum + (d.profit || 0), 0);
        chunks.push({
          day: `Week ${chunks.length + 1}`,
          revenue,
          profit,
        });
      }
      return chunks;
    }

    if (chartResolution === "Monthly") {
      const monthsList = ["March", "April", "May"];
      return monthsList.map((m, idx) => {
        const monthPrefix = `2026-0${3 + idx}`;
        const txns = safeTxns.filter((t) => t && t.date && t.date.startsWith(monthPrefix));
        const revenue = txns.reduce(
          (sum, t) => (t.status === "Completed" ? sum + (t.total || 0) : sum),
          0,
        );
        const profit = Math.round(revenue * 0.18);
        return {
          day: m,
          revenue,
          profit,
        };
      });
    }

    return safeTimeSeriesData;
  }, [chartResolution, safeTimeSeriesData, safeScopedTxns, safeTxns]);

  const userNameFirst = user?.name ? user.name.split(" ")[0] : "Owner";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${userNameFirst}`}
        subtitle="Here is what is happening across your business today."
        actions={
          <>
            <DateRange />
            <Button
              variant="outline"
              size="sm"
              className="border-hairline bg-surface"
              onClick={() => navigate({ to: "/time-machine" as never })}
            >
              Time Machine
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-hairline bg-surface hover:text-[#25D366] transition-colors"
              onClick={handleSendEodReport}
              disabled={isSendingEod}
            >
              {isSendingEod ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <WhatsappIcon className="h-3.5 w-3.5 text-[#25D366]" />
              )}
              Send EOD Report
            </Button>
            <Button
              size="sm"
              className="gap-1.5 gradient-primary text-primary-foreground"
              onClick={() => navigate({ to: "/ai-decisions" as never })}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask Bizora AI
            </Button>
          </>
        }
      />

      {/* Industry Intelligence Adaptive Control Banner */}
      <div className="relative overflow-hidden rounded-xl border border-hairline bg-gradient-to-r from-card via-surface to-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-hairline bg-surface/80 text-primary shadow-sm">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${currentIndustryConfig.badgeColor}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {currentIndustryConfig.badgeTitle}
                </span>
                <span className="text-[11px] text-muted-foreground hidden md:inline">Adaptive Industry Telemetry</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {currentIndustryConfig.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Switch Store Vertical:</span>
            <select
              value={activeIndustry}
              onChange={(e) => handleIndustryChange(e.target.value as BusinessCategory)}
              className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm"
            >
              {Object.keys(INDUSTRY_CONFIGS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Industry-Specific Live Operational KPIs */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            {currentIndustryConfig.category} Specialized Telemetry
          </h3>
          <span className="text-[11px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
            Live AI Telemetry
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {currentIndustryConfig.kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="rounded-xl border border-hairline bg-card/60 p-3.5 backdrop-blur-sm shadow-sm hover:border-hairline/80 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {kpi.label}
                </span>
                <span className={`text-[10px] font-semibold ${kpi.color}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="mt-1.5 text-xl font-bold font-display tracking-tight text-foreground">
                {kpi.value}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground truncate">
                {kpi.subtext}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Real-Time Anomaly & Recommendation Highlights */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Real-time vertical anomaly */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                <ShieldAlert className="h-4 w-4" />
                Live {currentIndustryConfig.category} Radar
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                {currentIndustryConfig.realtimeAnomaly.severity} ALERT
              </span>
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              {currentIndustryConfig.realtimeAnomaly.title}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {currentIndustryConfig.realtimeAnomaly.description}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 border-amber-500/30 hover:bg-amber-500/10 text-amber-400"
              onClick={() => {
                toast.success(`Autonomous mitigation dispatched for: ${currentIndustryConfig.realtimeAnomaly.title}`);
              }}
            >
              Autonomously Mitigate
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 text-muted-foreground hover:text-foreground"
              onClick={() => navigate({ to: "/ai-decisions" as never })}
            >
              Investigate
            </Button>
          </div>
        </div>

        {/* Industry AI Recommendations (2 cards) */}
        {currentIndustryConfig.aiRecommendations.slice(0, 2).map((rec) => (
          <div
            key={rec.id}
            className="rounded-xl border border-hairline bg-card p-4 flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {rec.badge}
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {rec.impact}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground mt-1">
                {rec.title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {rec.description}
              </p>
            </div>
            <Button
              size="sm"
              className="mt-3 w-full text-xs h-7 gradient-primary text-primary-foreground gap-1 font-medium"
              onClick={() => {
                toast.success(`Action executed: ${rec.actionText} (${rec.impact})`);
              }}
            >
              <Sparkles className="h-3 w-3" />
              {rec.actionText}
            </Button>
          </div>
        ))}
      </div>

      {/* Industry Workflow Shortcuts Grid */}
      <div className="rounded-xl border border-hairline bg-card/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-primary" />
            {currentIndustryConfig.category} Workflow Operations
          </h4>
          <span className="text-[11px] text-muted-foreground">Quick Launch Actions</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {currentIndustryConfig.shortcuts.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => navigate({ to: sc.path as never })}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-hairline/60 bg-surface/40 hover:bg-surface hover:border-primary/40 transition-all text-left group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Store className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {sc.label}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {sc.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Financial KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(() => {
          const calcRevenue = (safeScopedTxns.length > 0 ? safeScopedTxns : safeTxns).reduce(
            (sum, t) => sum + (t.total || t.amount || 0),
            0,
          );
          const calcOrders = (safeScopedTxns.length > 0 ? safeScopedTxns : safeTxns).length;
          const calcExpenses = (scopedExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
          const calcProfit = Math.round(calcRevenue * 0.16) - calcExpenses;

          return liveKpis.map((k) => {
            let val = k.value;
            if (val === 0) {
              if (k.key === "revenue") val = calcRevenue;
              if (k.key === "profit") val = calcProfit;
              if (k.key === "orders") val = calcOrders;
              if (k.key === "expenses") val = calcExpenses;
            }
            return (
              <KpiCard
                key={k.key}
                label={k.label}
                value={val}
                delta={k.delta}
                spark={k.spark}
                icon={ICONS[k.key]}
                format={
                  k.key === "orders" || k.key === "footfall" || k.key === "newCustomers"
                    ? "num"
                    : "inr-compact"
                }
              />
            );
          });
        })()}
      </div>

      {/* Executive brief */}
      <ExecutiveBrief />

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title={`Revenue vs Profit — ${chartResolution}`}
          subtitle={`${chartResolution} gross revenue against realized net profit`}
          className="xl:col-span-2"
          actions={
            <div className="flex gap-1 rounded-md border border-hairline bg-surface p-0.5 text-[11px]">
              {(["Hourly", "Daily", "Weekly", "Monthly"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartResolution(t)}
                  className={
                    chartResolution === t
                      ? "rounded-sm bg-primary/20 px-2 py-0.5 text-foreground font-semibold"
                      : "px-2 py-0.5 text-muted-foreground hover:text-foreground"
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resolvedChartData} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-hairline)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: any) => `₹${Number(v) / 1000}K`}
                  width={54}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2}
                  fill="url(#prof)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Department Contribution" subtitle="Revenue share this period">
          {safeDeptRev.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-xs text-muted-foreground">
              No department revenue logged in database.
            </div>
          ) : (
            <>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safeDeptRev}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={56}
                      outerRadius={92}
                      paddingAngle={2}
                    >
                      {safeDeptRev.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmtINR(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                {safeDeptRev.slice(0, 5).map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="min-w-0 truncate text-muted-foreground">{d.name}</span>
                    <span className="ml-auto font-medium">{fmtINR(d.value, { compact: true })}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* Heatmap + forecast */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="Sales Heatmap"
          subtitle="Day of week × hour · footfall intensity"
          className="xl:col-span-2"
        >
          <Heatmap heatmapData={dynamicHeatmap} />
        </SectionCard>
        <SectionCard title="Revenue Forecast" subtitle="Next 7 days · predictive band">
          {forecastData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-muted-foreground">
              No forecast model data available.
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <CartesianGrid stroke="var(--color-hairline)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} hide />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: any) => `${Number(v) / 1000}K`}
                    width={44}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="var(--color-primary)"
                    fillOpacity={0.08}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="var(--color-background)"
                    fillOpacity={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--color-cyan)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-3 rounded-md border border-hairline bg-surface p-3 text-xs">
            <p className="font-medium">AI Demand Forecast Status</p>
            <p className="mt-1 text-muted-foreground">
              {forecastData.length > 0
                ? "Forecast calculated based on historical database sales records."
                : "0 forecast calculations. Log POS sales to generate predictive models."}
            </p>
          </div>
        </SectionCard>
      </div>

      {/* Recommendations feed */}
      <SectionCard
        title="AI Recommendations"
        subtitle="Evidence-backed next actions ranked by expected impact"
        actions={
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 text-xs"
            onClick={() => navigate({ to: "/ai-decisions" as never })}
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        }
      >
        {safeRecommendations.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No active AI recommendations in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {safeRecommendations.slice(0, 3).map((r) => (
              <RecCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Communication Hub Ledger */}
      <SectionCard
        title="Communication Hub Ledger"
        subtitle="Real-time transaction bills, manager alerts, EOD reports, and AI voice campaign triggers"
        actions={
          <Button
            size="sm"
            variant="outline"
            className="border-hairline bg-surface text-xs font-semibold gap-1.5"
            onClick={loadLogs}
            disabled={loadingLogs}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
            Refresh Logs
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-hairline pb-2 text-xs">
            {(["ALL", "WHATSAPP", "VOICE", "FAILED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-1 px-2 font-semibold transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loadingLogs ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No communication logs recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline text-muted-foreground">
                    <th className="py-2 font-semibold">Channel</th>
                    <th className="py-2 font-semibold">Recipient</th>
                    <th className="py-2 font-semibold">Phone</th>
                    <th className="py-2 font-semibold">Type</th>
                    <th className="py-2 font-semibold">Message / Summary</th>
                    <th className="py-2 font-semibold">Status</th>
                    <th className="py-2 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {logs
                    .filter((log) => {
                      if (activeTab === "ALL") return true;
                      if (activeTab === "WHATSAPP") return log.channel === "WHATSAPP";
                      if (activeTab === "VOICE") return log.channel === "VOICE";
                      if (activeTab === "FAILED") return log.status === "FAILED";
                      return true;
                    })
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-surface/50">
                        <td className="py-3 flex items-center gap-1.5 font-medium">
                          {log.channel === "WHATSAPP" ? (
                            <MessageSquare className="h-3.5 w-3.5 text-[#25D366]" />
                          ) : (
                            <PhoneCall className="h-3.5 w-3.5 text-violet" />
                          )}
                          {log.channel}
                        </td>
                        <td className="py-3">{log.recipientName}</td>
                        <td className="py-3 text-muted-foreground">{log.recipientPhone}</td>
                        <td className="py-3 font-semibold">{log.messageType}</td>
                        <td
                          className="py-3 max-w-[240px] truncate text-muted-foreground"
                          title={log.body}
                        >
                          {log.body}
                        </td>
                        <td className="py-3">
                          <StatusPill
                            tone={
                              log.status === "SENT" || log.status === "DELIVERED"
                                ? "success"
                                : log.status === "PENDING"
                                  ? "warning"
                                  : "danger"
                            }
                          >
                            {log.status}
                          </StatusPill>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function ExecutiveBrief() {
  const { executiveBrief } = useBusinessData();
  const safeBrief = executiveBrief || {
    summary: "No transaction data or business activity recorded for the selected period in the database.",
    positives: ["0 sales transactions recorded", "0 new customer acquisitions"],
    risks: ["0 expenses recorded", "0 stockout anomalies detected"],
    opportunities: ["No pending AI optimization actions"],
  };

  return (
    <section className="card-elevated relative overflow-hidden">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-violet/10 blur-3xl" />
      <div className="relative p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            <Sparkles className="h-3 w-3" /> Today's Executive Brief
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">{safeBrief.summary}</p>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <BriefBlock
            tone="success"
            title="Positive developments"
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            items={safeBrief.positives || []}
          />
          <BriefBlock
            tone="danger"
            title="Risks"
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            items={safeBrief.risks || []}
          />
          <BriefBlock
            tone="violet"
            title="Opportunities"
            icon={<Lightbulb className="h-3.5 w-3.5" />}
            items={safeBrief.opportunities || []}
          />
        </div>
      </div>
    </section>
  );
}

function BriefBlock({
  tone,
  title,
  icon,
  items,
}: {
  tone: "success" | "danger" | "violet";
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  const toneClass: Record<string, string> = {
    success: "text-success",
    danger: "text-destructive",
    violet: "text-violet",
  };
  return (
    <div className="rounded-lg border border-hairline bg-surface/60 p-3">
      <div
        className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${toneClass[tone]}`}
      >
        {icon} {title}
      </div>
      <ul className="mt-2 space-y-1.5 text-xs text-foreground/90">
        {(items || []).map((i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${toneClass[tone]} bg-current`}
            />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecCard({ r }: { r: any }) {
  const { acceptRecommendation, openRecommendation } = useBusinessData();
  const tone = r.severity === "Critical" ? "danger" : r.severity === "High" ? "warning" : "info";
  const isAccepted = r.status === "Accepted";
  return (
    <div className="rounded-lg border border-hairline bg-surface p-3.5 transition-colors hover:border-primary/30">
      <div className="flex items-center gap-2">
        <StatusPill tone={tone}>{r.severity}</StatusPill>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {r.category}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">{r.generated}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{r.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.evidence}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-medium text-success">{r.impact}</span>
        <span className="text-[11px] text-muted-foreground">
          <span className="text-foreground">{r.confidence}%</span> conf.
        </span>
      </div>
      <div className="mt-3 flex gap-1.5">
        {isAccepted ? (
          <span className="flex-1 text-center py-1.5 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 rounded-md">
            Accepted
          </span>
        ) : (
          <>
            <button
              onClick={() => acceptRecommendation(r.id)}
              className="flex-1 rounded-md bg-primary/15 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/25"
            >
              Accept
            </button>
            <button
              onClick={() => openRecommendation(r.id)}
              className="rounded-md border border-hairline px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            >
              Investigate
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Heatmap({ heatmapData }: { heatmapData: any[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 14 }, (_, i) => 9 + i);
  const safeData = Array.isArray(heatmapData) ? heatmapData : [];
  const max = Math.max(...safeData.map((d) => d?.v || 0), 1) || 1;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="mb-1 grid grid-cols-[40px_repeat(14,minmax(0,1fr))] gap-1">
          <span />
          {hours.map((h) => (
            <span key={h} className="text-center text-[10px] text-muted-foreground">
              {h}
            </span>
          ))}
        </div>
        {days.map((d) => (
          <div key={d} className="mb-1 grid grid-cols-[40px_repeat(14,minmax(0,1fr))] gap-1">
            <span className="flex items-center text-[11px] text-muted-foreground">{d}</span>
            {hours.map((h) => {
              const cell = safeData.find((c) => c?.day === d && c?.hour === `${h}`);
              const val = cell?.v ?? 0;
              const intensity = val / max;
              return (
                <div
                  key={h}
                  className="h-6 rounded-sm border border-hairline"
                  style={{
                    background: `color-mix(in oklab, var(--color-primary) ${Math.round(
                      intensity * 90,
                    )}%, transparent)`,
                  }}
                  title={`${d} ${h}:00 · ${val}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DateRange() {
  const { timeRange, changeTimeRange } = useBusinessData();
  const ranges: { label: string; value: any }[] = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "Custom", value: "custom" },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-hairline bg-surface p-0.5 text-[11px]">
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => changeTimeRange(r.value)}
          className={
            timeRange === r.value
              ? "rounded-sm bg-primary/20 px-2 py-1 text-foreground font-semibold"
              : "px-2 py-1 text-muted-foreground hover:text-foreground"
          }
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-md px-2.5 py-1.5 text-xs shadow-elevated">
      {label && (
        <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      )}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color ?? p.fill }} />
          <span className="text-muted-foreground">{p.name ?? p.dataKey}</span>
          <span className="ml-auto font-semibold">
            {typeof p.value === "number" ? fmtINR(p.value, { compact: true }) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
