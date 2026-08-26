import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { useBusinessData } from "@/lib/business-context";
import { useAuth } from "@/lib/auth-context";
import { fmtINR } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import {
  getPurchaseOrders,
  receivePurchaseOrderGoodsServer,
  updatePurchaseOrderStatusServer,
  createPurchaseOrder,
  getSuppliers,
} from "@/lib/server-suppliers";
import { getProductsServer } from "@/lib/server-products";
import { payPurchaseOrderServer } from "@/lib/server-accounts";
import { toast } from "sonner";
import { Loader2, Check, Plus, Trash2, Eye, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/purchase-orders")({
  validateSearch: (search: Record<string, unknown>): { supplier?: string } => {
    return {
      supplier: search.supplier as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Purchase Orders | Bizora" },
      {
        name: "description",
        content: "Open purchase orders, delivery status, and supplier commitments.",
      },
    ],
  }),
  component: PurchaseOrders,
});

function PurchaseOrders() {
  const { openProduct360, openSupplier360 } = useBusinessData();
  const { user } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // PO Creation State
  const [createOpen, setCreateOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selSupplier, setSelSupplier] = useState<string>("");
  const [poItems, setPoItems] = useState<
    Array<{ productId: string; quantity: number; unitCost: number }>
  >([]);
  const [poNotes, setPoNotes] = useState("");
  const [savingPo, setSavingPo] = useState(false);

  // Receiving State
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receivingPo, setReceivingPo] = useState<any>(null);
  const [receiveItems, setReceiveItems] = useState<Record<string, number>>({});
  const [receiving, setReceiving] = useState(false);

  // Pay state
  const [payingPoId, setPayingPoId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getPurchaseOrders();
      const safePOs = Array.isArray(res) ? res : [];
      setPurchaseOrders(safePOs);
      if (user) {
        const supps = await getSuppliers();
        setSuppliers(Array.isArray(supps) ? supps : []);
        const prods = await getProductsServer({ data: { role: user.role, email: user.email } });
        setProducts(Array.isArray(prods) ? prods : []);
      }
    } catch (e) {
      console.warn("Failed to load PO data:", e);
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const safePOs = Array.isArray(purchaseOrders) ? purchaseOrders : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbound Corporate Purchase Orders (POs)"
        subtitle="Manage supplier commitments, track delivery receipts, and verify order fulfillments."
      />

      <SectionCard title="Purchase Orders Directory">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : safePOs.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No purchase order records found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-hairline uppercase text-[10px] text-muted-foreground">
                  <th className="py-2.5">PO Number</th>
                  <th className="py-2.5">Supplier</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5 text-right">Total Amount</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {safePOs.map((po) => (
                  <tr key={po.id} className="hover:bg-surface/50">
                    <td className="py-3 font-mono font-bold">{po.poNumber || po.id}</td>
                    <td className="py-3 font-semibold">{po.supplierName || "Supplier"}</td>
                    <td className="py-3 text-muted-foreground">{po.date || "N/A"}</td>
                    <td className="py-3 text-right font-bold text-emerald-500">
                      {fmtINR(po.totalCost || po.total || 0)}
                    </td>
                    <td className="py-3">
                      <StatusPill tone={po.status === "APPROVED" || po.status === "Received" ? "success" : "warning"}>
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
    </div>
  );
}
