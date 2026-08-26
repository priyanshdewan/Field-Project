import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
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
  ScanLine,
  Camera,
  X,
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

  // Barcode Scanner State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-generate SKU from product name
  const autoGenerateSku = useCallback((name: string) => {
    if (!name.trim()) return "";
    const prefix = name.trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
    const suffix = String(Date.now()).slice(-5);
    return `${prefix}-${suffix}`;
  }, []);

  // Start camera for barcode scanning
  const startScanner = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScannerActive(true);

      // Use BarcodeDetector API if available
      const hasBarcodeDetector = typeof (window as any).BarcodeDetector !== "undefined";

      if (hasBarcodeDetector) {
        const detector = new (window as any).BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
        });

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              setScannedBarcode(code);
              setFormBarcode(code);
              if (!formSku) setFormSku(autoGenerateSku(code));
              toast.success(`✅ Barcode scanned: ${code}`);
              stopScanner();
              setScannerOpen(false);
              setAddOpen(true);
            }
          } catch (err) {
            // detection frame error, continue
          }
        }, 300);
      } else {
        // Fallback: manual barcode entry prompt
        toast.info("BarcodeDetector not supported in this browser. Please type the barcode manually or use Chrome on Android.", { duration: 5000 });
      }
    } catch (err: any) {
      toast.error("Camera access denied. Please allow camera permission to scan barcodes.");
      setScannerOpen(false);
    }
  }, [formSku, autoGenerateSku]);

  // Stop camera stream
  const stopScanner = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScannerActive(false);
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Start scanner when modal opens
  useEffect(() => {
    if (scannerOpen) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [scannerOpen]);

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
      const safeList = Array.isArray(list) ? list : Array.isArray((list as any)?.data) ? (list as any).data : [];
      setProducts(safeList);
      if (safeList.length > 0) {
        setSelected(safeList[0]);
      } else {
        setSelected(null);
      }
    } catch (e) {
      toast.error("Failed to load products list from database.");
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
      const safeCategories = Array.isArray(opts?.categories) ? opts.categories : [];
      const safeDepartments = Array.isArray(opts?.departments) ? opts.departments : [];
      const safeSuppliers = Array.isArray(opts?.suppliers) ? opts.suppliers : [];
      const safeLocations = Array.isArray(opts?.locations) ? opts.locations : [];

      setCategories(safeCategories);
      setDepartments(safeDepartments);
      setSuppliers(safeSuppliers);
      setLocations(safeLocations);

      // Select default options
      if (safeCategories.length > 0) setFormCategory(safeCategories[0].id);
      if (safeDepartments.length > 0) setFormDepartment(safeDepartments[0].id);
      if (safeSuppliers.length > 0) setFormSupplier(safeSuppliers[0].id);
      if (safeLocations.length > 0) setFormLocation(safeLocations[0].id);
    } catch (e) {
      console.error("Failed to load form options", e);
    }
  };

  useEffect(() => {
    loadProducts();
    loadOptions();
  }, [user]);

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const safeLocations = Array.isArray(locations) ? locations : [];

  const filtered = safeProducts.filter(
    (p) =>
      p &&
      ((p.name || "").toLowerCase().includes(q.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(q.toLowerCase()) ||
        (p.dept || "").toLowerCase().includes(q.toLowerCase())),
  );

  const lowStockCount = safeProducts.filter((p) => p && Number(p.stock || 0) <= Number(p.reorder || 0)).length;

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
    if (!formName || !formSellingPrice) {
      toast.error("Please fill in Product Name and Selling Price.");
      return;
    }
    // Auto-generate SKU and barcode if not provided
    const finalSku = formSku || autoGenerateSku(formName);
    const finalBarcode = formBarcode || `BAR-${String(Date.now()).slice(-8)}`;
    setSaving(true);
    try {
      await addProductServer({
        data: {
          name: formName,
          sku: finalSku,
          barcode: finalBarcode,
          categoryId: formCategory,
          departmentId: formDepartment,
          brand: formBrand || "Generic",
          description: formDesc,
          sellingPrice: Number(formSellingPrice),
          costPrice: Number(formCostPrice) || Math.round(Number(formSellingPrice) * 0.7),
          taxRate: Number(formTaxRate),
          unit: formUnit,
          reorderLevel: Number(formReorderLevel) || 5,
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
      toast.success(`Successfully registered SKU ${finalSku}`);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Intelligence"
        subtitle="Deep visibility into every SKU: sales, demand, expiry, margins, and AI recommendations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setScannerOpen(true);
              }}
              className="border-hairline bg-surface hover:text-primary transition-colors gap-2 font-semibold"
            >
              <ScanLine className="h-4 w-4" /> Connect Scanner
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setFormSku(autoGenerateSku("PROD"));
                setFormBarcode(`BAR-${String(Date.now()).slice(-8)}`);
                setAddOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniKpi
          label="Total active SKUs"
          value={fmtNum(products.length)}
          icon={<PkgIcon className="h-4 w-4" />}
        />
        <MiniKpi
          label="Total Stock Value"
          value={fmtINR(
            products.reduce((sum, p) => sum + p.stock * p.cost, 0),
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
            products
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
          subtitle={`${filtered.length} of ${products.length} active SKUs`}
          actions={
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search SKU, name, department…"
                className="h-8 w-64 bg-sidebar border border-hairline pl-8 text-xs focus:border-primary/50"
              />
            </div>
          }
        >
          <div className="overflow-x-auto min-h-[300px] relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-sidebar/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                        selected?.id === p.id && "bg-primary/10",
                      )}
                      onClick={() => setSelected(p)}
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface text-[10px] font-semibold text-muted-foreground">
                            {p.brand.slice(0, 2).toUpperCase()}
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

      {/* Barcode Scanner Dialog */}
      <Dialog open={scannerOpen} onOpenChange={(open) => { if (!open) stopScanner(); setScannerOpen(open); }}>
        <DialogContent className="sm:max-w-[480px] bg-sidebar border border-hairline text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" /> Barcode Scanner
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              {scannerActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-32 border-2 border-primary/80 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br" />
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/60 animate-pulse" />
                  </div>
                </div>
              )}
              {!scannerActive && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Initializing camera...
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Point your camera at a product barcode. It will auto-detect and fill the barcode field.
            </p>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Or type barcode manually..."
                className="bg-surface border-hairline h-9 text-xs flex-1"
                value={scannedBarcode}
                onChange={(e) => setScannedBarcode(e.target.value)}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (scannedBarcode.trim()) {
                    setFormBarcode(scannedBarcode.trim());
                    setFormSku(autoGenerateSku(scannedBarcode.trim()));
                    toast.success(`Barcode set: ${scannedBarcode.trim()}`);
                    stopScanner();
                    setScannerOpen(false);
                    setAddOpen(true);
                  } else {
                    toast.error("Please scan or enter a barcode first.");
                  }
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Use Barcode
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog — Simplified */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[460px] bg-sidebar border border-hairline text-foreground overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Quick Add Product</DialogTitle>
            <p className="text-[11px] text-muted-foreground">Only Name & Price are required. Everything else is auto-filled or optional.</p>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
            {/* Essential Fields */}
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Product Name *</Label>
              <Input
                id="add-name"
                required
                placeholder="e.g. Tata Salt 1kg"
                className="bg-surface border-hairline h-9 text-xs"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {isCategorizing && (
              <p className="text-[10px] text-muted-foreground animate-pulse flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                AI auto-categorizing...
              </p>
            )}

            {!isCategorizing && autoCategoryResult && (
              <div className="rounded border border-primary/20 bg-primary/5 p-2 text-[10px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="font-semibold text-primary">Auto: {autoCategoryResult.categoryName}</span>
                <span className="ml-auto">{(autoCategoryResult.confidence * 100).toFixed(0)}%</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-sellprice">Selling Price (₹) *</Label>
                <Input
                  id="add-sellprice"
                  type="number"
                  required
                  placeholder="e.g. 28"
                  className="bg-surface border-hairline h-9 text-xs"
                  value={formSellingPrice}
                  onChange={(e) => setFormSellingPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-brand">Brand</Label>
                <Input
                  id="add-brand"
                  placeholder="e.g. Tata"
                  className="bg-surface border-hairline h-9 text-xs"
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                />
              </div>
            </div>

            {formBarcode && (
              <div className="rounded border border-green-500/20 bg-green-500/5 p-2 text-[10px] text-green-400 flex items-center gap-1">
                <ScanLine className="h-3 w-3" /> Scanned Barcode: <strong>{formBarcode}</strong>
              </div>
            )}

            {/* Collapsible More Details */}
            <details className="border border-hairline rounded-lg">
              <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors select-none">
                ▸ More Details (optional)
              </summary>
              <div className="space-y-3 p-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-sku">SKU Code</Label>
                    <Input
                      id="add-sku"
                      placeholder="Auto-generated"
                      className="bg-surface border-hairline h-8 text-xs"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="add-barcode">Barcode</Label>
                    <Input
                      id="add-barcode"
                      placeholder="Auto-generated"
                      className="bg-surface border-hairline h-8 text-xs"
                      value={formBarcode}
                      onChange={(e) => setFormBarcode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-costprice">Cost Price (₹)</Label>
                    <Input
                      id="add-costprice"
                      type="number"
                      placeholder="Auto: 70% of selling"
                      className="bg-surface border-hairline h-8 text-xs"
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="add-initstock">Initial Stock</Label>
                    <Input
                      id="add-initstock"
                      type="number"
                      placeholder="0"
                      className="bg-surface border-hairline h-8 text-xs"
                      value={formInitialStock}
                      onChange={(e) => setFormInitialStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={formCategory} onValueChange={setFormCategory}>
                      <SelectTrigger className="bg-surface border-hairline h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-hairline text-xs">
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Department</Label>
                    <Select value={formDepartment} onValueChange={setFormDepartment}>
                      <SelectTrigger className="bg-surface border-hairline h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-hairline text-xs">
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-unit">Unit</Label>
                    <Input
                      id="add-unit"
                      placeholder="units"
                      className="bg-surface border-hairline h-8 text-xs"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="add-reorder">Reorder Level</Label>
                    <Input
                      id="add-reorder"
                      type="number"
                      placeholder="5"
                      className="bg-surface border-hairline h-8 text-xs"
                      value={formReorderLevel}
                      onChange={(e) => setFormReorderLevel(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="add-tax">Tax %</Label>
                    <Input
                      id="add-tax"
                      type="number"
                      placeholder="18"
                      className="bg-surface border-hairline h-8 text-xs"
                      value={formTaxRate}
                      onChange={(e) => setFormTaxRate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-exp">Expiry Date</Label>
                    <Input
                      id="add-exp"
                      type="date"
                      className="bg-surface border-hairline h-8 text-xs"
                      value={formExpDate}
                      onChange={(e) => setFormExpDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Supplier</Label>
                    <Select value={formSupplier} onValueChange={setFormSupplier}>
                      <SelectTrigger className="bg-surface border-hairline h-8 text-xs">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-hairline text-xs">
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </details>

            <DialogFooter className="pt-1">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-sidebar border border-hairline text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Product Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                required
                className="bg-surface border-hairline h-8 text-xs"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="bg-surface border-hairline h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-hairline text-xs">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department *</Label>
                <Select value={formDepartment} onValueChange={setFormDepartment}>
                  <SelectTrigger className="bg-surface border-hairline h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-hairline text-xs">
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-sellprice">Retail Price (₹) *</Label>
                <Input
                  id="edit-sellprice"
                  type="number"
                  required
                  className="bg-surface border-hairline h-8 text-xs"
                  value={formSellingPrice}
                  onChange={(e) => setFormSellingPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-costprice">Cost Price (₹) *</Label>
                <Input
                  id="edit-costprice"
                  type="number"
                  required
                  className="bg-surface border-hairline h-8 text-xs"
                  value={formCostPrice}
                  onChange={(e) => setFormCostPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-reorder">Reorder Threshold *</Label>
                <Input
                  id="edit-reorder"
                  type="number"
                  required
                  className="bg-surface border-hairline h-8 text-xs"
                  value={formReorderLevel}
                  onChange={(e) => setFormReorderLevel(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-unit">Unit Type</Label>
                <Input
                  id="edit-unit"
                  className="bg-surface border-hairline h-8 text-xs"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                className="bg-surface border-hairline text-xs"
                rows={2}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniKpi({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "warning" | "success";
}) {
  return (
    <div className="card-elevated p-3.5">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
        {icon && (
          <span className={tone === "warning" ? "text-warning" : "text-primary"}>{icon}</span>
        )}
      </div>
      <p
        className={cn(
          "mt-2 font-display text-xl font-semibold",
          tone === "success" && "text-success",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Product360View({
  p,
  onEdit,
  onArchive,
  onOpen360,
}: {
  p: ProductListItem;
  onEdit: () => void;
  onArchive: () => void;
  onOpen360: (id: string) => void;
}) {
  // Simple stockout indicator based on current items
  const daysLeft = p.stock === 0 ? 0 : Math.round(p.stock / 2.5 + 1);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Product Snapshot"
        subtitle={p.name}
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-hairline bg-surface text-xs font-semibold text-primary hover:bg-primary/10"
              onClick={onEdit}
            >
              <Edit className="h-3 w-3 mr-1" /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-hairline bg-surface text-xs font-semibold text-destructive hover:bg-destructive/10"
              onClick={onArchive}
            >
              <Archive className="h-3 w-3 mr-1" /> Archive
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-hairline bg-surface text-xs font-semibold"
              onClick={() => onOpen360(p.id)}
            >
              360° Profile
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 mt-2">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg gradient-primary text-sm font-bold text-primary-foreground">
            {p.brand.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {p.dept} · {p.category}
            </p>
            <h3 className="mt-0.5 truncate font-display text-lg font-semibold">{p.name}</h3>
            <p className="text-xs text-muted-foreground">
              SKU: {p.sku} · Barcode: {p.barcode} · Brand: {p.brand}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Selling Price" v={fmtINR(p.price)} />
          <Stat label="Cost Price" v={fmtINR(p.cost)} />
          <Stat label="Gross Margin" v={`${p.margin}%`} tone="success" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Current stock" v={`${fmtNum(p.stock)} ${p.unit}`} />
          <Stat label="Reorder level" v={`${fmtNum(p.reorder)} ${p.unit}`} />
        </div>

        <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-primary">
            <AlertTriangle className="h-3.5 w-3.5" /> Quick Inventory Status
          </div>
          <p className="mt-1 text-foreground/90 leading-relaxed">
            {p.stock === 0 ? (
              <span className="text-destructive font-semibold">
                SKU is currently out of stock. Customers cannot checkout this product.
              </span>
            ) : p.stock <= p.reorder ? (
              <span className="text-warning font-semibold">
                Current stock is below reorder threshold. Projected stockout in {daysLeft} days. We
                recommend ordering immediately.
              </span>
            ) : (
              <span>
                Inventory is within safe levels. Estimated buffer: {daysLeft} days of sales
                operations.
              </span>
            )}
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

function Stat({ label, v, tone }: { label: string; v: string; tone?: "success" }) {
  return (
    <div className="rounded-md border border-hairline bg-surface/60 p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-semibold", tone === "success" && "text-success")}>{v}</p>
    </div>
  );
}
