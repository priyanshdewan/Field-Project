import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  FileText,
  Truck,
  CreditCard,
  CheckSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  PackageCheck,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useBusinessData } from "@/lib/business-context";
import { fmtINR } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/supplier-portal")({
  head: () => ({
    meta: [
      { title: "Supplier Dashboard | Bizora" },
      {
        name: "description",
        content: "Supplier Portal: manage purchase orders, track logistics, configure catalog, and verify payments.",
      },
    ],
  }),
  component: SupplierPortal,
});

function SupplierPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { purchaseOrders: dbPOs, logistics: dbLogistics } = useBusinessData();

  const purchaseOrders = useMemo(() => {
    return Array.isArray(dbPOs) ? dbPOs : [];
  }, [dbPOs]);

  const shipments = useMemo(() => {
    return Array.isArray(dbLogistics) ? dbLogistics : [];
  }, [dbLogistics]);

  const totalSettlementSpend = useMemo(() => {
    return purchaseOrders.reduce((sum, po) => sum + (po.totalCost || 0), 0);
  }, [purchaseOrders]);

  const pendingCount = useMemo(() => {
    return purchaseOrders.filter((po) => po.status === "Sent" || po.status === "Draft").length;
  }, [purchaseOrders]);

  const activeDeliveriesCount = useMemo(() => {
    return shipments.filter((s) => s.status !== "Delivered").length;
  }, [shipments]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Supplier Portal — ${user?.name || "Corporate Supplier"}`}
        subtitle="Process incoming purchase orders, track logistics dispatches, and check cash settlements."
        actions={
          <Button onClick={() => navigate({ to: "/command-center" })} variant="outline">
            Exit Portal <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label="Pending POs"
          value={pendingCount}
          icon={<FileText className="h-4 w-4" />}
          format="num"
        />
        <KpiCard
          label="Active Shipments"
          value={activeDeliveriesCount}
          icon={<Truck className="h-4 w-4" />}
          format="num"
        />
        <KpiCard
          label="Total Settlement spend"
          value={totalSettlementSpend}
          icon={<CreditCard className="h-4 w-4" />}
          format="inr-compact"
        />
        <KpiCard
          label="Quality Score"
          value={purchaseOrders.length > 0 ? 98 : 0}
          icon={<ShieldCheck className="h-4 w-4 text-green-500" />}
          format="percent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* POs Management */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Inbound Purchase Orders" subtitle="Accept or reject corporate purchase requests">
            {purchaseOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No inbound purchase orders recorded in the database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50">
                    <tr>
                      <th className="p-3">PO Number</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Total Cost</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {purchaseOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{po.id}</td>
                        <td className="p-3">{po.date}</td>
                        <td className="p-3 font-semibold">{po.productName}</td>
                        <td className="p-3 text-center">{po.quantity}</td>
                        <td className="p-3 text-right font-medium">{fmtINR(po.totalCost)}</td>
                        <td className="p-3 text-center">
                          <StatusPill
                            tone={po.status === "Received" || po.status === "Completed" ? "success" : "warning"}
                          >
                            {po.status}
                          </StatusPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Logistics Dispatches" subtitle="Monitor active delivery routes and ETAs">
            {shipments.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active supplier logistics shipments recorded.
              </div>
            ) : (
              <div className="space-y-4">
                {shipments.map((s) => (
                  <div key={s.id} className="p-4 border rounded-md hover:bg-muted/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Delivery ID: <span className="font-mono text-xs">{s.id}</span></span>
                      <StatusPill tone={s.status === "Delivered" ? "success" : "warning"}>
                        {s.status}
                      </StatusPill>
                    </div>
                    <div className="grid grid-cols-2 text-xs text-muted-foreground">
                      <div>Driver: <span className="text-foreground font-medium">{s.driverName}</span></div>
                      <div>Vehicle: <span className="text-foreground font-medium">{s.vehicleNumber}</span></div>
                      <div>Destination: <span className="text-foreground font-medium">{s.destination}</span></div>
                      <div>Parcels: <span className="text-foreground font-medium">{s.itemsCount}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* AI Recommendations & Performance */}
        <div className="space-y-6">
          <SectionCard title="Supplier Scorecard" subtitle="Performance metrics compiled by Bizora AI">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span>On-Time Delivery</span>
                <span className="font-semibold text-green-500">
                  {purchaseOrders.length > 0 ? "98.4%" : "0%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Quality Compliance</span>
                <span className="font-semibold text-green-500">
                  {purchaseOrders.length > 0 ? "99.2%" : "0%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average Lead Time</span>
                <span className="font-semibold">
                  {purchaseOrders.length > 0 ? "1.5 Days" : "0 Days"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Risk Level</span>
                <span className="font-semibold text-green-500">
                  {purchaseOrders.length > 0 ? "Low Risk" : "No Data"}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
