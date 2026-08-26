import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Gift,
  Truck,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Star,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useBusinessData } from "@/lib/business-context";

export const Route = createFileRoute("/_app/customer-portal")({
  head: () => ({
    meta: [
      { title: "Customer Dashboard | Bizora" },
      {
        name: "description",
        content: "Personal customer dashboard: orders, loyalty points, wallet, returns, and rewards.",
      },
    ],
  }),
  component: CustomerPortal,
});

function CustomerPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock active user profile data
  const profile = useMemo(() => ({
    walletBalance: 24500,
    loyaltyPoints: 1250,
    membershipTier: "VIP Gold",
    supportTickets: 1,
  }), []);

  // Filter only transactions belonging to the current user (using Aditi Joshi as mock context)
  const orders = useMemo(() => [
    {
      id: "TXN-20260505001",
      date: "2026-05-05",
      time: "14:20",
      items: [
        { name: "Amul Taaza Milk 1L", quantity: 2, price: 68 },
        { name: "Amul Butter 500g", quantity: 1, price: 265 }
      ],
      total: 401,
      payment: "UPI",
      status: "Completed"
    },
    {
      id: "TXN-20260504003",
      date: "2026-05-04",
      time: "18:45",
      items: [
        { name: "Levi's 511 Slim Jeans", quantity: 1, price: 3499 },
        { name: "HP LaserJet Printer", quantity: 1, price: 16999 }
      ],
      total: 20498,
      payment: "Card",
      status: "Completed"
    },
    {
      id: "TXN-20260502012",
      date: "2026-05-02",
      time: "11:15",
      items: [
        { name: "Nescafé Gold 200g", quantity: 2, price: 649 }
      ],
      total: 1298,
      payment: "Wallet",
      status: "Completed"
    }
  ], []);

  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return toast.error("Please write your feedback.");
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Feedback submitted successfully! Thank you for helping us improve.");
      setFeedback("");
      setRating(5);
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome Back, ${user?.name || "Customer"}`}
        subtitle="View your orders, manage your loyalty rewards, and access dedicated customer support."
        actions={
          <Button onClick={() => navigate({ to: "/command-center" })} variant="outline">
            Exit Portal <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label="Wallet Balance"
          value={profile.walletBalance}
          icon={<CreditCard className="h-4 w-4" />}
          trend={{ value: 15, isPositive: true }}
          format="currency"
        />
        <KpiCard
          label="Loyalty Points"
          value={profile.loyaltyPoints}
          icon={<Gift className="h-4 w-4" />}
          trend={{ value: 120, isPositive: true }}
        />
        <KpiCard
          label="Membership Tier"
          value={profile.membershipTier}
          icon={<Star className="h-4 w-4 text-yellow-500" />}
          trend={{ value: 0, isPositive: true }}
          format="string"
        />
        <KpiCard
          label="Active Tickets"
          value={profile.supportTickets}
          icon={<HelpCircle className="h-4 w-4" />}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders list */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Recent Orders" subtitle="Track your recent purchase history and invoices">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Items</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs">{o.id}</td>
                      <td className="p-3">{o.date} <span className="text-muted-foreground text-xs">{o.time}</span></td>
                      <td className="p-3 max-w-[250px] truncate">
                        {o.items.map(it => `${it.name} (x${it.quantity})`).join(", ")}
                      </td>
                      <td className="p-3 text-right font-medium">{o.total.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</td>
                      <td className="p-3 text-center">
                        <StatusPill status={o.status === "Completed" ? "ok" : "warn"} label={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Feedback & AI support */}
        <div className="space-y-6">
          <SectionCard title="Give Feedback" subtitle="Tell us about your shopping experience">
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Feedback Message</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what we can improve..."
                  rows={4}
                  className="w-full p-2 rounded-md border bg-background text-sm focus:ring-primary focus:border-primary"
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </SectionCard>

          <SectionCard title="AI Rewards Helper" subtitle="Bizora AI recommendations for you">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Special AI Offer Available</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You are 250 points away from unlocking **Platinum Tier** membership! Buy any product from the **Electronics** department today to earn double loyalty points.
              </p>
              <Button size="sm" className="w-full text-xs">
                View Electronics Catalog
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
