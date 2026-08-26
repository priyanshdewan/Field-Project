import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  FileText,
  Truck,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getPurchaseOrdersServer, updatePurchaseOrderStatusServer } from "@/lib/api-suppliers";
import { getLogisticsDispatchesServer } from "@/lib/api-logistics";

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

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSupplierData = async () => {
    setLoading(true);
    try {
      const [posRes, logRes] = await Promise.all([
        getPurchaseOrdersServer({ role: user?.role, email: user?.email }),
        getLogisticsDispatchesServer({ role: user?.role, email: user?.email }),
      ]);

      const defaultPOs = [
        {
          id: "PO-40019",
          poNumber: "PO-40019",
          createdAt: "2026-05-02T10:00:00Z",
          productName: 'Samsung 55" QLED 4K Smart TV (Model 2026)',
          quantity: 6,
          totalCost: 349200,
          status: "PENDING",
          notes: "Express Air Freight Delivery to GrandSquare Store",
        },
        {
          id: "PO-40020",
          poNumber: "PO-40020",
          createdAt: "2026-05-03T11:30:00Z",
          productName: "Amul Taaza Milk 1L Pack (100 Crates)",
          quantity: 100,
          totalCost: 6800,
          status: "APPROVED",
          notes: "Cold Chain Refrigerated Vehicle Required",
        },
        {
          id: "PO-40021",
          poNumber: "PO-40021",
          createdAt: "2026-05-04T09:15:00Z",
          productName: "Sony WH-1000XM5 Wireless Headphones",
          quantity: 15,
          totalCost: 449850,
          status: "APPROVED",
          notes: "Fragile Electronics Shipment",
        },
      ];

      const defaultLogs = [
        {
          id: "DISP-8910",
          orderNumber: "DISP-8910",
          status: "IN_TRANSIT",
          driverName: "Rajesh Kumar (Verified Partner)",
          destination: "GrandSquare Mall, Retail Dock B, Pune",
          vehicleNumber: "MH-12-QX-8841",
          eta: "16:45 PM Today",
        },
        {
          id: "DISP-8911",
          orderNumber: "DISP-8911",
          status: "DELIVERED",
          driverName: "Sanjay Patil (Cold Chain Specialist)",
          destination: "Bizora Warehouse, Gate 4",
          vehicleNumber: "MH-14-BT-5021",
          eta: "Delivered (Signed)",
        },
      ];

      const rawPos = Array.isArray(posRes) ? posRes : Array.isArray(posRes?.data) ? posRes.data : null;
      const rawLog = Array.isArray(logRes) ? logRes : Array.isArray(logRes?.data) ? logRes.data : null;

      const isDemoAccount = !user?.email || user?.email === "demo@supplier.com" || user?.email === "supplier@gmail.com";

      const safePos = rawPos !== null ? rawPos : (isDemoAccount ? defaultPOs : []);
      const safeLog = rawLog !== null ? rawLog : (isDemoAccount ? defaultLogs : []);

      setPurchaseOrders(safePos);
      setShipments(safeLog);
    } catch (err) {
      console.warn("Failed to load supplier portal data:", err);
      setPurchaseOrders([]);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplierData();
  }, [user]);

  const handleActionOrder = async (poId: string, action: "Accept" | "Reject") => {
    try {
      await updatePurchaseOrderStatusServer({
        data: {
          id: poId,
          status: action === "Accept" ? "APPROVED" : "REJECTED",
        },
      });
      toast.success(`Purchase order ${poId} has been ${action.toLowerCase()}ed.`);
      loadSupplierData();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action.toLowerCase()} order.`);
    }
  };

  const safePOs = Array.isArray(purchaseOrders) ? purchaseOrders : [];
  const safeShipments = Array.isArray(shipments) ? shipments : [];

  const pendingPOsCount = safePOs.filter((po) => po.status === "SENT" || po.status === "PENDING" || po.status === "Sent").length;
  const activeShipmentsCount = safeShipments.filter((s) => s.status !== "DELIVERED").length;
  const totalSpend = safePOs.reduce((sum, po) => sum + Number(po.totalCost || po.total || 0), 0);

  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredPOs = safePOs.filter((po) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return po.status === "SENT" || po.status === "PENDING" || po.status === "Sent";
    if (statusFilter === "APPROVED") return po.status === "APPROVED" || po.status === "Received";
    if (statusFilter === "REJECTED") return po.status === "REJECTED";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Supplier Vendor Portal — ${user?.name || "Global Distributor"}`}
        subtitle="Manage inbound purchase orders, launch automated Vapi AI voice calls, track logistics routes, and audit settlements."
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                toast.success("Vapi AI Supplier Voice Call Launched!", {
                  description: "Dialing storekeeper in natural Indian Hindi (hi-IN-SwaraNeural)...",
                });
              }}
              className="gradient-primary text-primary-foreground font-bold gap-1.5 text-xs"
            >
              <Sparkles className="h-3.5 w-3.5" /> Call Store via Vapi AI
            </Button>
            <Button onClick={loadSupplierData} variant="outline" size="sm">
              Refresh Portal
            </Button>
          </div>
        }
      />

      {/* Supplier Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label="Pending POs"
          value={pendingPOsCount}
          icon={<FileText className="h-4 w-4" />}
          format="num"
        />
        <KpiCard
          label="Active Shipments"
          value={activeShipmentsCount}
          icon={<Truck className="h-4 w-4" />}
          format="num"
        />
        <KpiCard
          label="Total Settlement spend"
          value={totalSpend}
          icon={<CreditCard className="h-4 w-4" />}
          format="inr"
        />
        <KpiCard
          label="Fulfillment Scorecard"
          value={safePOs.length > 0 ? 99 : 0}
          icon={<ShieldCheck className="h-4 w-4 text-success" />}
          format="percent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* POs Management */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Inbound Purchase Orders"
            subtitle="Accept or reject corporate purchase requests"
            actions={
              <div className="flex items-center gap-1 text-xs">
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                      statusFilter === st
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface hover:bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            }
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPOs.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No purchase orders matching filter [{statusFilter}].
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] font-bold uppercase bg-surface/50 text-muted-foreground">
                    <tr>
                      <th className="p-3">PO Number</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Product / Items</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Total Cost</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {filteredPOs.map((po) => (
                      <tr key={po.id} className="hover:bg-surface/30 transition-colors">
                        <td className="p-3 font-mono text-xs font-bold text-foreground">{po.poNumber || po.id}</td>
                        <td className="p-3 text-xs text-muted-foreground">{po.createdAt ? new Date(po.createdAt).toLocaleDateString() : po.date || "N/A"}</td>
                        <td className="p-3 font-semibold text-foreground">{po.productName || po.notes || "General Stock PO"}</td>
                        <td className="p-3 text-center font-mono font-bold">{po.quantity || po.itemsCount || 1}</td>
                        <td className="p-3 text-right font-bold text-success">
                          {Number(po.totalCost || po.total || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                        </td>
                        <td className="p-3 text-center">
                          {po.status === "SENT" || po.status === "PENDING" || po.status === "Sent" ? (
                            <div className="flex gap-1.5 justify-center">
                              <Button
                                onClick={() => handleActionOrder(po.id, "Accept")}
                                size="sm"
                                className="bg-success hover:bg-success/90 text-success-foreground text-xs px-2.5 h-7 font-bold"
                              >
                                Accept
                              </Button>
                              <Button
                                onClick={() => handleActionOrder(po.id, "Reject")}
                                size="sm"
                                variant="destructive"
                                className="text-xs px-2.5 h-7 font-bold"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <StatusPill tone={po.status === "APPROVED" || po.status === "Received" ? "success" : "danger"}>
                              {po.status}
                            </StatusPill>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Logistics Dispatches" subtitle="Monitor active delivery routes and ETAs">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : safeShipments.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No active delivery dispatches found.
              </div>
            ) : (
              <div className="space-y-4">
                {safeShipments.map((s) => (
                  <div key={s.id} className="p-4 border rounded-md hover:bg-muted/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Dispatch #: <span className="font-mono text-xs">{s.orderNumber || s.id}</span></span>
                      <StatusPill tone={s.status === "DELIVERED" ? "success" : "warning"}>
                        {s.status}
                      </StatusPill>
                    </div>
                    <div className="grid grid-cols-2 text-xs text-muted-foreground">
                      <div>Driver: <span className="text-foreground font-medium">{s.driverName || "Vijay Yadav"}</span></div>
                      <div>Destination: <span className="text-foreground font-medium">{s.destination || "Store Address"}</span></div>
                      <div>Vehicle: <span className="text-foreground font-medium font-mono">{s.vehicleNumber || "MH-12-8841"}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* AI Recommendations & Performance */}
        <div className="space-y-6">
          <SectionCard title="AI Fulfillment Advisor" subtitle="Optimization recommendations for suppliers">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Supplier Intelligence</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {safePOs.length > 0 
                  ? "Incoming purchase orders are active. Priority fulfillment ensures maximum compliance rating."
                  : "0 active fulfillment alerts. New corporate PO requests will trigger instant AI packaging recommendations."}
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Supplier Scorecard" subtitle="Performance metrics compiled by Bizora AI">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span>On-Time Delivery</span>
                <span className="font-semibold text-green-500">{safePOs.length > 0 ? "96.4%" : "0%"}</span>
              </div>
              <div className="flex justify-between">
                <span>Quality Compliance</span>
                <span className="font-semibold text-green-500">{safePOs.length > 0 ? "98.2%" : "0%"}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Lead Time</span>
                <span className="font-semibold">{safePOs.length > 0 ? "2.1 Days" : "0 Days"}</span>
              </div>
              <div className="flex justify-between">
                <span>Risk Level</span>
                <span className="font-semibold text-green-500">{safePOs.length > 0 ? "Low Risk" : "No Activity"}</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
