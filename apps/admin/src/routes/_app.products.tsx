import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Archive,
  Package as PkgIcon,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Sparkles,
} from "lucide-react";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
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
import { useBusinessData } from "@/lib/business-context";
import { useAuth } from "@/lib/auth-context";
import { fmtINR, fmtNum } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  getProductsServer,
  addProductServer,
  editProductServer,
  archiveProductServer,
  getProductOptionsServer,
  autoCategorizeProductServer,
  type ProductListItem,
} from "@/lib/server-products";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/products")({
  head: () => ({
    meta: [
      { title: "Product Intelligence | Bizora" },
      {
        name: "description",
        content:
          "Product 360° intelligence with sales, demand, expiry, and reorder recommendations.",
      },
    ],
  }),
  component: Products,
});

function Products() {
  const { openProduct360 } = useBusinessData();
  const { user } = useAuth();

  // Search & Loading state
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ProductListItem | null>(null);

  // Form lists
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);

  // Dialog open state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add Product form state
  const [formName, setFormName] = useState("");
  const [autoCategoryResult, setAutoCategoryResult] = useState<{
    categoryName: string;
    categoryId: string;
    departmentId: string;
    confidence: number;
    method: string;
  } | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [formSku, setFormSku] = useState("");
  const [formBarcode, setFormBarcode] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formSellingPrice, setFormSellingPrice] = useState("");
  const [formCostPrice, setFormCostPrice] = useState("");
  const [formTaxRate, setFormTaxRate] = useState("18.0");
  const [formUnit, setFormUnit] = useState("units");
  const [formReorderLevel, setFormReorderLevel] = useState("");
  const [formInitialStock, setFormInitialStock] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formSupplier, setFormSupplier] = useState("");
  const [formBatchNo, setFormBatchNo] = useState("");
  const [formMfgDate, setFormMfgDate] = useState("");
  const [formExpDate, setFormExpDate] = useState("");

  useEffect(() => {
    if (formName.trim().length < 3) {
      setAutoCategoryResult(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsCategorizing(true);
        const res = await autoCategorizeProductServer({
          data: { name: formName, brand: formBrand || "Generic" },
        });
        if (res) {
          setAutoCategoryResult(res);
          setFormCategory(res.categoryId);
          setFormDepartment(res.departmentId);
        }
      } catch (err) {
        console.warn("Auto-categorization error:", err);
      } finally {
        setIsCategorizing(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formName, formBrand]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const list = await getProductsServer({
        data: {
          role: user?.role || "owner",
          email: user?.email || "",
        },
      });
      const safeList = Array.isArray(list) ? list : [];
      setProducts(safeList);
      if (safeList.length > 0) {
        setSelected(safeList[0]);
      } else {
        setSelected(null);
      }
    } catch (e) {
      console.warn("Failed to load products:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const opts = await getProductOptionsServer({
        data: {
          role: user?.role || "owner",
          email: user?.email || "",
        },
      });
      const safeCats = Array.isArray(opts?.categories) ? opts.categories : [];
      const safeDepts = Array.isArray(opts?.departments) ? opts.departments : [];
      const safeSups = Array.isArray(opts?.suppliers) ? opts.suppliers : [];
      const safeLocs = Array.isArray(opts?.locations) ? opts.locations : [];

      setCategories(safeCats);
      setDepartments(safeDepts);
      setSuppliers(safeSups);
      setLocations(safeLocs);

      if (safeCats.length > 0) setFormCategory(safeCats[0].id);
      if (safeDepts.length > 0) setFormDepartment(safeDepts[0].id);
      if (safeSups.length > 0) setFormSupplier(safeSups[0].id);
      if (safeLocs.length > 0) setFormLocation(safeLocs[0].id);
    } catch (e) {
      console.error("Failed to load form options", e);
    }
  };

  useEffect(() => {
    loadProducts();
    loadOptions();
  }, [user]);

  const resetForm = () => {
    setFormName("");
    setFormSku("");
    setFormBarcode("");
    setFormBrand("");
    setFormDesc("");
    setFormSellingPrice("");
    setFormCostPrice("");
    setFormTaxRate("18.0");
    setFormUnit("units");
    setFormReorderLevel("");
    setFormInitialStock("");
    setFormBatchNo("");
    setFormMfgDate("");
    setFormExpDate("");
    if (categories.length > 0) setFormCategory(categories[0].id);
    if (departments.length > 0) setFormDepartment(departments[0].id);
    if (suppliers.length > 0) setFormSupplier(suppliers[0].id);
    if (locations.length > 0) setFormLocation(locations[0].id);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formName ||
      !formSku ||
      !formBarcode ||
      !formSellingPrice ||
      !formCostPrice ||
      !formReorderLevel
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      await addProductServer({
        data: {
          name: formName,
          sku: formSku,
          barcode: formBarcode,
          categoryId: formCategory,
          departmentId: formDepartment,
          brand: formBrand,
          description: formDesc,
          sellingPrice: Number(formSellingPrice),
          costPrice: Number(formCostPrice),
          taxRate: Number(formTaxRate),
          unit: formUnit,
          reorderLevel: Number(formReorderLevel),
          initialStock: Number(formInitialStock) || 0,
          locationId: formLocation,
          supplierId: formSupplier || undefined,
          batchNumber: formBatchNo || undefined,
          manufacturingDate: formMfgDate || undefined,
          expiryDate: formExpDate || undefined,
          role: user?.role || "owner",
          emailUser: user?.email || "",
        },
      });
      toast.success(`Successfully registered SKU ${formSku}`);
      setAddOpen(false);
      resetForm();
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to add product.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!formName || !formSellingPrice || !formCostPrice || !formReorderLevel) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      await editProductServer({
        data: {
          id: selected.id,
          name: formName,
          categoryId: formCategory,
          departmentId: formDepartment,
          brand: formBrand,
          description: formDesc,
          sellingPrice: Number(formSellingPrice),
          costPrice: Number(formCostPrice),
          taxRate: Number(formTaxRate),
          unit: formUnit,
          reorderLevel: Number(formReorderLevel),
          status: selected.status,
          role: user?.role || "owner",
          emailUser: user?.email || "",
        },
      });
      toast.success(`Successfully updated SKU ${selected.sku}`);
      setEditOpen(false);
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveProduct = async () => {
    if (!selected) return;
    if (!confirm(`Are you sure you want to archive product SKU ${selected.sku}?`)) return;
    try {
      await archiveProductServer({
        data: {
          id: selected.id,
          role: user?.role || "owner",
          emailUser: user?.email || "",
        },
      });
      toast.success("Product archived successfully.");
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to archive product.");
    }
  };

  const openEditDialog = () => {
    if (!selected) return;
    setFormName(selected.name);
    setFormCategory(selected.categoryId);
    setFormDepartment(selected.departmentId);
    setFormBrand(selected.brand);
    setFormDesc(selected.description || "");
    setFormSellingPrice(selected.price.toString());
    setFormCostPrice(selected.cost.toString());
    setFormUnit(selected.unit);
    setFormReorderLevel(selected.reorder.toString());
    setEditOpen(true);
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const filtered = safeProducts.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(q.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(q.toLowerCase()) ||
      (p.dept || "").toLowerCase().includes(q.toLowerCase()),
  );

  const lowStockCount = safeProducts.filter((p) => p.stock <= p.reorder).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Intelligence"
        subtitle="Deep visibility into every SKU: sales, demand, expiry, margins, and AI recommendations."
        actions={
          <Button
            onClick={() => {
              resetForm();
              setAddOpen(true);
            }}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniKpi
          label="Total active SKUs"
          value={fmtNum(safeProducts.length)}
          icon={<PkgIcon className="h-4 w-4" />}
        />
        <MiniKpi
          label="Total Stock Value"
          value={fmtINR(
            safeProducts.reduce((sum, p) => sum + p.stock * p.cost, 0),
            { compact: true },
          )}
          tone="success"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MiniKpi
          label="Low Stock Alert"
          value={fmtNum(lowStockCount)}
          tone={lowStockCount > 0 ? "warning" : undefined}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MiniKpi
          label="Fashion Contribution"
          value={fmtINR(
            safeProducts
              .filter((p) => p.dept === "Fashion")
              .reduce((sum, p) => sum + p.stock * p.price, 0),
            { compact: true },
          )}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_1fr]">
        <SectionCard
          title="All Products"
          subtitle={`${filtered.length} of ${safeProducts.length} active SKUs`}
          actions={
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search SKU, name, department…"
                className="h-8 w-64 bg-sidebar border border-hairline pl-8 text-xs focus:border-rose-500/50"
              />
            </div>
          }
        >
          <div className="overflow-x-auto min-h-[300px] relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-sidebar/50">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No matching product records found in database.
              </div>
            ) : (
              <table className="w-full min-w-[860px] text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-hairline">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Dept</th>
                    <th className="pb-2 text-right font-medium">Price</th>
                    <th className="pb-2 text-right font-medium">Stock</th>
                    <th className="pb-2 text-right font-medium">Margin</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-surface/50",
                        selected?.id === p.id && "bg-rose-500/10",
                      )}
                      onClick={() => setSelected(p)}
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface text-[10px] font-semibold text-muted-foreground">
                            {(p.brand || "SK").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{p.name}</p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {p.sku} · {p.brand}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-muted-foreground">{p.dept}</td>
                      <td className="py-2.5 text-right font-medium">{fmtINR(p.price)}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={cn(
                            p.stock === 0
                              ? "text-destructive font-bold"
                              : p.stock <= p.reorder
                                ? "text-warning font-semibold"
                                : "",
                          )}
                        >
                          {fmtNum(p.stock)} {p.unit}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-success">{p.margin}%</td>
                      <td className="py-2.5">
                        <StatusPill
                          tone={
                            p.stock === 0 ? "danger" : p.stock <= p.reorder ? "warning" : "success"
                          }
                        >
                          {p.stock === 0
                            ? "out of stock"
                            : p.stock <= p.reorder
                              ? "low stock"
                              : p.status}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </SectionCard>

        {selected && (
          <Product360View
            p={selected}
            onEdit={openEditDialog}
            onArchive={handleArchiveProduct}
            onOpen360={openProduct360}
          />
        )}
      </div>
    </div>
  );
}

function MiniKpi({ label, value, tone, icon }: any) {
  return (
    <div className="card-elevated p-3">
      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <span>{label}</span>
        {icon}
      </div>
      <p
        className={cn(
          "mt-1 font-display text-xl font-semibold",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Product360View({ p, onEdit, onArchive, onOpen360 }: any) {
  return (
    <SectionCard title="Product 360 Summary">
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <h3 className="text-sm font-bold">{p.name}</h3>
            <p className="text-muted-foreground font-mono">{p.sku}</p>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={onArchive}>
              <Archive className="h-3.5 w-3.5 mr-1" /> Archive
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded bg-surface p-2.5">
            <span className="text-muted-foreground block text-[10px]">Selling Price</span>
            <span className="font-semibold text-sm">{fmtINR(p.price)}</span>
          </div>
          <div className="rounded bg-surface p-2.5">
            <span className="text-muted-foreground block text-[10px]">Cost Price</span>
            <span className="font-semibold text-sm">{fmtINR(p.cost)}</span>
          </div>
          <div className="rounded bg-surface p-2.5">
            <span className="text-muted-foreground block text-[10px]">Current Stock</span>
            <span className="font-semibold text-sm">{fmtNum(p.stock)} {p.unit}</span>
          </div>
          <div className="rounded bg-surface p-2.5">
            <span className="text-muted-foreground block text-[10px]">Reorder Threshold</span>
            <span className="font-semibold text-sm">{fmtNum(p.reorder)} {p.unit}</span>
          </div>
        </div>

        <Button
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold"
          onClick={() => onOpen360(p.id)}
        >
          Open Deep Product 360 Profile
        </Button>
      </div>
    </SectionCard>
  );
}
