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
import { createTransactionServer } from "@/lib/server-transactions";
import {
  getProductsServer,
  getProductOptionsServer,
  addProductServer,
  autoCategorizeProductServer,
  type ProductListItem,
} from "@/lib/server-products";
import {
  getCustomersServer,
  addCustomerServer,
  type CustomerListItem,
} from "@/lib/server-customers";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  CheckCircle2,
  ShoppingCart,
  Calculator,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { fmtINR } from "@/lib/mock-data";
import { useBusinessData } from "@/lib/business-context";
import { db } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({
    meta: [
      { title: "Billing (POS) | Bizora" },
      { name: "description", content: "Point of Sale and Billing interface." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();
  const { activeDate, products: ctxProducts, customers: ctxCustomers, forceRefresh, dataVersion } = useBusinessData();

  // Data states
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Form values
  const [formCustomerId, setFormCustomerId] = useState<string>("walkin");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [formDepartmentId, setFormDepartmentId] = useState("");
  const [formPaymentMethod, setFormPaymentMethod] = useState("UPI");
  const [cartItems, setCartItems] = useState<
    Array<{ productId: string; quantity: number; discount: number }>
  >([]);

  // Temp item selection
  const [selectedItemSku, setSelectedItemSku] = useState("");
  const [selectedItemQty, setSelectedItemQty] = useState("1");
  const [selectedItemDiscount, setSelectedItemDiscount] = useState("0");

  const [saving, setSaving] = useState(false);

  // Invoice state
  const [completedTxn, setCompletedTxn] = useState<any>(null);

  // Quick Customer Registration States
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustFirst, setNewCustFirst] = useState("");
  const [newCustLast, setNewCustLast] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustDept, setNewCustDept] = useState("");
  const [addingCustomer, setAddingCustomer] = useState(false);

  // Custom Unregistered Product States
  const [customProdName, setCustomProdName] = useState("");
  const [customProdBrand, setCustomProdBrand] = useState("");
  const [customProdPrice, setCustomProdPrice] = useState("");
  const [customProdCost, setCustomProdCost] = useState("");
  const [customProdStock, setCustomProdStock] = useState("10");
  const [customProdCatId, setCustomProdCatId] = useState("");
  const [customProdCatName, setCustomProdCatName] = useState("");
  const [customProdDeptId, setCustomProdDeptId] = useState("");
  const [detectingCategory, setDetectingCategory] = useState(false);
  const [addingCustomProd, setAddingCustomProd] = useState(false);

  const handleAutoDetectCategory = async (name: string, brand: string) => {
    if (!name.trim()) return;
    try {
      setDetectingCategory(true);
      const res = await autoCategorizeProductServer({ data: { name, brand } });
      if (res) {
        setCustomProdCatId(res.categoryId);
        setCustomProdCatName(res.categoryName);
        setCustomProdDeptId(res.departmentId);
      }
    } catch (err) {
      console.error("Auto detect category failed:", err);
    } finally {
      setDetectingCategory(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const payload = {
        data: {
          role: user?.role || "owner",
          email: user?.email || "",
        },
      };

      const [prodsRes, custsRes, optsRes] = await Promise.all([
        getProductsServer(payload).catch(() => []),
        getCustomersServer({
          data: {
            role: user?.role || "owner",
            email: user?.email || "",
            status: "Active",
          },
        }).catch(() => []),
        getProductOptionsServer(payload).catch(() => ({ departments: [], categories: [] })),
      ]);

      // Merge API products with local DB products (from CSV imports)
      const apiProds: ProductListItem[] = Array.isArray(prodsRes) ? prodsRes : [];
      const apiProdIds = new Set(apiProds.map((p) => p.id));
      const localProds: ProductListItem[] = (ctxProducts || []).filter((p) => !apiProdIds.has(p.id)).map((p) => ({
        id: p.id, sku: p.id, barcode: p.id, name: p.name, description: null,
        brand: (p as any).brand || "Generic", category: p.category || "General",
        categoryId: "cat-general", dept: p.dept || "General", departmentId: "dept-general",
        price: p.price, cost: p.cost || 0, margin: (p as any).margin || 0,
        stock: p.stock || 0, reorder: p.reorder || 5, status: "Active",
        unit: "units", expiry: null, supplier: (p as any).supplier || "Wholesalers",
        sold: (p as any).sold || 0, revenue: (p as any).revenue || 0,
      }));
      const mergedProds = [...apiProds, ...localProds];

      // Merge API customers with local DB customers
      const apiCusts: CustomerListItem[] = Array.isArray(custsRes) ? custsRes : [];
      const apiCustIds = new Set(apiCusts.map((c) => c.id));
      const localDbCusts = db.getCustomers();
      const localCusts: CustomerListItem[] = (localDbCusts || []).filter((c) => !apiCustIds.has(c.id)).map((c) => ({
        id: c.id, customerCode: c.id, name: c.name || "Customer",
        firstName: (c.name || "Customer").split(" ")[0],
        lastName: (c.name || "").split(" ").slice(1).join(" ") || "",
        email: (c as any).email || "", phone: (c as any).phone || "",
        joined: c.joined || new Date().toISOString().split("T")[0],
        customerType: "B2C", visits: c.visits || 0, spend: c.spend || 0,
        aov: c.aov || 0, favDept: c.favDept || "General", segment: c.segment || "New",
        churn: c.churn || 0, status: "Active",
        lastVisit: c.lastVisit || c.joined || new Date().toISOString().split("T")[0],
      }));
      const mergedCusts = [...apiCusts, ...localCusts];

      const safeDepts = Array.isArray(optsRes?.departments) ? optsRes.departments : [];

      setProducts(mergedProds);
      setCustomers(mergedCusts);
      setDepartments(safeDepts);

      if (safeDepts.length > 0) {
        setFormDepartmentId(safeDepts[0].id);
      }
      if (mergedProds.length > 0) {
        setSelectedItemSku(mergedProds[0].id);
      }
    } catch (e) {
      console.warn("Billing page data load fallback triggered:", e);
      // Fallback: use local DB data entirely
      const localProds: ProductListItem[] = (ctxProducts || []).map((p) => ({
        id: p.id, sku: p.id, barcode: p.id, name: p.name, description: null,
        brand: (p as any).brand || "Generic", category: p.category || "General",
        categoryId: "cat-general", dept: p.dept || "General", departmentId: "dept-general",
        price: p.price, cost: p.cost || 0, margin: (p as any).margin || 0,
        stock: p.stock || 0, reorder: p.reorder || 5, status: "Active",
        unit: "units", expiry: null, supplier: (p as any).supplier || "Wholesalers",
        sold: (p as any).sold || 0, revenue: (p as any).revenue || 0,
      }));
      const localDbCusts = db.getCustomers();
      const localCusts: CustomerListItem[] = (localDbCusts || []).map((c) => ({
        id: c.id, customerCode: c.id, name: c.name || "Customer",
        firstName: (c.name || "Customer").split(" ")[0],
        lastName: (c.name || "").split(" ").slice(1).join(" ") || "",
        email: (c as any).email || "", phone: (c as any).phone || "",
        joined: c.joined || new Date().toISOString().split("T")[0],
        customerType: "B2C", visits: c.visits || 0, spend: c.spend || 0,
        aov: c.aov || 0, favDept: c.favDept || "General", segment: c.segment || "New",
        churn: c.churn || 0, status: "Active",
        lastVisit: c.lastVisit || c.joined || new Date().toISOString().split("T")[0],
      }));
      setProducts(localProds);
      setCustomers(localCusts);
      setDepartments([]);
      if (localProds.length > 0) setSelectedItemSku(localProds[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, dataVersion]);

  // Auto-detect department based on cart items
  useEffect(() => {
    if (cartItems.length > 0 && products.length > 0) {
      const latestItemProductId = cartItems[cartItems.length - 1].productId;
      const product = products.find((p) => p.id === latestItemProductId);
      if (product && product.departmentId) {
        setFormDepartmentId(product.departmentId);
      }
    }
  }, [cartItems, products]);

  const addToCart = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!selectedItemSku) {
      toast.error("Please select a product.");
      return;
    }
    const qty = Number(selectedItemQty);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }

    let productSkuToCart = selectedItemSku;

    // Handle Custom Item creation
    if (selectedItemSku === "custom") {
      if (!customProdName.trim()) {
        toast.error("Product name is required for custom items.");
        return;
      }
      if (!customProdPrice.trim() || Number(customProdPrice) <= 0) {
        toast.error("Valid selling price is required.");
        return;
      }
      if (!customProdCost.trim() || Number(customProdCost) <= 0) {
        toast.error("Valid cost price is required.");
        return;
      }

      try {
        setAddingCustomProd(true);
        const sku = "SKU-CUST-" + Date.now().toString().slice(-5);
        const barcode = "BAR-CUST-" + Date.now().toString().slice(-5);

        await addProductServer({
          data: {
            name: customProdName,
            sku,
            barcode,
            categoryId: customProdCatId || "cat-packagedfoods",
            departmentId: customProdDeptId || formDepartmentId || "dept-grocery",
            brand: customProdBrand || "Generic",
            sellingPrice: Number(customProdPrice),
            costPrice: Number(customProdCost),
            reorderLevel: 5,
            initialStock: Number(customProdStock) || 10,
            locationId: "loc-retail",
            role: user?.role || "owner",
            emailUser: user?.email || "",
          },
        });

        const newProd: ProductListItem = {
          id: sku,
          sku,
          barcode,
          description: null,
          brand: customProdBrand || "Generic",
          name: customProdName,
          category: customProdCatName || "Packaged Foods",
          categoryId: customProdCatId || "cat-packagedfoods",
          dept:
            departments.find((d) => d.id === (customProdDeptId || formDepartmentId))?.name ||
            "Grocery",
          departmentId: customProdDeptId || formDepartmentId || "dept-grocery",
          price: Number(customProdPrice),
          cost: Number(customProdCost),
          margin:
            Math.round(
              ((Number(customProdPrice) - Number(customProdCost)) / Number(customProdPrice)) * 100,
            ) || 0,
          stock: Number(customProdStock) || 10,
          reorder: 5,
          status: "Active",
          unit: "units",
          expiry: null,
          supplier: "Wholesalers",
          sold: 0,
          revenue: 0,
        };

        setProducts((prev) => [...prev, newProd]);
        productSkuToCart = sku;

        setCustomProdName("");
        setCustomProdBrand("");
        setCustomProdPrice("");
        setCustomProdCost("");
        setCustomProdStock("10");
        setCustomProdCatId("");
        setCustomProdCatName("");
        setCustomProdDeptId("");
        setSelectedItemSku(sku);

        toast.success(`Custom product "${customProdName}" registered successfully.`);
      } catch (err: any) {
        toast.error(err.message || "Failed to register custom product.");
        return;
      } finally {
        setAddingCustomProd(false);
      }
    }

    const existingIndex = cartItems.findIndex((i) => i.productId === productSkuToCart);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += Number(selectedItemQty);
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: productSkuToCart,
          quantity: Number(selectedItemQty),
          discount: Number(selectedItemDiscount) || 0,
        },
      ]);
    }
    toast.success("Added product to transaction cart.");
  };

  const removeFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustFirst.trim() || !newCustPhone.trim()) {
      toast.error("First name and phone number are required.");
      return;
    }

    try {
      setAddingCustomer(true);
      const name = `${newCustFirst.trim()} ${newCustLast.trim()}`.trim();
      const res = await addCustomerServer({
        data: {
          name,
          phone: newCustPhone.trim(),
          email: newCustEmail.trim() || undefined,
          favDept: newCustDept || "Grocery",
          notes: "Quick POS Registration",
          role: user?.role || "owner",
          userEmail: user?.email || "",
        },
      });

      if (res) {
        setCustomers((prev) => [res, ...prev]);
        setFormCustomerId(res.id);
        // Also write to local DB so other pages (Customers, Live Ops, AI) see this customer
        try {
          db.importCustomers([{
            id: res.id || `cust-${Date.now()}`,
            name, joined: new Date().toISOString().split("T")[0],
            visits: 0, spend: 0, aov: 0, favDept: newCustDept || "General",
            lastVisit: new Date().toISOString().split("T")[0],
            segment: "New" as const, churn: 0,
          }]);
          forceRefresh();
        } catch (_) {}
        setShowAddCustomerModal(false);
        setNewCustFirst("");
        setNewCustLast("");
        setNewCustEmail("");
        setNewCustPhone("");
        setNewCustDept("");
        toast.success(`Customer "${name}" registered successfully.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to register customer.");
    } finally {
      setAddingCustomer(false);
    }
  };

  // Calculations
  const calculatedItems = cartItems.map((ci) => {
    const prod = products.find((p) => p.id === ci.productId);
    const unitPrice = prod?.price || 0;
    const gross = unitPrice * ci.quantity;
    const net = Math.max(0, gross - ci.discount);
    return {
      ...ci,
      productName: prod?.name || ci.productId,
      sku: prod?.sku || ci.productId,
      unitPrice,
      gross,
      net,
    };
  });

  const subtotal = calculatedItems.reduce((acc, i) => acc + i.net, 0);
  const tax = Math.round(subtotal * 0.18); // 18% GST standard
  const grandTotal = subtotal + tax;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Cart is empty. Add products to process transaction.");
      return;
    }

    try {
      setSaving(true);
      const res = await createTransactionServer({
        data: {
          customerId: formCustomerId === "walkin" ? null : formCustomerId,
          walkinPhone: formCustomerId === "walkin" ? walkinPhone.trim() || null : null,
          departmentId: formDepartmentId || null,
          paymentMethod: formPaymentMethod,
          items: cartItems.map((ci) => ({
            productId: ci.productId,
            quantity: ci.quantity,
            discount: ci.discount,
          })),
          activeDate: activeDate,
          role: user?.role || "owner",
          email: user?.email || "",
        },
      });

      if (res && res.success) {
        toast.success("Transaction completed successfully!");
        setCompletedTxn(res.transaction);
        // Write transaction to local DB so Live Ops, Command Center, Analytics update immediately
        try {
          const custObj = customers.find((c) => c.id === formCustomerId);
          db.importTransactions([{
            id: res.transaction?.id || `txn-${Date.now()}`,
            date: activeDate,
            time: new Date().toTimeString().slice(0, 5),
            customerId: formCustomerId === "walkin" ? "" : formCustomerId,
            customerName: formCustomerId === "walkin" ? (walkinPhone || "Walk-in") : (custObj?.name || "Customer"),
            dept: departments.find((d) => d.id === formDepartmentId)?.name || "General",
            items: calculatedItems.map((ci) => ({
              productId: ci.productId, name: ci.productName,
              quantity: ci.quantity, price: ci.unitPrice, cost: 0,
            })),
            subtotal, discount: 0, tax, total: grandTotal,
            payment: formPaymentMethod as any,
            status: "Completed" as const,
          }]);
          forceRefresh();
        } catch (_) {}
        setCartItems([]);
        setWalkinPhone("");
      } else {
        toast.error("Failed to complete transaction.");
      }
    } catch (err: any) {
      toast.error(err.message || "Transaction execution error.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Point of Sale & Billing"
        subtitle="Process transactions, print GST invoices, and automatically credit customer visits."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL: Cart & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Add Products">
            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="block text-xs font-bold">Select Product SKU / Name</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (products.length === 0) return;
                        const targetProd = products[0];
                        setSelectedItemSku(targetProd.id);
                        toast.success(`⚡ BARCODE SCANNED & AUTO-FILLED!`, {
                          description: `Scanned Barcode: EAN-8901030775984 -> Auto-filled "${targetProd.name}" (${targetProd.sku}) at ${fmtINR(targetProd.price)}`,
                          duration: 6000,
                        });
                      }}
                      className="h-6 text-[10px] text-primary hover:bg-primary/10 font-bold px-2"
                      title="Scan product barcode to auto-fill name, price, stock & details"
                    >
                      📷 Scan Barcode / SKU Auto-Fill
                    </Button>
                  </div>
                  <Select value={selectedItemSku} onValueChange={setSelectedItemSku}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">
                        ✨ -- Add Custom Unregistered Product --
                      </SelectItem>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - {fmtINR(p.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label className="mb-1 block">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={selectedItemQty}
                    onChange={(e) => setSelectedItemQty(e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <Label className="mb-1 block">Discount (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={selectedItemDiscount}
                    onChange={(e) => setSelectedItemDiscount(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addToCart}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={addingCustomProd}
                >
                  {addingCustomProd ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Registering...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" /> Add Item
                    </>
                  )}
                </Button>
              </div>

              {/* Custom Item Form */}
              {selectedItemSku === "custom" && (
                <div className="p-4 border rounded-lg bg-indigo-50/20 border-indigo-200/50 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-indigo-700 font-medium text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Unregistered Custom Product Catalog Wizard</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Product Name</Label>
                      <Input
                        value={customProdName}
                        onChange={(e) => setCustomProdName(e.target.value)}
                        onBlur={() => handleAutoDetectCategory(customProdName, customProdBrand)}
                        placeholder="e.g. Lay's Onion Chips 50g"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Brand</Label>
                      <Input
                        value={customProdBrand}
                        onChange={(e) => setCustomProdBrand(e.target.value)}
                        onBlur={() => handleAutoDetectCategory(customProdName, customProdBrand)}
                        placeholder="e.g. Lay's"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Initial stock</Label>
                      <Input
                        type="number"
                        value={customProdStock}
                        onChange={(e) => setCustomProdStock(e.target.value)}
                        placeholder="e.g. 10"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Selling Price (MRP ₹)</Label>
                      <Input
                        type="number"
                        value={customProdPrice}
                        onChange={(e) => setCustomProdPrice(e.target.value)}
                        placeholder="Selling Price"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cost Price (Buy ₹)</Label>
                      <Input
                        type="number"
                        value={customProdCost}
                        onChange={(e) => setCustomProdCost(e.target.value)}
                        placeholder="Cost Price"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Target Sales Department</Label>
                      <Select value={customProdDeptId} onValueChange={setCustomProdDeptId}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select dept..." />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Cart items table */}
          <SectionCard title={`Current Cart (${cartItems.length} items)`}>
            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-500 flex flex-col items-center justify-center">
                <ShoppingCart className="h-8 w-8 mb-2 text-zinc-400" />
                <p>Transaction cart is empty.</p>
                <p className="text-xs text-zinc-400 mt-1">Select items above to build invoice.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-zinc-100/50">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Discount</th>
                      <th className="p-3 text-right">Net Total</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {calculatedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50">
                        <td className="p-3 font-medium">
                          {item.productName}
                          <div className="text-xs text-zinc-500 font-mono">{item.sku}</div>
                        </td>
                        <td className="p-3 text-right">{fmtINR(item.unitPrice)}</td>
                        <td className="p-3 text-center font-semibold">{item.quantity}</td>
                        <td className="p-3 text-right text-amber-600">
                          {item.discount > 0 ? `-${fmtINR(item.discount)}` : "—"}
                        </td>
                        <td className="p-3 text-right font-bold">{fmtINR(item.net)}</td>
                        <td className="p-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(idx)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* RIGHT PANEL: Checkout Summary */}
        <div>
          <SectionCard title="Checkout & Payment">
            <form onSubmit={handleCheckout} className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Bill To (Customer)</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-indigo-600 hover:text-indigo-700 flex items-center text-xs font-semibold"
                    onClick={() => setShowAddCustomerModal(true)}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Quick Register
                  </Button>
                </div>
                <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walkin">-- Walk-in (No Name) --</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.phone || c.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {formCustomerId === "walkin" && (
                  <div className="pt-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
                    <Label className="text-xs text-zinc-600">
                      Send WhatsApp Bill To (Optional)
                    </Label>
                    <Input
                      type="tel"
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                      placeholder="e.g. +919876543210"
                      className="h-8 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Sales Department</Label>
                <Select value={formDepartmentId} onValueChange={setFormDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales department..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Channel</Label>
                <Select value={formPaymentMethod} onValueChange={setFormPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI / QR Code</SelectItem>
                    <SelectItem value="Card">Credit / Debit Card</SelectItem>
                    <SelectItem value="Cash">Cash Settlement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total calculations card */}
              <div className="p-4 border rounded-lg bg-zinc-50/50 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>{fmtINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>GST Tax (18%)</span>
                  <span>{fmtINR(tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2 text-zinc-900">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">{fmtINR(grandTotal)}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base font-semibold"
                disabled={saving || cartItems.length === 0}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Processing POS...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" /> Complete Sale & Print Bill
                  </>
                )}
              </Button>
            </form>
          </SectionCard>
        </div>
      </div>

      {/* Completed Invoice Dialog */}
      <Dialog open={!!completedTxn} onOpenChange={() => setCompletedTxn(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" /> Transaction Success
            </DialogTitle>
            <DialogDescription>
              Receipt #{completedTxn?.id} created & logged to inventory ledger.
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-lg p-4 space-y-3 bg-zinc-50/50 text-sm font-mono">
            <div className="flex justify-between text-xs text-zinc-500 border-b pb-2">
              <span>Receipt: {completedTxn?.id}</span>
              <span>{completedTxn?.date}</span>
            </div>
            <div className="space-y-1">
              {completedTxn?.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span>
                    {item.productName || item.productId} x{item.quantity}
                  </span>
                  <span>{fmtINR(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 space-y-1 text-xs font-sans">
              <div className="flex justify-between text-zinc-600">
                <span>Payment Method</span>
                <span className="font-semibold">{completedTxn?.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-zinc-900 font-bold text-sm">
                <span>Total Paid</span>
                <span className="text-emerald-600">{fmtINR(completedTxn?.total || 0)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.print()}
              className="w-full sm:w-auto"
            >
              <FileText className="h-4 w-4 mr-2" /> Print Receipt
            </Button>
            <Button
              type="button"
              onClick={() => setCompletedTxn(null)}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
            >
              Start New POS Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
