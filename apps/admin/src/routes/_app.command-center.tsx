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
} from "lucide-react";
import { toast } from "sonner";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FORECAST, fmtINR } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { useBusinessData, type KpiItem } from "@/lib/business-context";
import { getCommandCenterServer, dispatchEodReportServer, getForecastingServer } from "@/lib/server-analytics";
import { getMessageLogsServer } from "@/lib/server-whatsapp-logs";

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

export function CommandCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const greeting = greetingFor(new Date("2026-07-27T12:00:00.000Z"));

  const {
    timeSeriesData,
    departmentRevenue,
    scopedRecommendations,
    scopedTransactions,
    transactions,
    activeDate,
    timeRange,
  } = useBusinessData();

  const [liveKpis, setLiveKpis] = useState<KpiItem[]>([]);
  const [isSendingEod, setIsSendingEod] = useState(false);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const safeTimeSeriesData = Array.isArray(timeSeriesData) ? timeSeriesData : [];
  const safeDeptRev = Array.isArray(departmentRevenue) ? departmentRevenue : [];
  const safeRecommendations = Array.isArray(scopedRecommendations) ? scopedRecommendations : [];
  const safeScopedTxns = Array.isArray(scopedTransactions) ? scopedTransactions : [];

  useEffect(() => {
    getForecastingServer({
      data: {
        role: user?.role || "admin",
        email: user?.email || "",
        horizon: "7d",
        scenario: "Normal",
      },
    })
      .then((res) => {
        if (Array.isArray(res)) setForecastData(res);
      })
      .catch((err) => console.warn(err));
  }, [user]);

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
        const peak = h >= 18 && h <= 21 ? 2.2 : h >= 12 && h <= 14 ? 1.5 : 1;
        const weekend = di >= 5 ? 1.8 : 1;
        const baseline = Math.round(10 + (di * 2 + h) * 0.5 * peak * weekend);
        return { day: d, hour: `${h}`, v: baseline + count * 8 };
      }),
    );
  }, [safeScopedTxns]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getCommandCenterServer({
          data: { role: user?.role || "admin", email: user?.email || "", activeDate, timeRange },
        });
        setLiveKpis([
          { key: "revenue", label: "Gross Revenue", value: res?.grossRevenue || 0, delta: 8.4 },
          { key: "profit", label: "Net Profit", value: res?.netProfit || 0, delta: 4.1 },
          { key: "orders", label: "Total Orders", value: res?.orders || 0, delta: 6.2 },
          { key: "expenses", label: "Total Expenses", value: res?.expenses || 0, delta: 5.4 },
        ]);
      } catch (err) {
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

  const userNameFirst = user?.name ? user.name.split(" ")[0] : "Admin";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${userNameFirst}`}
        subtitle="Platform System Admin Command Center."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {liveKpis.map((k) => (
          <KpiCard
            key={k.key}
            label={k.label}
            value={k.value}
            delta={k.delta}
            spark={k.spark}
            icon={ICONS[k.key]}
            format={k.key === "orders" ? "num" : "inr-compact"}
          />
        ))}
      </div>

      <SectionCard title="Sales Heatmap" subtitle="Day of week × hour · footfall intensity">
        <Heatmap heatmapData={dynamicHeatmap} />
      </SectionCard>
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

function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
