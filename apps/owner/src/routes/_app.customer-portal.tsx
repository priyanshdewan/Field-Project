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
import { fmtINR } from "@/lib/mock-data";

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
  const { transactions } = useBusinessData();

  const userTxns = useMemo(() => {
    if (!transactions) return [];
    if (!user) return [];
    return transactions.filter(
      (t) =>
        t.customerName?.toLowerCase() === user.name?.toLowerCase() ||
        t.customerPhone === user.phone
    );
  }, [transactions, user]);

  const profile = useMemo(() => {
    const totalSpent = userTxns.reduce((sum, t) => sum + (t.total || 0), 0);
    const points = Math.floor(totalSpent / 10);
    const tier = points > 1000 ? "VIP Gold" : points > 500 ? "Silver Member" : "Standard Member";

    return {
      walletBalance: 0,
      loyaltyPoints: points,
      membershipTier: tier,
      supportTickets: 0,
    };
  }, [userTxns]);

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
          format="inr-compact"
        />
        <KpiCard
          label="Loyalty Points"
          value={profile.loyaltyPoints}
          icon={<Gift className="h-4 w-4" />}
          format="num"
        />
        <KpiCard
          label="Membership Tier"
          value={profile.membershipTier}
          icon={<Star className="h-4 w-4 text-yellow-500" />}
          format="string"
        />
        <KpiCard
          label="Active Tickets"
          value={profile.supportTickets}
          icon={<HelpCircle className="h-4 w-4" />}
          format="num"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders list */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Recent Orders" subtitle="Track your recent purchase history and invoices">
            {userTxns.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No recent purchase orders recorded for your customer profile.
              </div>
            ) : (
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
                    {userTxns.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{o.id}</td>
                        <td className="p-3">
                          {o.date}{" "}
                          <span className="text-muted-foreground text-xs">{o.time}</span>
                        </td>
                        <td className="p-3 max-w-[250px] truncate">
                          {(o.items || []).map((it: any) => `${it.name || it.productName} (x${it.quantity})`).join(", ")}
                        </td>
                        <td className="p-3 text-right font-medium">{fmtINR(o.total)}</td>
                        <td className="p-3 text-center">
                          <StatusPill tone={o.status === "Completed" ? "success" : "warning"}>
                            {o.status}
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
        </div>
      </div>
    </div>
  );
}
