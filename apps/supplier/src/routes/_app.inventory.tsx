import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { useBusinessData } from "@/lib/business-context";
import { useAuth } from "@/lib/auth-context";
import { fmtINR, fmtNum } from "@/lib/mock-data";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  ArrowLeftRight,
  History,
  Plus,
  Minus,
  Settings,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getInventoryStockServer,
  mutateInventoryServer,
  getInventoryMovementsServer,
  type StockListItem,
  type MovementHistoryItem,
} from "@/lib/server-inventory";
import { getProductsServer, type ProductListItem } from "@/lib/server-products";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/inventory")({
  head: () => ({
    meta: [
      { title: "Supplied Products | Bizora" },
      {
        name: "description",
        content: "Supplied products inventory, stock levels, and ledger history.",
      },
    ],
  }),
  component: Inventory,
});

function Inventory() {
  const { openProduct360 } = useBusinessData();
  const { user } = useAuth();

  // Stock and movement states
  const [stockList, setStockList] = useState<StockListItem[]>([]);
  const [productList, setProductList] = useState<ProductListItem[]>([]);
  const [movements, setMovements] = useState<MovementHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog forms state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mutationType, setMutationType] = useState<"ADD" | "REMOVE" | "TRANSFER" | "ADJUST">("ADD");
  const [saving, setSaving] = useState(false);

  // Form values
  const [formProductId, setFormProductId] = useState("");
  const [formLocationId, setFormLocationId] = useState("loc-warehouse");
  const [formTargetLocationId, setFormTargetLocationId] = useState("loc-retail");
  const [formQty, setFormQty] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formMovementSubtype, setFormMovementSubtype] = useState<
    "PURCHASE_RECEIPT" | "RETURN" | "DAMAGE" | "EXPIRED" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT"
  >("PURCHASE_RECEIPT");

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const payload = {
        data: {
          role: user?.role || "supplier",
          email: user?.email || "",
        },
      };
      const stocks = await getInventoryStockServer(payload);
      const prods = await getProductsServer(payload);
      const mvs = await getInventoryMovementsServer(payload);

      const safeStocks = Array.isArray(stocks) ? stocks : [];
      const safeProds = Array.isArray(prods) ? prods : [];
      const safeMvs = Array.isArray(mvs) ? mvs : [];

      setStockList(safeStocks);
      setProductList(safeProds);
      setMovements(safeMvs);

      if (safeProds.length > 0) {
        setFormProductId(safeProds[0].id);
      }
    } catch (e) {
      console.warn("Failed to load inventory data:", e);
      setStockList([]);
      setProductList([]);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, [user]);

  const handleInventoryMutation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductId || !formQty) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      let movementType: any = "PURCHASE_RECEIPT";
      if (mutationType === "TRANSFER") {
        movementType = "TRANSFER";
      } else if (mutationType === "ADD") {
        movementType = formMovementSubtype;
      } else if (mutationType === "REMOVE") {
        movementType = formMovementSubtype;
      } else if (mutationType === "ADJUST") {
        movementType = formMovementSubtype;
      }

      await mutateInventoryServer({
        data: {
          productId: formProductId,
          locationId: formLocationId,
          targetLocationId: mutationType === "TRANSFER" ? formTargetLocationId : undefined,
          movementType,
          quantity: Number(formQty),
          reason: formReason || undefined,
          role: user?.role || "supplier",
          emailUser: user?.email || "",
        },
      });

      toast.success("Inventory ledger updated successfully.");
      setDialogOpen(false);
      setFormQty("");
      setFormReason("");
      loadInventoryData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update inventory.");
    } finally {
      setSaving(false);
    }
  };

  const openMutationDialog = (type: "ADD" | "REMOVE" | "TRANSFER" | "ADJUST") => {
    setMutationType(type);
    setFormLocationId("loc-warehouse");
    setFormTargetLocationId("loc-retail");

    if (type === "ADD") setFormMovementSubtype("PURCHASE_RECEIPT");
    else if (type === "REMOVE") setFormMovementSubtype("DAMAGE");
    else if (type === "ADJUST") setFormMovementSubtype("ADJUSTMENT_IN");

    setDialogOpen(true);
  };

  const safeStockList = Array.isArray(stockList) ? stockList : [];
  const safeProductList = Array.isArray(productList) ? productList : [];
  const safeMovements = Array.isArray(movements) ? movements : [];

  const totalSKUs = safeStockList.length;
  const totalValue = safeStockList.reduce((sum, s) => {
    const prod = safeProductList.find((p) => p.id === s.productId);
    const cost = prod ? prod.cost : 100;
    return sum + s.totalQty * cost;
  }, 0);

  const lowStockProducts = safeStockList.filter((s) => s.status === "Low Stock");
  const stockoutProducts = safeStockList.filter((s) => s.status === "Stockout");
  const overstockProducts = safeStockList.filter((s) => s.totalQty > s.reorderLevel * 2.5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Supplied Products Inventory"
          subtitle="Real-time catalog stock levels, warehouse availability, and audit movements."
        />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => openMutationDialog("ADD")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Stock In
          </Button>
          <Button
            size="sm"
            onClick={() => openMutationDialog("REMOVE")}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
          >
            <Minus className="h-3.5 w-3.5" /> Stock Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Supplied SKUs" v={fmtNum(totalSKUs)} />
        <Kpi label="Total Stock Value" v={fmtINR(totalValue, { compact: true })} />
        <Kpi
          label="Low Stock SKUs"
          v={fmtNum(lowStockProducts.length)}
          tone={lowStockProducts.length > 0 ? "warning" : undefined}
        />
        <Kpi
          label="Stockouts"
          v={fmtNum(stockoutProducts.length)}
          tone={stockoutProducts.length > 0 ? "danger" : undefined}
        />
      </div>

      <SectionCard title="Supplied Products Inventory Catalog">
        <div className="overflow-x-auto min-h-[250px] relative text-xs">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-sidebar/50">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : safeStockList.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No supplied product inventory records found in database.
            </div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-hairline pb-2">
                  <th className="pb-2 font-medium">SKU / Product</th>
                  <th className="pb-2 text-right font-medium">Warehouse Qty</th>
                  <th className="pb-2 text-right font-medium">Retail Floor Qty</th>
                  <th className="pb-2 text-right font-medium">Total Qty</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {safeStockList.map((s) => (
                  <tr key={s.productId} className="hover:bg-surface/30">
                    <td className="py-2.5">
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.sku}</p>
                    </td>
                    <td className="py-2.5 text-right font-mono">{fmtNum(s.warehouseQty)}</td>
                    <td className="py-2.5 text-right font-mono">{fmtNum(s.retailQty)}</td>
                    <td className="py-2.5 text-right font-bold font-mono">{fmtNum(s.totalQty)}</td>
                    <td className="py-2.5">
                      <StatusPill
                        tone={
                          s.status === "Stockout"
                            ? "danger"
                            : s.status === "Low Stock"
                              ? "warning"
                              : "success"
                        }
                      >
                        {s.status}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </SectionCard>

      {/* Stock Mutation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-sidebar border border-hairline text-foreground">
          <DialogHeader>
            <DialogTitle>
              {mutationType === "ADD" && "Receive Stock (Stock In)"}
              {mutationType === "REMOVE" && "Deduct Stock (Stock Out)"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInventoryMutation} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label>Select Product SKU *</Label>
              <Select value={formProductId} onValueChange={setFormProductId}>
                <SelectTrigger className="bg-surface border-hairline h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-hairline text-xs">
                  {safeProductList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Quantity *</Label>
              <Input
                required
                type="number"
                min="1"
                placeholder="e.g. 50"
                className="bg-surface border-hairline h-8 text-xs"
                value={formQty}
                onChange={(e) => setFormQty(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Process Mutation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kpi({ label, v, tone }: { label: string; v: string; tone?: "warning" | "danger" }) {
  return (
    <div className="card-elevated p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-display text-lg font-semibold",
          tone === "danger" && "text-destructive",
          tone === "warning" && "text-warning",
        )}
      >
        {v}
      </p>
    </div>
  );
}
