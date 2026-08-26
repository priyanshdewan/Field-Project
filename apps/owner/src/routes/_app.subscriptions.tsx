import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Sparkles,
  Check,
  HelpCircle,
  Calculator,
  ArrowRight,
  TrendingUp,
  Clock,
  Building,
} from "lucide-react";
import { PageHeader, SectionCard, StatusPill } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscription Plans & Pricing — Bizora AI" },
      { name: "description", content: "Choose the right SaaS package for your store size." },
    ],
  }),
  component: OwnerSubscriptionsPage,
});

export function OwnerSubscriptionsPage() {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [billsPerMonth, setBillsPerMonth] = useState<number>(1200);
  const [avgBillValue, setAvgBillValue] = useState<number>(450);

  // Profit ROI calculations
  const monthlyRevenue = billsPerMonth * avgBillValue;
  const timeSavedHours = Math.round((billsPerMonth * 1.5) / 60); // 1.5 min saved per bill
  const estimatedProfitIncrease = Math.round(monthlyRevenue * 0.08); // 8% profit margin boost via stock leak prevention

  const handleSelectPlan = (planId: string, planName: string) => {
    setSelectedPlan(planId);
    toast.success(`Upgraded store to ${planName} Plan!`, {
      description: "Your workspace quotas have been updated instantly.",
    });
  };

  const PLANS = [
    {
      id: "starter",
      name: "Starter / Kirana",
      desc: "Perfect for single-counter Kirana stores and new shopkeepers.",
      monthlyPrice: 0,
      yearlyPrice: 0,
      badge: "Free Forever",
      color: "border-hairline bg-card",
      features: [
        "Receipt POS Billing & Thermal Print",
        "Hardware-Free Camera Barcode Scanning",
        "Up to 200 Products & Stock Tracking",
        "2 Languages (English & Hindi)",
        "Manual WhatsApp Receipt Share",
        "1 User Account",
        "Standard Reports",
      ],
      disabled: [
        "Automated WhatsApp Digital Dispatch",
        "Vapi AI Voice Reordering Calls",
        "Gemini AI Decision Intelligence",
        "Multi-Store Branch Control",
      ],
    },
    {
      id: "growth",
      name: "Growth / Retailer",
      desc: "For busy supermarkets, electronics, apparel & high-volume retail.",
      monthlyPrice: 699,
      yearlyPrice: 6999,
      badge: "MOST POPULAR",
      popular: true,
      color: "border-primary bg-primary/5 shadow-xl shadow-primary/10",
      features: [
        "Unlimited POS Billing & Fast Checkout",
        "Camera & Hardware Barcode Gun Support",
        "Unlimited Products & FIFO Batch Control",
        "12 Indian Regional Languages",
        "500 Automated WhatsApp Receipts/mo",
        "Double-Entry Accounting & P&L",
        "10 Vapi AI Hindi Voice Calls/mo",
        "100 Gemini AI Decision Queries/mo",
        "3 Staff User Accounts",
      ],
      disabled: ["Multi-Store Branch Control"],
    },
    {
      id: "enterprise",
      name: "Enterprise Chain",
      desc: "For multi-branch supermarket chains, franchises & large distributors.",
      monthlyPrice: 1999,
      yearlyPrice: 18999,
      badge: "ULTIMATE SUITE",
      color: "border-violet bg-violet/5",
      features: [
        "Multi-Store Branch Workspace Control",
        "Unlimited POS Billing & Thermal Print",
        "10 Staff User Accounts & Roles",
        "12 Indian Regional Languages",
        "Unlimited Automated WhatsApp Receipts",
        "100 Vapi AI Hindi Voice Call Mins/mo",
        "Unlimited Gemini AI Decision Queries",
        "24/7 Proactive 5-Min System Health Alerting",
        "Dedicated Super Admin Priority Support",
      ],
      disabled: [],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="SaaS Subscription Packages & Growth Plans"
        subtitle="Select a modular plan tailored to your store size. Upgrade anytime with zero setup fees."
      />

      {/* Monthly / Yearly Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-xs font-bold ${!isYearly ? "text-foreground font-extrabold" : "text-muted-foreground"}`}>
          Monthly Billing
        </span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary/20 transition-colors focus:outline-none"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-primary transition-transform ${
              isYearly ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold ${isYearly ? "text-foreground font-extrabold" : "text-muted-foreground"}`}>
            Yearly Billing
          </span>
          <span className="rounded-full bg-success/15 border border-success/30 px-2 py-0.5 text-[10px] font-extrabold text-success uppercase tracking-wider">
            SAVE 20%
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-6 border transition-all ${plan.color} ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md ${
                    plan.popular
                      ? "gradient-primary text-primary-foreground"
                      : "bg-surface border border-hairline text-foreground"
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="font-display text-xl font-extrabold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{plan.desc}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-foreground">
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {price === 0 ? "forever" : isYearly ? "/year" : "/month"}
                  </span>
                </div>

                <div className="mt-6 space-y-2.5 hairline-t pt-6">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">What's Included</p>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium">{feat}</span>
                    </div>
                  ))}

                  {plan.disabled.length > 0 && (
                    <div className="pt-2 space-y-2">
                      {plan.disabled.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs opacity-50">
                          <span className="h-4 w-4 shrink-0 text-center font-bold">✕</span>
                          <span className="line-through text-muted-foreground">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={() => handleSelectPlan(plan.id, plan.name)}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full font-bold text-xs ${
                    isSelected ? "gradient-primary text-primary-foreground shadow-lg" : ""
                  }`}
                >
                  {isSelected ? "Current Active Plan" : "Choose " + plan.name}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Profit & Time Saved ROI Calculator */}
      <SectionCard title="🧮 Shopkeeper Profit ROI Calculator">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 space-y-4">
            <div>
              <Label className="text-xs font-bold">Estimated Monthly Bills / Customers</Label>
              <Input
                type="number"
                value={billsPerMonth}
                onChange={(e) => setBillsPerMonth(Number(e.target.value) || 0)}
                className="mt-1 font-mono font-bold"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Average Bill Amount (₹)</Label>
              <Input
                type="number"
                value={avgBillValue}
                onChange={(e) => setAvgBillValue(Number(e.target.value) || 0)}
                className="mt-1 font-mono font-bold"
              />
            </div>
          </div>

          <div className="md:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-success/10 border border-success/20 text-center">
              <TrendingUp className="h-6 w-6 text-success mx-auto mb-1" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estimated Monthly Profit Boost</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-success">
                +₹{estimatedProfitIncrease.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">via stock leakage & loss prevention</p>
            </div>

            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
              <Clock className="h-6 w-6 text-primary mx-auto mb-1" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Monthly Hours Saved</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-primary">
                ~{timeSavedHours} Hours
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">saved in manual checkout & ledgering</p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
