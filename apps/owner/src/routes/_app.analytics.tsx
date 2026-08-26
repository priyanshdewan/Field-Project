import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/page-header";
import { useBusinessData } from "@/lib/business-context";
import { Sparkles } from "lucide-react";
import { fmtINR, fmtNum } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics | Bizora" },
      {
        name: "description",
        content: "Cross-domain analytics across revenue, customers, and operations.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { transactions } = useBusinessData();
  const txns = Array.isArray(transactions) ? transactions : [];

  const totalSales = txns.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalOrders = txns.length;
  const aov = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Group by department
  const deptsMap: Record<string, number> = {};
  txns.forEach((t) => {
    const dept = t.dept || "General";
    deptsMap[dept] = (deptsMap[dept] || 0) + (t.total || 0);
  });

  const topDepts = Object.entries(deptsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Channel split computation
  const channelMap: Record<string, number> = {};
  txns.forEach((t) => {
    const channel = t.paymentMethod || "Store POS";
    channelMap[channel] = (channelMap[channel] || 0) + 1;
  });

  const aiNote =
    totalOrders > 0
      ? `Total sales of ${fmtINR(totalSales)} recorded across ${totalOrders} orders (AOV: ${fmtINR(aov)}). ${
          topDepts.length > 0 ? `${topDepts[0][0]} is the leading department by revenue.` : ""
        }`
      : "No transaction records found in database. Connect your POS or process sales in the Billing tab to generate live cross-domain analytics.";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Cohort Intelligence"
        subtitle="Cross-domain analytics across sales, customers, inventory, and operations."
      />

      {/* AI Insight Card */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Sparkles className="h-4 w-4" />
          <span>AI Insight</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{aiNote}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SectionCard title="Department Revenue Split" subtitle="Live sales distribution by category">
          {topDepts.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No category sales recorded.</p>
          ) : (
            <div className="space-y-3 text-xs">
              {topDepts.map(([dept, amt]) => {
                const pct = totalSales > 0 ? ((amt / totalSales) * 100).toFixed(1) : "0";
                return (
                  <div key={dept} className="flex justify-between items-center p-2 rounded border border-hairline bg-surface">
                    <span className="font-semibold">{dept}</span>
                    <span className="font-mono text-muted-foreground">{fmtINR(amt)} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Basket & AOV Metrics" subtitle="Average basket values and customer volume">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2 rounded border border-hairline bg-surface">
              <span>Total Orders</span>
              <span className="font-mono font-semibold">{fmtNum(totalOrders)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded border border-hairline bg-surface">
              <span>Average Order Value</span>
              <span className="font-mono font-semibold">{fmtINR(aov)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded border border-hairline bg-surface">
              <span>Total Gross Sales</span>
              <span className="font-mono font-semibold">{fmtINR(totalSales)}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Payment & Channel Split" subtitle="Distribution by checkout method">
          {Object.keys(channelMap).length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No channel data recorded.</p>
          ) : (
            <div className="space-y-3 text-xs">
              {Object.entries(channelMap).map(([ch, cnt]) => {
                const pct = totalOrders > 0 ? ((cnt / totalOrders) * 100).toFixed(1) : "0";
                return (
                  <div key={ch} className="flex justify-between items-center p-2 rounded border border-hairline bg-surface">
                    <span className="font-semibold">{ch}</span>
                    <span className="font-mono text-muted-foreground">{cnt} orders ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
