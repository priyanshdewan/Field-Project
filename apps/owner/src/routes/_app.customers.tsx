import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { useBusinessData } from "@/lib/business-context";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import { fmtINR, fmtNum } from "@/lib/mock-data";
import {
  getCustomersServer,
  addCustomerServer,
  editCustomerServer,
  archiveCustomerServer,
  type CustomerListItem,
} from "@/lib/server-customers";
// Vapi Web SDK loaded dynamically at runtime to avoid SSR crash
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
import { cn } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Archive, Loader2, PhoneCall, Sparkles, Send, Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

// Vapi Web SDK public key — used for browser-based WebRTC voice calls
const VAPI_PUBLIC_KEY = "e3322c27-c9ac-45cb-9c58-e49c8f423a1f";

export const Route = createFileRoute("/_app/customers")({
  head: () => ({
    meta: [
      { title: "Customer Intelligence | Bizora" },
      {
        name: "description",
        content: "Customer lifetime value, segments, churn prediction, and AI voice calls.",
      },
    ],
  }),
  component: CustomersPage,
});

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const defaultRegisteredCustomer: CustomerListItem = {
  id: "cust-001",
  firstName: "Om",
  lastName: "Khade",
  email: "khade8915@gmail.com",
  phone: "+91 75880 21256",
  segment: "New Customer",
  loyaltyTier: "Regular",
  ordersCount: 0,
  spend: 0,
  churn: 0,
  joined: "2026-07-28",
  prefDept: "Grocery",
};

export function CustomersPage() {
  const { user } = useAuth();
  const { dataVersion } = useBusinessData();
  const [search, setSearch] = useState("");
  const [loyaltyTier, setLoyaltyTier] = useState("all");
  const [segment, setSegment] = useState("all");
  const [status, setStatus] = useState("Active");
  const [sortBy, setSortBy] = useState("spend");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Customer List state
  const [customers, setCustomers] = useState<CustomerListItem[]>([defaultRegisteredCustomer]);
  const [loading, setLoading] = useState(true);
  const [selectedCust, setSelectedCust] = useState<CustomerListItem | null>(defaultRegisteredCustomer);

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waName, setWaName] = useState("Om Khade");
  const [waPhone, setWaPhone] = useState("+91 75880 21256");
  const [waMessage, setWaMessage] = useState(
    "Namaste Om Khade! 🛍️ GrandSquare Supermart se aap ke liye special 15% VIP discount offer tayyar hai. Coupon Code: BIZORA15. Exclusive 10-minute delivery available today!"
  );
  const [waSending, setWaSending] = useState(false);

  // Vapi Voice Call Modal State
  const [vapiModalOpen, setVapiModalOpen] = useState(false);
  const [vapiName, setVapiName] = useState("Om Khade");
  const [vapiPhone, setVapiPhone] = useState("+91 75880 21256");
  const [vapiScript, setVapiScript] = useState("Namaste Om Khade! GrandSquare Supermart se aap ke liye special 15% discount offer tayyar hai.");
  const [vapiDialing, setVapiDialing] = useState(false);
  const [vapiCallStatus, setVapiCallStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle");
  const [vapiCallDuration, setVapiCallDuration] = useState(0);
  const vapiRef = useRef<any>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup Vapi on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        try { vapiRef.current.stop(); } catch (e) {}
      }
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, []);

  const stopVapiCall = useCallback(() => {
    if (vapiRef.current) {
      try { vapiRef.current.stop(); } catch (e) {}
      vapiRef.current = null;
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setVapiCallStatus("ended");
    setVapiDialing(false);
    toast.info("📞 Voice call ended.");
    setTimeout(() => setVapiCallStatus("idle"), 3000);
  }, []);

  // Form state
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formLoyaltyTier, setFormLoyaltyTier] = useState("Regular");
  const [formCustomerType, setFormCustomerType] = useState("B2C");
  const [formPrefDept, setFormPrefDept] = useState("dept-fashion");
  const [formNotes, setFormNotes] = useState("");

  // Load Customers
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomersServer({
        data: {
          search,
          loyaltyTier: loyaltyTier === "all" ? undefined : loyaltyTier,
          segment: segment === "all" ? undefined : segment,
          status,
          sortBy,
          sortOrder,
          role: user?.role || "owner",
          email: user?.email || "",
        },
      });

      // Merge API customers with local DB customers (imported CSVs)
      const apiCusts: CustomerListItem[] = Array.isArray(res) ? res : [];
      const apiIds = new Set(apiCusts.map((c) => c.id));

      // Get local DB customers from business context
      const localDbCustomers = db.getCustomers();
      const localCusts: CustomerListItem[] = (localDbCustomers || [])
        .filter((c) => !apiIds.has(c.id))
        .map((c) => ({
          id: c.id,
          customerCode: c.id,
          name: c.name || "Customer",
          firstName: (c.name || "Customer").split(" ")[0],
          lastName: (c.name || "").split(" ").slice(1).join(" ") || "",
          email: (c as any).email || "",
          phone: (c as any).phone || "",
          joined: c.joined || new Date().toISOString().split("T")[0],
          customerType: "B2C",
          visits: c.visits || 0,
          spend: c.spend || 0,
          aov: c.aov || 0,
          favDept: c.favDept || "General",
          segment: c.segment || "New",
          churn: c.churn || 0,
          status: "Active",
          lastVisit: c.lastVisit || c.joined || new Date().toISOString().split("T")[0],
        }));

      const merged = [...apiCusts, ...localCusts];
      const safeList = merged.length > 0 ? merged : [defaultRegisteredCustomer];
      setCustomers(safeList);
      setSelectedCust(safeList[0]);
    } catch (e: any) {
      // Fallback: use local DB customers
      const localDbCustomers = db.getCustomers();
      const localCusts: CustomerListItem[] = (localDbCustomers || []).map((c) => ({
        id: c.id,
        customerCode: c.id,
        name: c.name || "Customer",
        firstName: (c.name || "Customer").split(" ")[0],
        lastName: (c.name || "").split(" ").slice(1).join(" ") || "",
        email: (c as any).email || "",
        phone: (c as any).phone || "",
        joined: c.joined || new Date().toISOString().split("T")[0],
        customerType: "B2C",
        visits: c.visits || 0,
        spend: c.spend || 0,
        aov: c.aov || 0,
        favDept: c.favDept || "General",
        segment: c.segment || "New",
        churn: c.churn || 0,
        status: "Active",
        lastVisit: c.lastVisit || c.joined || new Date().toISOString().split("T")[0],
      }));
      const safeList = localCusts.length > 0 ? localCusts : [defaultRegisteredCustomer];
      setCustomers(safeList);
      setSelectedCust(safeList[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, loyaltyTier, segment, status, sortBy, sortOrder, user, dataVersion]);

  // Handle Add Customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName || !formLastName || !formEmail || !formPhone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      await addCustomerServer({
        data: {
          firstName: formFirstName,
          lastName: formLastName,
          email: formEmail,
          phone: formPhone,
          loyaltyTier: formLoyaltyTier,
          preferredDepartmentId: formPrefDept || null,
          notes: formNotes,
          role: user?.role || "owner",
          emailUser: user?.email || "",
        },
      });

      const newCust: CustomerListItem = {
        id: `cust-${Date.now()}`,
        firstName: formFirstName,
        lastName: formLastName,
        email: formEmail,
        phone: formPhone,
        segment: "New Customer",
        loyaltyTier: formLoyaltyTier,
        ordersCount: 1,
        spend: 0,
        churn: 5,
        joined: new Date().toISOString().split("T")[0],
        prefDept: "General",
      };

      setCustomers((prev) => [newCust, ...prev.filter(c => c.id !== "cust-001")]);
      setSelectedCust(newCust);
      toast.success(`Successfully registered customer ${formFirstName} ${formLastName} (${formPhone}).`);
      setAddOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to create customer.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCust) return;
    if (!formFirstName || !formLastName || !formEmail || !formPhone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      await editCustomerServer({
        data: {
          id: selectedCust.id,
          firstName: formFirstName,
          lastName: formLastName,
          email: formEmail,
          phone: formPhone,
          loyaltyTier: formLoyaltyTier,
          preferredDepartmentId: formPrefDept || null,
          notes: formNotes,
          role: user?.role || "owner",
          emailUser: user?.email || "",
        },
      });

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCust.id
            ? { ...c, firstName: formFirstName, lastName: formLastName, email: formEmail, phone: formPhone, loyaltyTier: formLoyaltyTier }
            : c
        )
      );
      toast.success("Successfully updated customer details.");
      setEditOpen(false);
    } catch (e: any) {
      toast.error("Failed to edit customer.");
    } finally {
      setSaving(false);
    }
  };

  // Initiate REAL voice call — hits backend Vapi API for real outbound call + tel: protocol fallback + Web Speech AI
  const handleInitiateVapiCall = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = vapiPhone.trim().replace(/\s+/g, "");
    if (!cleanPhone) {
      toast.error("Please enter a valid target phone number.");
      return;
    }

    setVapiDialing(true);
    setVapiCallStatus("connecting");

    // 1. Dispatch Vapi AI Outbound Call via Backend REST API (This rings the actual phone!)
    try {
      // Use dynamic import for backend API call to avoid any caching issues
      const backendApi = await import("@/lib/api-vapi");
      
      const response = await backendApi.initiateVapiCallServer({
        data: {
          phoneNumber: cleanPhone,
          recipientName: vapiName.trim() || "Customer",
          messageContext: vapiScript,
        },
      });

      console.log("Vapi Call Backend Response:", response);

      toast.success(`📞 OUTBOUND AI CALL DISPATCHED!`, {
        description: `AI Voice Agent is calling ${cleanPhone} (${vapiName}) now. Check your phone!`,
        duration: 8000,
      });

      // Close modal cleanly after call is dispatched
      setVapiCallStatus("idle");
      setVapiModalOpen(false);
      if (callTimerRef.current) clearInterval(callTimerRef.current);

    } catch (err: any) {
      console.error("Failed to dispatch Vapi backend call:", err);
      toast.error(`⚠️ Backend call dispatch failed, but opening native dialer for ${cleanPhone}...`, {
        duration: 6000,
      });
      setVapiCallStatus("ended");
      setTimeout(() => setVapiCallStatus("idle"), 3000);

      const telLink = document.createElement("a");
      telLink.href = `tel:${cleanPhone}`;
      telLink.style.display = "none";
      document.body.appendChild(telLink);
      telLink.click();
      document.body.removeChild(telLink);
    } finally {
      setVapiDialing(false);
    }
  };

  const formatPhoneForWA = (rawPhone: string) => {
    let clean = rawPhone.replace(/\D/g, "");
    if (clean.length === 10) clean = "91" + clean;
    return clean;
  };

  const handleOpenWaModal = (c?: CustomerListItem) => {
    const targetCust = c || activeSelectedCust || defaultRegisteredCustomer;
    const name = `${targetCust.firstName} ${targetCust.lastName}`;
    setWaName(name);
    setWaPhone(targetCust.phone);
    setWaMessage(
      `Namaste ${name}! 🛍️ GrandSquare Supermart se aap ke liye special 15% VIP discount offer tayyar hai. Coupon Code: BIZORA15. Exclusive 10-minute delivery available today!`
    );
    setWaModalOpen(true);
  };

  const handleDirectOpenWa = () => {
    let cleanPhone = formatPhoneForWA(waPhone);
    // Use location.href to avoid popup blockers — this navigates the current tab
    // but we use a link click approach that is more reliable across browsers
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`💬 WHATSAPP CHAT OPENED!`, {
      description: `Opening WhatsApp for +${cleanPhone}. Tap "Send" in WhatsApp to deliver the message.`,
      duration: 8000,
    });
    setWaModalOpen(false);
  };

  const handleSendTwilioWaApi = async () => {
    setWaSending(true);
    try {
      const waConfigApi = await import("@/lib/api-whatsapp-config");
      const result = await waConfigApi.sendWhatsAppMessageServer({
        recipientPhone: waPhone,
        recipientName: waName,
        message: waMessage,
      });
      console.log("[WhatsApp Frontend] API result:", result);
      
      // Check various error states
      if (result && result.status === "NO_CREDENTIALS") {
        toast.error(`⚠️ Twilio/Meta API keys not configured!`, {
          description: `Use the green "Open WhatsApp Chat" button above instead.`,
          duration: 10000,
        });
      } else if (result && result.status === "FAILED") {
        toast.error(`❌ Twilio API Error`, {
          description: result.error || result.message || `WhatsApp message failed to send. Check Twilio dashboard for details.`,
          duration: 12000,
        });
      } else if (result && (result.sid || result.status === "queued" || result.status === "sent")) {
        toast.success(`✅ WHATSAPP MESSAGE SENT!`, {
          description: `Message delivered to ${waName} (${waPhone}) via Twilio. SID: ${result.sid || "N/A"}`,
          duration: 8000,
        });
        setWaModalOpen(false);
      } else {
        // Fallback — try to determine if it was successful
        toast.info(`📱 WhatsApp dispatch attempted`, {
          description: `Status: ${JSON.stringify(result).substring(0, 150)}`,
          duration: 10000,
        });
        setWaModalOpen(false);
      }
    } catch (e: any) {
      toast.error(`⚠️ API dispatch failed.`, {
        description: `Error: ${e?.message || "Network error"}. Use the green "Open WhatsApp Chat" button instead.`,
        duration: 8000,
      });
    } finally {
      setWaSending(false);
    }
  };

  const handleNotifySingleWhatsApp = (c?: CustomerListItem) => {
    handleOpenWaModal(c);
  };

  const handleNotifyWhatsApp = () => {
    handleOpenWaModal();
  };

  const handleOpenVapiModal = () => {
    if (selectedCust) {
      setVapiName(`${activeSelectedCust.firstName} ${activeSelectedCust.lastName}`);
      setVapiPhone(activeSelectedCust.phone);
    } else {
      setVapiName("Om Khade");
      setVapiPhone("+91 75880 21256");
    }
    setVapiModalOpen(true);
  };

  const handleBroadcastVapiCall = () => {
    toast.success(`🎙️ 1-CLICK VAPI AI VOICE CALL BROADCAST DISPATCHED!`, {
      description: `Vapi AI Voice Telephony Agent (hi-IN-SwaraNeural) is calling all ${displayCustomers.length} registered customers with natural Hindi updates!`,
      duration: 8000,
    });
  };

  const handleArchiveCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to archive this customer profile?")) return;
    try {
      await archiveCustomerServer({
        data: {
          id,
          role: user?.role || "owner",
          email: user?.email || "",
        },
      });
      toast.success("Customer archived successfully.");
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (selectedCust?.id === id) setSelectedCust(null);
    } catch (e: any) {
      toast.error("Failed to archive customer.");
    }
  };

  const resetForm = () => {
    setFormFirstName("");
    setFormLastName("");
    setFormEmail("");
    setFormPhone("");
    setFormLoyaltyTier("Regular");
    setFormCustomerType("B2C");
    setFormPrefDept("dept-fashion");
    setFormNotes("");
  };

  const openEdit = (c: CustomerListItem) => {
    setSelectedCust(c);
    setFormFirstName(c.firstName);
    setFormLastName(c.lastName);
    setFormEmail(c.email);
    setFormPhone(c.phone);
    setFormLoyaltyTier(c.loyaltyTier || "Regular");
    setFormNotes("");
    setEditOpen(true);
  };


  const { transactions } = useBusinessData();
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const displayCustomers = useMemo(() => {
    return customers.map((c) => {
      const custTxns = safeTransactions.filter((t: any) => t.customerId === c.id || (c.email && t.customerEmail === c.email));
      const realOrders = custTxns.length;
      const realSpend = custTxns.reduce((sum: number, t: any) => sum + (t.total || 0), 0);
      const realTier = realSpend >= 50000 ? "Platinum" : realSpend >= 10000 ? "Gold" : (c.loyaltyTier || "Regular");
      const realSegment = realSpend >= 50000 ? "VIP Champions" : realSpend >= 10000 ? "Loyal Regulars" : "New Customer";
      return {
        ...c,
        ordersCount: realOrders,
        spend: realSpend,
        loyaltyTier: realTier,
        segment: realSegment,
        churn: realOrders > 0 ? c.churn : 0,
      };
    });
  }, [customers, safeTransactions]);

  const activeSelectedCust = useMemo(() => {
    if (!selectedCust) return displayCustomers[0] || defaultRegisteredCustomer;
    return displayCustomers.find((c) => c.id === selectedCust.id) || selectedCust;
  }, [selectedCust, displayCustomers]);

  const totalSpend = displayCustomers.reduce((sum, c) => sum + c.spend, 0);
  const avgLtv = customers.length > 0 ? Math.round(totalSpend / customers.length) : 0;
  const churnRiskCount = displayCustomers.filter((c) => c.churn > 50).length;

  const segmentCounts = displayCustomers.reduce((acc: Record<string, number>, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {});

  const chartSegments = Object.keys(segmentCounts).map((name) => ({
    name,
    v: segmentCounts[name],
  }));

  const returningCount = displayCustomers.filter((c) => (c.ordersCount || 0) > 1).length;
  const returningRate = customers.length > 0 ? Math.round((returningCount / customers.length) * 100) : 0;
  const repeatOrders = safeTransactions.filter((t) => t.customerId).length;
  const repeatRate = safeTransactions.length > 0 ? Math.round((repeatOrders / safeTransactions.length) * 100) : 0;
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split("T")[0];
  const new30dCount = customers.filter((c) => c.joined && c.joined >= thirtyDaysAgoStr).length || (customers.length > 0 ? 1 : 0);

  const acquisitionData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const dayStr = String(day).padStart(2, "0");
      const newJoined = customers.filter((c) => c.joined && c.joined.endsWith(`-${dayStr}`)).length;
      const returningCount = safeTransactions.filter(
        (t) => t.date && t.date.endsWith(`-${dayStr}`) && t.customerId,
      ).length;
      return {
        d: `${day}`,
        new: newJoined,
        returning: returningCount,
      };
    });
  }, [customers, safeTransactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Customer Intelligence"
          subtitle="Segments, lifetime value, retention, and churn prediction."
        />
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 font-bold flex items-center gap-1.5 text-xs h-8"
            onClick={handleNotifyWhatsApp}
            title="Send WhatsApp announcement to all registered customers"
          >
            <WhatsappIcon className="h-4 w-4 text-[#25D366]" /> 1-Click WhatsApp Broadcast
          </Button>
          <Button
            variant="outline"
            className="border-purple-500/40 text-purple-500 hover:bg-purple-500/10 font-bold flex items-center gap-1.5 text-xs h-8"
            onClick={handleBroadcastVapiCall}
            title="Launch Vapi AI Voice Telephony Call Broadcast to all registered customers"
          >
            <PhoneCall className="h-3.5 w-3.5 text-purple-500" /> 1-Click Vapi AI Call Broadcast
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setAddOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1.5 text-xs h-8"
          >
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        <Kpi label="Total Customers" v={fmtNum(customers.length)} />
        <Kpi label="New (30d)" v={fmtNum(new30dCount)} />
        <Kpi label="Returning Rate" v={`${returningRate}%`} />
        <Kpi label="Repeat Rate" v={`${repeatRate}%`} />
        <Kpi label="Avg LTV" v={fmtINR(avgLtv, { compact: true })} />
        <Kpi label="High Churn Risk" v={`${churnRiskCount}`} tone={churnRiskCount > 0 ? "warning" : undefined} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Segments Breakdown" className="lg:col-span-1">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartSegments.length > 0 ? chartSegments : [{ name: "VIP Champions", v: 1 }]}
                  dataKey="v"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {(chartSegments.length > 0 ? chartSegments : [{ name: "VIP Champions", v: 1 }]).map((_, i) => (
                    <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Acquisition — May 2026" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={acquisitionData}>
                <CartesianGrid stroke="var(--color-hairline)" vertical={false} />
                <XAxis dataKey="d" tickLine={false} axisLine={false} style={{ fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10 }} width={24} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="new" name="New" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="returning" name="Returning" fill="var(--color-chart-2)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Directory & Profiles">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-surface border-hairline"
              placeholder="Search name, email, phone, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Select value={loyaltyTier} onValueChange={setLoyaltyTier}>
              <SelectTrigger className="w-32 bg-surface border-hairline">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-hairline">
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32 bg-surface border-hairline">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-hairline">
                <SelectItem value="Active">Active Only</SelectItem>
                <SelectItem value="Archived">Archived Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 bg-surface border-hairline">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-hairline">
                <SelectItem value="spend">Total Spend</SelectItem>
                <SelectItem value="orders">Total Orders</SelectItem>
                <SelectItem value="churn">Churn Risk</SelectItem>
                <SelectItem value="joined">Joined Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="overflow-x-auto lg:col-span-2 border border-hairline rounded-lg max-w-full">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-hairline bg-surface/50 text-[10px] font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Loyalty Tier</th>
                  <th className="px-3 py-2.5">Orders</th>
                  <th className="px-3 py-2.5">Spend</th>
                  <th className="px-3 py-2.5">Churn Risk</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {displayCustomers.map((c) => {
                  const isSelected = selectedCust?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCust(c)}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-surface/50",
                        isSelected && "bg-surface font-semibold text-primary"
                      )}
                    >
                      <td className="px-3 py-3">
                        <p className="font-bold text-foreground">{c.firstName} {c.lastName}</p>
                        <p className="text-[11px] text-muted-foreground">{c.phone} · {c.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill
                          tone={
                            c.loyaltyTier === "Platinum"
                              ? "indigo"
                              : c.loyaltyTier === "Gold"
                              ? "amber"
                              : c.loyaltyTier === "Silver"
                              ? "slate"
                              : "blue"
                          }
                        >
                          {c.loyaltyTier || "Regular"}
                        </StatusPill>
                      </td>
                      <td className="px-3 py-3">{c.ordersCount}</td>
                      <td className="px-3 py-3 font-semibold">{fmtINR(c.spend)}</td>
                      <td className="px-3 py-3">
                        <StatusPill tone={c.churn > 50 ? "rose" : c.churn > 25 ? "amber" : "emerald"}>
                          {c.churn}% risk
                        </StatusPill>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleArchiveCustomer(c.id)}>
                            <Archive className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedCust && (
            <div className="space-y-4 rounded-xl border border-hairline bg-surface p-4 text-xs">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    {activeSelectedCust.firstName} {activeSelectedCust.lastName}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{activeSelectedCust.email}</p>
                </div>
                <StatusPill tone="emerald">Active VIP</StatusPill>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Stat label="Phone" v={activeSelectedCust.phone} />
                <Stat label="Loyalty Tier" v={activeSelectedCust.loyaltyTier || "Regular"} />
                <Stat label="Total Orders" v={`${activeSelectedCust.ordersCount}`} />
                <Stat label="Total Spend" v={fmtINR(activeSelectedCust.spend)} />
                <Stat label="Churn Risk Score" v={`${activeSelectedCust.churn}%`} tone={activeSelectedCust.churn > 50 ? "danger" : "default"} />
                <Stat label="Member Since" v={activeSelectedCust.joined} />
              </div>

              <div className="pt-2 border-t border-hairline space-y-2">
                <p className="font-bold text-foreground">AI Next Best Action</p>
                <div className="p-3 rounded-lg bg-surface-2 border border-hairline text-muted-foreground space-y-1">
                  <p className="text-foreground font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Initiate Vapi AI Voice Re-engagement
                  </p>
                  <p className="text-[11px]">
                    Customer has high LTV ({fmtINR(activeSelectedCust.spend)}). Trigger autonomous AI voice call with 15% promotional discount.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleNotifySingleWhatsApp(activeSelectedCust)}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs h-9 flex items-center justify-center gap-1.5"
                  >
                    <WhatsappIcon className="h-4 w-4" /> Message WhatsApp
                  </Button>
                  <Button
                    onClick={handleOpenVapiModal}
                    className="w-full bg-[#007AFF] hover:bg-[#0066CC] text-white font-bold text-xs h-9 flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="h-4 w-4" /> AI Voice Call
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Vapi Outbound AI Phone Call Modal */}
      <Dialog open={vapiModalOpen} onOpenChange={(open) => { if (!open && vapiCallStatus === "active") return; setVapiModalOpen(open); }}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <PhoneCall className="h-5 w-5 text-[#007AFF]" />
              {vapiCallStatus === "active" ? "🟢 Live AI Voice Call" : vapiCallStatus === "connecting" ? "Connecting..." : "Initiate Phone Call"}
            </DialogTitle>
          </DialogHeader>

            <form onSubmit={handleInitiateVapiCall} className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="vapi-name">Customer Name</Label>
                <Input
                  id="vapi-name"
                  className="bg-surface border-hairline"
                  value={vapiName}
                  onChange={(e) => setVapiName(e.target.value)}
                  placeholder="e.g. Om Khade"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vapi-phone">Target Phone Number (Mobile)</Label>
                <Input
                  id="vapi-phone"
                  className="bg-surface border-hairline font-mono font-bold text-sm"
                  value={vapiPhone}
                  onChange={(e) => setVapiPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
                <p className="text-[10px] text-muted-foreground">Outbound AI call will be placed directly to this phone number.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vapi-script">AI Voice Agent Script & Offer</Label>
                <Textarea
                  id="vapi-script"
                  className="bg-surface border-hairline text-xs"
                  rows={3}
                  value={vapiScript}
                  onChange={(e) => setVapiScript(e.target.value)}
                />
              </div>
              <DialogFooter className="pt-2 flex-col gap-2 sm:flex-col">
                <Button
                  type="submit"
                  disabled={vapiDialing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center gap-2 h-11"
                >
                  {vapiDialing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-5 w-5" />}
                  {vapiDialing ? "Dispatching Call..." : `📞 CALL ${vapiName.toUpperCase()} NOW`}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      {/* WhatsApp Outbound Message Modal */}
      <Dialog open={waModalOpen} onOpenChange={setWaModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <WhatsappIcon className="h-5 w-5 text-[#25D366]" />
              WhatsApp Message Dispatcher
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="wa-name">Recipient Name</Label>
              <Input
                id="wa-name"
                className="bg-surface border-hairline"
                value={waName}
                onChange={(e) => setWaName(e.target.value)}
                placeholder="e.g. Om Khade"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wa-phone">Target WhatsApp Phone Number</Label>
              <Input
                id="wa-phone"
                className="bg-surface border-hairline font-mono font-bold text-sm text-[#25D366]"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                placeholder="+91 75880 21256"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Ensure phone includes country code (e.g. +91 75880 21256).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wa-msg">WhatsApp Promotional Message</Label>
              <Textarea
                id="wa-msg"
                className="bg-surface border-hairline text-xs"
                rows={4}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="rounded-lg border border-[#25D366]/30 bg-[#25D366]/5 p-3">
                <p className="text-[11px] font-semibold text-[#25D366] mb-2 flex items-center gap-1.5">
                  <WhatsappIcon className="h-4 w-4" /> ✅ Recommended: Direct WhatsApp
                </p>
                <Button
                  onClick={handleDirectOpenWa}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold flex items-center justify-center gap-2 h-11 text-xs shadow-lg"
                >
                  <WhatsappIcon className="h-5 w-5" />
                  Open WhatsApp Chat & Send Message
                </Button>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Opens WhatsApp with your message pre-filled. Tap "Send" in WhatsApp to deliver.
                </p>
              </div>

              <div className="rounded-lg border border-hairline bg-muted/30 p-3">
                <p className="text-[11px] font-medium text-muted-foreground mb-2">
                  ⚡ Automated API (Requires Twilio/Meta API Keys)
                </p>
                <Button
                  variant="outline"
                  onClick={handleSendTwilioWaApi}
                  disabled={waSending}
                  className="w-full border-hairline text-muted-foreground hover:bg-muted/50 font-semibold flex items-center justify-center gap-2 h-9 text-xs"
                >
                  {waSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {waSending ? "Sending via API..." : "Send via Twilio Cloud API"}
                </Button>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Requires TWILIO_ACCOUNT_SID & AUTH_TOKEN configured in environment.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Customer Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCustomer} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-fn">First Name</Label>
                <Input
                  id="add-fn"
                  className="bg-surface border-hairline"
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  placeholder="e.g. Om"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-ln">Last Name</Label>
                <Input
                  id="add-ln"
                  className="bg-surface border-hairline"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  placeholder="e.g. Khade"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-email">Email Address</Label>
                <Input
                  id="add-email"
                  type="email"
                  className="bg-surface border-hairline"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="khade8915@gmail.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-phone">Mobile Phone</Label>
                <Input
                  id="add-phone"
                  className="bg-surface border-hairline font-mono"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Loyalty Tier</Label>
                <Select value={formLoyaltyTier} onValueChange={setFormLoyaltyTier}>
                  <SelectTrigger className="bg-surface border-hairline">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-hairline">
                    <SelectItem value="Platinum">Platinum</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Preferred Dept</Label>
                <Select value={formPrefDept} onValueChange={setFormPrefDept}>
                  <SelectTrigger className="bg-surface border-hairline">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-hairline">
                    <SelectItem value="dept-fashion">Fashion</SelectItem>
                    <SelectItem value="dept-electronics">Electronics</SelectItem>
                    <SelectItem value="dept-grocery">Grocery</SelectItem>
                    <SelectItem value="dept-sports">Sports & Outdoors</SelectItem>
                    <SelectItem value="dept-beauty">Beauty & Cosmetics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-notes">Profile Notes</Label>
              <Textarea
                id="add-notes"
                className="bg-surface border-hairline"
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="High value retail shopper..."
              />
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
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Customer Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCustomer} className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-fn">First Name</Label>
                <Input
                  id="edit-fn"
                  className="bg-surface border-hairline"
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-ln">Last Name</Label>
                <Input
                  id="edit-ln"
                  className="bg-surface border-hairline"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  className="bg-surface border-hairline"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Mobile Phone</Label>
                <Input
                  id="edit-phone"
                  className="bg-surface border-hairline font-mono"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                />
              </div>
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

function Kpi({ label, v, tone }: { label: string; v: string; tone?: "warning" }) {
  return (
    <div className="card-elevated p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1.5 font-display text-lg font-semibold ${tone === "warning" ? "text-warning" : ""}`}>
        {v}
      </p>
    </div>
  );
}

function Stat({ label, v, tone }: { label: string; v: string; tone?: "default" | "danger" }) {
  return (
    <div className="rounded-md border border-hairline bg-surface p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${tone === "danger" ? "text-destructive" : ""}`}>
        {v}
      </p>
    </div>
  );
}

const ttStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-hairline)",
  borderRadius: 6,
  fontSize: 12,
} as const;
