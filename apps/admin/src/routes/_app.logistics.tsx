import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getLogisticsDispatchesServer,
  createLogisticsDispatchServer,
  updateLogisticsStatusServer,
  type DeliveryItem,
} from "@/lib/server-logistics";
import {
  Loader2,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/_app/logistics")({
  head: () => ({
    meta: [
      { title: "Logistics & Dispatches | Bizora" },
      { name: "description", content: "Outgoing customer delivery dispatch tracking operations." },
    ],
  }),
  component: LogisticsPage,
});

export function LogisticsPage() {
  const { user } = useAuth();
  const [dispatches, setDispatches] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [destination, setDestination] = useState("");
  const [driverName, setDriverName] = useState("Vijay Yadav");
  const [vehicleNumber, setVehicleNumber] = useState("MH-12-PQ-8841");
  const [scheduling, setScheduling] = useState(false);

  const loadData = async () => {
    try {
      const res = await getLogisticsDispatchesServer({});
      setDispatches(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn("Failed to load logistics dispatches:", err);
      setDispatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !customerName || !destination) {
      toast.error("Please fill in Order #, Customer Name, and Address.");
      return;
    }
    setScheduling(true);
    try {
      await createLogisticsDispatchServer({
        data: {
          orderNumber,
          customerName,
          destination,
          driverName,
          vehicleNumber,
          itemsCount: 3,
        },
      });
      toast.success(`Dispatch scheduled for ${orderNumber}`);
      setOrderNumber("");
      setCustomerName("");
      setDestination("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule dispatch");
    } finally {
      setScheduling(false);
    }
  };

  const safeDispatches = Array.isArray(dispatches) ? dispatches : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Dispatches & Logistics"
        subtitle="Real-time 10-minute neighborhood delivery dispatches, driver assignments, and live status."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Active Delivery Dispatches">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : safeDispatches.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No active delivery dispatches. Schedule a dispatch using the form.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-hairline uppercase text-[10px] text-muted-foreground">
                      <th className="py-2.5">Order #</th>
                      <th className="py-2.5">Customer & Destination</th>
                      <th className="py-2.5">Driver & Vehicle</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {safeDispatches.map((d) => (
                      <tr key={d.id} className="hover:bg-surface/50">
                        <td className="py-3 font-mono font-semibold text-rose-400">{d.orderNumber}</td>
                        <td className="py-3">
                          <p className="font-medium text-foreground">{d.customerName}</p>
                          <p className="text-[10px] text-muted-foreground">{d.destination}</p>
                        </td>
                        <td className="py-3">
                          <p className="font-medium">{d.driverName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{d.vehicleNumber}</p>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Schedule New Dispatch">
            <form onSubmit={handleCreateDispatch} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label>Order Number *</Label>
                <Input
                  placeholder="e.g. ORD-9941"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="h-8 text-xs bg-surface border-hairline"
                />
              </div>
              <div className="space-y-1">
                <Label>Customer Name *</Label>
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-8 text-xs bg-surface border-hairline"
                />
              </div>
              <div className="space-y-1">
                <Label>Delivery Address *</Label>
                <Input
                  placeholder="e.g. Bandra West, Mumbai"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="h-8 text-xs bg-surface border-hairline"
                />
              </div>
              <div className="space-y-1">
                <Label>Assigned Driver</Label>
                <Input
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="h-8 text-xs bg-surface border-hairline"
                />
              </div>
              <div className="space-y-1">
                <Label>Vehicle Number</Label>
                <Input
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="h-8 text-xs bg-surface border-hairline font-mono"
                />
              </div>
              <Button type="submit" disabled={scheduling} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold">
                {scheduling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Dispatch Order
              </Button>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
