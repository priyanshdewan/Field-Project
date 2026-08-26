import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { useBusinessData } from "@/lib/business-context";
import { useAuth } from "@/lib/auth-context";
import { fmtINR } from "@/lib/mock-data";
import { db } from "@/lib/db";
import { Sparkles, Truck, Plus, Loader2, Edit, Archive, Trash2, FileText, Phone, Key, Copy, Check, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getSuppliers,
  addSupplier,
  editSupplierServer,
  archiveSupplierServer,
} from "@/lib/server-suppliers";
import { initiateVapiCallServer } from "@/lib/server-vapi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/suppliers")({
  head: () => ({
    meta: [
      { title: "Supplier Intelligence | Bizora" },
      {
        name: "description",
        content: "Supplier 360° with AI scoring across price, reliability, quality, and delivery.",
      },
    ],
  }),
  component: Suppliers,
});

function Suppliers() {
  const { openSupplier360 } = useBusinessData();
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<any>(null);

  const [callingId, setCallingId] = useState<string | null>(null);

  const handleVapiCall = async (recipientName: string, phoneNumber: string) => {
    if (!phoneNumber) {
      toast.error("This supplier does not have a phone number registered.");
      return;
    }
    setCallingId(phoneNumber);
    try {
      const res = await initiateVapiCallServer({
        data: {
          phoneNumber,
          recipientName,
          role: "supplier",
          messageContext: `Calling supplier ${recipientName} to discuss stock reordering status, fulfillment rates, and delivery logistics for GrandSquare Mall.`,
        },
      });
      if (res.success) {
        toast.success(
          `AI voice call triggered successfully to ${recipientName}! Reference ID: ${res.callId}`,
        );
      } else {
        toast.error(`Failed to initiate call: ${res.error}`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to initiate call: " + e.message);
    } finally {
      setCallingId(null);
    }
  };

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [credsOpen, setCredsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formTerms, setFormTerms] = useState("");
  const [formLead, setFormLead] = useState("");
  const [formPassword, setFormPassword] = useState("123456789");
  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; email: string; password: string; phone: string } | null>(null);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const serverRes = await getSuppliers().catch(() => []);
      const localSuppliers = db.getSuppliers() || [];

      const getKey = (s: any) => (s?.email || s?.name || s?.id || '').toLowerCase().trim();
      const combinedMap = new Map<string, any>();
      if (Array.isArray(serverRes)) {
        serverRes.forEach((s: any) => {
          if (s) {
            const key = getKey(s);
            if (key) combinedMap.set(key, s);
          }
        });
      }
      localSuppliers.forEach((s: any) => {
        if (s) {
          const key = getKey(s);
          if (key && !combinedMap.has(key)) {
            combinedMap.set(key, s);
          }
        }
      });

      const res = Array.from(combinedMap.values());
      setSuppliers(res);
      if (res.length > 0 && !sel) {
        setSel(res[0]);
      } else if (sel) {
        const updatedSel = res.find((s) => (s.id && s.id === sel.id) || (s.email && s.email === sel.email) || (s.name && s.name === sel.name));
        if (updatedSel) setSel(updatedSel);
        else setSel(res[0] || null);
      }
    } catch (e) {
      const localSuppliers = db.getSuppliers() || [];
      setSuppliers(localSuppliers);
      if (localSuppliers.length > 0 && !sel) setSel(localSuppliers[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openAdd = () => {
    setFormName("");
    setFormContact("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormTerms("Net 30");
    setFormLead("5");
    setFormPassword("");
    setAddOpen(true);
  };

  const openEdit = () => {
    if (!sel) return;
    setFormName(sel.name || "");
    setFormContact(sel.contact || "");
    setFormEmail(sel.email || "");
    setFormPhone(sel.phone || "");
    setFormAddress(sel.address || "");
    setFormTerms(sel.paymentTerms || "Net 30");
    setFormLead((sel.lead || 5).toString());
    setEditOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Unauthorized");
    setSaving(true);
    const pwd = formPassword || "123456789";
    try {
      const newSup: any = {
        id: `SUP-${Date.now()}`,
        name: formName,
        contact: formContact || formName,
        email: formEmail,
        phone: formPhone,
        address: formAddress || "Store Vendor Network",
        paymentTerms: formTerms || "Net 30",
        lead: Number(formLead) || 5,
        rating: 4.9,
        status: "Active",
        score: 98,
        spend: 0,
        pending: 0,
        pendingPayment: 0,
        openPOs: 0,
        onTime: 95,
        quality: 95,
        risk: "Low",
        category: "General Vendor",
      };

      db.addSupplier(newSup);

      await addSupplier({
        data: {
          name: formName,
          contactPerson: formContact,
          email: formEmail,
          phone: formPhone,
          address: formAddress,
          paymentTerms: formTerms,
          leadTimeDays: Number(formLead),
          password: pwd,
          role: user.role,
          emailUser: user.email,
        },
      }).catch(() => {});

      toast.success("Supplier added & login account provisioned successfully!");
      setAddOpen(false);
      setCreatedCredentials({
        name: formName,
        email: formEmail,
        password: pwd,
        phone: formPhone,
      });
      setCredsOpen(true);
      await loadSuppliers();
    } catch (e: any) {
      toast.error(e.message || "Failed to add supplier");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sel) return toast.error("Unauthorized");
    setSaving(true);
    try {
      await editSupplierServer({
        data: {
          id: sel.id,
          name: formName,
          contactPerson: formContact,
          email: formEmail,
          phone: formPhone,
          address: formAddress,
          paymentTerms: formTerms,
          leadTimeDays: Number(formLead),
          role: user.role,
          emailUser: user.email,
        },
      });
      toast.success("Supplier updated successfully");
      setEditOpen(false);
      loadSuppliers();
    } catch (e: any) {
      toast.error(e.message || "Failed to update supplier");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!user || !sel) return toast.error("Unauthorized");
    if (!confirm(`Are you sure you want to archive ${sel.name}?`)) return;
    try {
      await archiveSupplierServer({
        data: {
          id: sel.id,
          role: user.role,
          emailUser: user.email,
        },
      });
      toast.success("Supplier archived successfully");
      setSel(null);
      loadSuppliers();
    } catch (e: any) {
      toast.error(e.message || "Failed to archive supplier");
    }
  };

  const handleDelete = async () => {
    if (!user || !sel) return toast.error("Unauthorized");
    const targetIdentifier = sel.id || sel._id || sel.supplierCode || sel.email || sel.name;
    if (!confirm(`Are you sure you want to PERMANENTLY delete supplier "${sel.name}" (${sel.email || targetIdentifier})?`)) return;
    try {
      if (sel.id) db.deleteSupplier(sel.id);
      if (sel.email) db.deleteSupplier(sel.email);
      if (sel.name) db.deleteSupplier(sel.name);

      await archiveSupplierServer({
        data: {
          id: targetIdentifier,
          role: user.role,
          emailUser: user.email,
        },
      }).catch(() => {});

      toast.success("Supplier deleted successfully");
      setSel(null);
      await loadSuppliers();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete supplier");
    }
  };

  const totalPending = suppliers.reduce((sum, s) => sum + (Number(s.pending) || Number(s.pendingPayment) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Supplier Intelligence"
          subtitle="AI-scored supplier performance across the mall's vendor network."
        />
        {(user?.role === "owner" || user?.role === "admin" || user?.role === "manager") && (
          <Button
            onClick={openAdd}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center gap-1.5 text-xs"
          >
            <Key className="h-4 w-4 text-amber-400" /> + Add Supplier & Provision Credentials
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Active Suppliers" v={suppliers.length.toString()} />
        <Kpi label="Pending Payments" v={fmtINR(totalPending, { compact: true })} tone="warning" />
        <Kpi label="Open POs" v={suppliers.filter((s) => s.pending > 0).length.toString()} />
        <Kpi
          label="Avg Score"
          v={
            suppliers.length
              ? Math.round(suppliers.reduce((a, b) => a + (Number(b.score) || 98), 0) / suppliers.length).toString()
              : "98"
          }
        />
        <Kpi
          label="High Risk"
          v={suppliers.filter((s) => s.risk === "High").length.toString()}
          tone={suppliers.filter((s) => s.risk === "High").length > 0 ? "danger" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard title="All Suppliers">
          <div className="overflow-x-auto min-h-[300px] relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-sidebar/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : suppliers.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No suppliers found in database.
              </div>
            ) : (
              <table className="w-full min-w-[720px] text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 font-medium">Supplier</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 text-right font-medium">Spend</th>
                    <th className="pb-2 text-right font-medium">Pending</th>
                    <th className="pb-2 text-right font-medium">On-time</th>
                    <th className="pb-2 text-right font-medium">Score</th>
                    <th className="pb-2 font-medium pl-4">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {suppliers.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setSel(s)}
                      className={cn(
                        "cursor-pointer hover:bg-surface/50 transition-colors",
                        sel?.id === s.id && "bg-primary/10",
                      )}
                    >
                      <td className="py-2.5">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.contact}</p>
                      </td>
                      <td className="py-2.5 text-muted-foreground">{s.category || "General Vendor"}</td>
                      <td className="py-2.5 text-right">{fmtINR(Number(s.spend) || 0, { compact: true })}</td>
                      <td className="py-2.5 text-right text-warning">
                        {fmtINR(Number(s.pending) || Number(s.pendingPayment) || 0, { compact: true })}
                      </td>
                      <td className="py-2.5 text-right">{s.onTime ?? s.reliability ?? 95}%</td>
                      <td className="py-2.5 text-right font-semibold">{s.score ?? 98}</td>
                      <td className="py-2.5 pl-4">
                        <StatusPill
                          tone={
                            s.risk === "High"
                              ? "danger"
                              : s.risk === "Medium"
                                ? "warning"
                                : "success"
                          }
                        >
                          {s.risk || "Low"}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </SectionCard>

        {sel && (
          <SectionCard
            title="Supplier 360° Profile"
            subtitle={sel.name}
            actions={
              <div className="flex gap-2">
                {(user?.role === "owner" || user?.role === "admin") && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-hairline bg-surface text-xs font-semibold text-primary hover:bg-primary/10"
                      onClick={openEdit}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-hairline bg-surface text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-3 w-3 mr-1 text-rose-600" /> Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-hairline bg-surface text-xs font-semibold text-amber-600 hover:bg-amber-50"
                      onClick={handleArchive}
                    >
                      <Archive className="h-3 w-3 mr-1 text-amber-600" /> Archive
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-hairline bg-surface text-xs font-semibold text-emerald-600 hover:bg-emerald-50 gap-1"
                      onClick={() => {
                        setCreatedCredentials({
                          name: sel.name,
                          email: sel.email || "supplier@gmail.com",
                          password: "123456789",
                          phone: sel.phone || "+917588021256",
                        });
                        setCredsOpen(true);
                      }}
                    >
                      <Key className="h-3 w-3 mr-1" /> Login Access
                    </Button>
                  </>
                )}
                <Link to="/purchase-orders">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-hairline bg-surface text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Place Order
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-hairline bg-surface text-xs font-semibold text-violet hover:bg-violet/10 gap-1"
                  onClick={() => handleVapiCall(sel.name, sel.phone)}
                  disabled={callingId === sel.phone}
                >
                  {callingId === sel.phone ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Phone className="h-3 w-3" />
                  )}
                  Call with AI
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-hairline bg-surface text-xs font-semibold"
                  onClick={() => openSupplier360(sel.id)}
                >
                  360° Profile
                </Button>
              </div>
            }
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg gradient-primary text-primary-foreground">
                <Truck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{sel.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {sel.category} · Contact: {sel.contact}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Email: {sel.email} · Phone: {sel.phone}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <ScoreBar label="Price Competitiveness" v={sel.priceCompetitiveness ?? Math.round(94 - (100 - (sel.score ?? 98)) / 2)} />
              <ScoreBar label="Reliability" v={sel.onTime ?? sel.reliability ?? 95} />
              <ScoreBar label="Quality" v={sel.quality ?? 95} />
              <ScoreBar label="Delivery Speed" v={Math.max(40, 100 - (sel.lead || 5) * 6)} />
              <div className="hairline-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall AI Score</span>
                  <span className="font-display text-xl font-semibold text-primary">
                    {sel.score ?? 98}/100
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI Analysis
              </div>
              <p className="mt-1 text-foreground/90 leading-relaxed">
                {sel.risk === "High"
                  ? "Delivery risk is elevated. Consider dual-sourcing critical SKUs and negotiating a service-level agreement."
                  : sel.risk === "Medium"
                    ? "Overall solid supplier but lead time is trending up. Explore alternate pricing terms."
                    : "Reliable partner. Maintain current relationship. Explore volume discount on next quarterly review."}
              </p>
            </div>

            <div className="mt-4">
              <Link to="/purchase-orders" search={{ supplier: sel.id }}>
                <Button
                  variant="outline"
                  className="w-full border-hairline bg-surface font-semibold text-xs h-9"
                >
                  <FileText className="h-3.5 w-3.5 mr-2" /> Create PO for {sel.name}
                </Button>
              </Link>
            </div>
          </SectionCard>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[425px] bg-sidebar border border-hairline text-foreground">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Supplier Name *</Label>
              <Input
                required
                className="bg-surface border-hairline"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Contact Person *</Label>
                <Input
                  required
                  className="bg-surface border-hairline"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  required
                  className="bg-surface border-hairline"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input
                  required
                  className="bg-surface border-hairline"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Lead Time (Days) *</Label>
                <Input
                  type="number"
                  required
                  className="bg-surface border-hairline"
                  value={formLead}
                  onChange={(e) => setFormLead(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address *</Label>
              <Input
                required
                className="bg-surface border-hairline"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Supplier Portal Initial Password *</Label>
              <Input
                type="text"
                required
                placeholder="Initial login password"
                className="bg-surface border-hairline font-mono text-sm"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">The supplier can log into the Supplier Portal (bizora-supplier.onrender.com) using their email and this password.</p>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Supplier & Create Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Supplier Login Credentials Modal */}
      <Dialog open={credsOpen} onOpenChange={setCredsOpen}>
        <DialogContent className="sm:max-w-[480px] bg-sidebar border border-hairline text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-500">
              <Key className="h-5 w-5" /> Supplier Portal Login Credentials
            </DialogTitle>
          </DialogHeader>
          {createdCredentials && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-muted-foreground">
                Share these login details with <strong>{createdCredentials.name}</strong> so they can access their dedicated Supplier Portal dashboard, accept purchase orders, and track fulfillment.
              </p>
              <div className="rounded-lg border border-hairline bg-surface/60 p-4 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Portal URL:</span>
                  <a href="https://bizora-supplier.onrender.com" target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 font-semibold">
                    bizora-supplier.onrender.com <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Login Email:</span>
                  <span className="font-semibold text-foreground">{createdCredentials.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Password:</span>
                  <span className="font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">{createdCredentials.password}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  className="w-full text-xs font-semibold"
                  onClick={() => {
                    const text = `🔑 Supplier Portal Login Credentials:\nURL: https://bizora-supplier.onrender.com\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
                    navigator.clipboard.writeText(text);
                    toast.success("Credentials copied to clipboard!");
                  }}
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Credentials
                </Button>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  onClick={() => {
                    const phone = (createdCredentials.phone || "+917588021256").replace(/\s+/g, "").replace("+", "");
                    const msg = `Namaste ${createdCredentials.name}! 🛍️ Aap ke GrandSquare Supermart Supplier Portal login details tayyar hain:\n\n🌐 Portal: https://bizora-supplier.onrender.com\n📧 Email: ${createdCredentials.email}\n🔑 Password: ${createdCredentials.password}\n\nKripaya login karke pending purchase orders check karein. Dhanyawad!`;
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                    toast.success("WhatsApp message window opened!");
                  }}
                >
                  <Phone className="h-3.5 w-3.5 mr-1.5" /> Send via WhatsApp
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCredsOpen(false)} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-sidebar border border-hairline text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Supplier Name *</Label>
              <Input
                required
                className="bg-surface border-hairline"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Contact Person *</Label>
                <Input
                  required
                  className="bg-surface border-hairline"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  required
                  className="bg-surface border-hairline"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input
                  required
                  className="bg-surface border-hairline"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Lead Time (Days) *</Label>
                <Input
                  type="number"
                  required
                  className="bg-surface border-hairline"
                  value={formLead}
                  onChange={(e) => setFormLead(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address *</Label>
              <Input
                required
                className="bg-surface border-hairline"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
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

function Kpi({ label, v, tone }: { label: string; v: string; tone?: "warning" | "danger" }) {
  return (
    <div className="card-elevated p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={`mt-1.5 font-display text-lg font-semibold ${tone === "danger" ? "text-destructive" : tone === "warning" ? "text-warning" : ""}`}
      >
        {v}
      </p>
    </div>
  );
}

function ScoreBar({ label, v }: { label: string; v: number }) {
  const p = Math.max(0, Math.min(100, v));
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(p)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface">
        <div className="h-full gradient-primary" style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}
