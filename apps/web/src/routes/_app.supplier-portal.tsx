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

  // Mock statistics for the active supplier (e.g. Amul Foods Ltd)
  const stats = useMemo(() => ({
    pendingOrdersCount: 2,
    activeDeliveriesCount: 1,
    totalSpendReceived: 4820000,
    qualityRating: 94, // %
  }), []);

  // Inbound POs
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: "PO-40019",
      productName: 'Samsung 55" QLED TV',
      quantity: 6,
      totalCost: 349200,
      status: "Sent",
      date: "2026-05-02"
    },
    {
      id: "PO-40021",
      productName: "Sony WH-1000XM5",
      quantity: 8,
      totalCost: 179200,
      status: "Sent",
      date: "2026-05-04"
    },
    {
      id: "PO-40020",
      productName: "Nike Air Zoom Pegasus",
      quantity: 15,
      totalCost: 78000,
      status: "Received",
      date: "2026-05-03"
    }
  ]);

  // Active shipments
  const shipments = useMemo(() => [
    {
      id: "del-01",
      orderId: "PO-40019",
      status: "IN_TRANSIT",
      origin: "Mumbai Warehouse",
      destination: "GrandSquare Mall Pune",
      eta: "2026-05-06T18:00:00.000Z",
      routeDetails: "Delayed at Toll Plaza, NH48"
    },
    {
      id: "del-02",
      orderId: "PO-40020",
      status: "DELIVERED",
      origin: "Delhi Hub",
      destination: "GrandSquare Mall Pune",
      eta: "2026-05-03T12:00:00.000Z",
      routeDetails: "Delivered & Signed by Store Mgr"
    }
  ], []);

  const handleActionOrder = (poId: string, action: "Accept" | "Reject") => {
    setPurchaseOrders((prev) =>
      prev.map((po) =>
        po.id === poId
          ? { ...po, status: action === "Accept" ? "Received" : "Cancelled" }
          : po
      )
    );
    toast.success(`Purchase order ${poId} has been successfully ${action}ed.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Supplier Portal — ${user?.name || "Amul Foods Ltd"}`}
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
          value={purchaseOrders.filter((po) => po.status === "Sent").length}
          icon={<FileText className="h-4 w-4" />}
          trend={{ value: 1, isPositive: false }}
        />
        <KpiCard
          label="Active Shipments"
          value={stats.activeDeliveriesCount}
          icon={<Truck className="h-4 w-4" />}
          trend={{ value: 0, isPositive: true }}
        />
        <KpiCard
          label="Total Settlement spend"
          value={stats.totalSpendReceived}
          icon={<CreditCard className="h-4 w-4" />}
          trend={{ value: 5.8, isPositive: true }}
          format="currency"
        />
        <KpiCard
          label="Quality Score"
          value={stats.qualityRating}
          icon={<ShieldCheck className="h-4 w-4 text-green-500" />}
          trend={{ value: 1.2, isPositive: true }}
          format="percent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* POs Management */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Inbound Purchase Orders" subtitle="Accept or reject corporate purchase requests">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50">
                  <tr>
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Total Cost</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs">{po.id}</td>
                      <td className="p-3">{po.date}</td>
                      <td className="p-3 font-semibold">{po.productName}</td>
                      <td className="p-3 text-center">{po.quantity}</td>
                      <td className="p-3 text-right font-medium">{po.totalCost.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</td>
                      <td className="p-3 text-center">
                        {po.status === "Sent" ? (
                          <div className="flex gap-2 justify-center">
                            <Button
                              onClick={() => handleActionOrder(po.id, "Accept")}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-xs px-2 h-7"
                            >
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleActionOrder(po.id, "Reject")}
                              size="sm"
                              variant="destructive"
                              className="text-xs px-2 h-7"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <StatusPill status={po.status === "Received" ? "ok" : "critical"} label={po.status} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Logistics Dispatches" subtitle="Monitor active delivery routes and ETAs">
            <div className="space-y-4">
              {shipments.map((s) => (
                <div key={s.id} className="p-4 border rounded-md hover:bg-muted/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Delivery ID: <span className="font-mono text-xs">{s.id}</span></span>
                    <StatusPill status={s.status === "DELIVERED" ? "ok" : "warn"} label={s.status.replace("_", " ")} />
                  </div>
                  <div className="grid grid-cols-2 text-xs text-muted-foreground">
                    <div>Origin: <span className="text-foreground font-medium">{s.origin}</span></div>
                    <div>Destination: <span className="text-foreground font-medium">{s.destination}</span></div>
                    <div>ETA: <span className="text-foreground font-medium">{(typeof s.eta === "string" ? (s.eta || "2026-07-27").split("T")[0] : "2026-07-27")}</span></div>
                    <div>Details: <span className="text-foreground font-medium">{s.routeDetails}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* AI Recommendations & Performance */}
        <div className="space-y-6">
          <SectionCard title="AI Fulfillment Advisor" subtitle="Optimization recommendations for suppliers">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Inventory Alert Recommendation</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Samsung India electronics stock at GrandSquare Mall has dropped below safety limits. We recommend prioritizing PO-40019 packaging to secure an extra **5% on-time fulfillment bonus**.
              </p>
              <Button size="sm" className="w-full text-xs">
                Accept Priority Packing
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Supplier Scorecard" subtitle="Performance metrics compiled by Bizora AI">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span>On-Time Delivery</span>
                <span className="font-semibold text-green-500">96.4%</span>
              </div>
              <div className="flex justify-between">
                <span>Quality Compliance</span>
                <span className="font-semibold text-green-500">98.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Average Lead Time</span>
                <span className="font-semibold">2.1 Days</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Level</span>
                <span className="font-semibold text-green-500">Low Risk</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
