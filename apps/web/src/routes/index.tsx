import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Zap,
  ShieldCheck,
  BarChart3,
  Users,
  Brain,
  ArrowRight,
  ChevronRight,
  ShoppingCart,
  Package,
  Receipt,
  Phone,
  MessageSquare,
  Globe,
  Camera,
  CheckCircle2,
  HelpCircle,
  Building2,
  Store,
  Check,
  Star,
  Activity,
  HardDrive,
  CreditCard,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { BizoraLogo } from "@/components/bizora-logo";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bizora AI — All-in-One POS Billing, Stock & AI Business OS" },
      {
        name: "description",
        content:
          "India's leading AI Business OS for Retail Stores, Supermarkets & Franchises. POS billing, barcode scanning, 12 regional languages, Vapi AI voice calls, and automated WhatsApp receipts.",
      },
    ],
  }),
  component: RichLandingPage,
});

function RichLandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem("bizora-promo-dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShowPromo(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, []);

  const closePromo = () => {
    setShowPromo(false);
    try {
      sessionStorage.setItem("bizora-promo-dismissed", "true");
    } catch (e) {}
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const nowDark = html.classList.contains("dark");
    if (nowDark) {
      html.classList.remove("dark");
      localStorage.setItem("bizora-theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("bizora-theme", "dark");
      setIsDark(true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Vyapar-Style High-Converting Conversion Pop-Up Modal */}
      {showPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-50">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-rose-500/40 bg-card shadow-2xl animate-in zoom-in-95">
            {/* Close Button */}
            <button
              onClick={closePromo}
              className="absolute right-3.5 top-3.5 z-20 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-foreground hover:bg-background border border-hairline transition-colors shadow-md"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Left Side Highlight Banner */}
              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-extrabold uppercase tracking-wider mb-3">
                    <Sparkles className="h-3.5 w-3.5" /> High-Profit Store Upgrade
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                    Still Making Paper Bills?
                  </h3>
                  <h4 className="font-display text-xl sm:text-2xl font-extrabold text-primary mt-1">
                    Switch to Bizora AI OS
                  </h4>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">93% of retailers</strong> report <strong className="text-success font-bold">5X higher profits & 75% faster checkout</strong> after switching to Bizora AI!
                  </p>
                </div>

                <div className="flex items-center justify-around border-y border-hairline py-3">
                  <div className="text-center">
                    <p className="font-display text-base sm:text-lg font-extrabold text-foreground">10,000+</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Happy Stores</p>
                  </div>
                  <div className="h-8 w-px bg-hairline" />
                  <div className="text-center">
                    <div className="flex items-center justify-center text-amber-500 text-xs font-bold gap-0.5">
                      4.9 <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">Store Reviews</p>
                  </div>
                  <div className="h-8 w-px bg-hairline" />
                  <div className="text-center">
                    <p className="font-display text-base sm:text-lg font-extrabold text-indigo-500">12</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Languages</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    to="/register"
                    onClick={closePromo}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-xl hover:opacity-95 transition-all hover:scale-[1.01]"
                  >
                    Start Free Store Registration <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-[10px] text-center text-muted-foreground font-medium">
                    ⚡ No hardware gun required · Camera Barcode Scanning
                  </p>
                </div>
              </div>

              {/* Right Side Visual Contrast Graphic */}
              <div className="hidden md:col-span-5 md:flex flex-col justify-between p-6 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-indigo-500/10 border-l border-hairline relative">
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-card/90 border border-hairline shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Old Paper Bill Book</p>
                    <p className="text-xs text-destructive font-semibold mt-1">❌ Slow manual bills, lost stock & no tracking</p>
                  </div>

                  <div className="flex justify-center text-rose-500 font-extrabold text-xl animate-bounce">⚡ ➔ ⚡</div>

                  <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 shadow-md">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">✨ Bizora AI Operating System</p>
                    <p className="text-xs text-success font-bold mt-1">✅ Camera Scanner, WhatsApp Bills & Hindi Voice AI</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-hairline flex justify-center">
                  <BizoraLogo variant="owner" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Subtle Background Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-violet/10 blur-[140px]" />
        <div className="absolute left-1/4 bottom-0 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(var(--color-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative z-10">
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 border-b border-hairline bg-background/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
            <BizoraLogo variant="owner" size="md" />

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <LanguageSelector />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8 text-muted-foreground"
                title="Toggle Theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {user ? (
                <Button
                  onClick={() => navigate({ to: "/command-center" })}
                  className="gradient-primary text-primary-foreground font-semibold gap-1 text-xs h-8 px-2.5 sm:px-4 shrink-0"
                >
                  <span className="hidden sm:inline">Go to Command Center</span>
                  <span className="sm:hidden">Command Center</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 rounded-lg border border-hairline bg-surface px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-surface-2 transition-all h-8"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all h-8"
                  >
                    <span className="hidden sm:inline">Register Store</span>
                    <span className="sm:hidden">Register</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-16 text-center sm:px-6 sm:pt-20 sm:pb-24 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-6">
            <Sparkles className="h-3.5 w-3.5" /> 🇮🇳 India's Premier AI Business Operating System
          </div>

          <h1 className="font-display text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
            Simplify POS Billing, Stock Control & Accounting with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600">
              AI Decision Intelligence
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
            Replace 5 disconnected billing & ledger apps with one unified platform. Engineered for Supermarkets, Grocery Stores, Retail Chains, Pharmacies, and Multi-Store Franchises.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-[1.02]"
            >
              Register Your Business Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-surface px-7 py-3.5 text-sm font-bold text-foreground hover:bg-surface-2 transition-all"
            >
              Storekeeper Sign In <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Quick Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Hardware-Free Camera Scanner</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> 12 Indian Regional Languages</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Automated WhatsApp Receipts</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Vapi AI Hindi Voice Assistant</span>
          </div>
        </section>

        {/* Live Metrics Proof Bar */}
        <section className="border-y border-hairline bg-surface/50 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
              <div className="p-4 rounded-xl border border-hairline bg-card">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-primary">10,000+</p>
                <p className="mt-1 text-xs text-muted-foreground font-medium">Active Stores & Retailers</p>
              </div>
              <div className="p-4 rounded-xl border border-hairline bg-card">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-success">₹500Cr+</p>
                <p className="mt-1 text-xs text-muted-foreground font-medium">Monthly Bills Processed</p>
              </div>
              <div className="p-4 rounded-xl border border-hairline bg-card">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-warning">12</p>
                <p className="mt-1 text-xs text-muted-foreground font-medium">Indian Regional Languages</p>
              </div>
              <div className="p-4 rounded-xl border border-hairline bg-card">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-info">99.9%</p>
                <p className="mt-1 text-xs text-muted-foreground font-medium">Uptime & Live 5-Min Health</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comprehensive Core Modules (Vyapar-Style Feature Showcase) */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">COMPLETE RETAIL SUITE</h2>
            <p className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
              Everything Your Business Needs to Grow & Scale
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Powerful modules built to digitize sales, streamline procurement, automate customer engagement, and maximize profit margins.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ShoppingCart,
                title: "High-Speed POS Checkout",
                desc: "Process customer bills in under 5 seconds with thermal printer support, multi-payment options (UPI, Cash, Card), and automated GST calculations.",
                badge: "POS Terminal",
                color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
              },
              {
                icon: Camera,
                title: "Camera Barcode Scanner",
                desc: "No expensive hardware barcode gun needed! Use any smartphone or laptop webcam to scan barcodes instantly using browser BarcodeDetector API.",
                badge: "Hardware-Free",
                color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
              },
              {
                icon: MessageSquare,
                title: "Automated WhatsApp Invoicing",
                desc: "Send digital POS bills, payment receipts, low-stock warnings, and purchase orders directly to customer and supplier WhatsApp numbers.",
                badge: "Twilio API",
                color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
              },
              {
                icon: Phone,
                title: "Vapi AI Hindi Voice Assistant",
                desc: "Outbound AI voice calls to suppliers in natural Indian Hindi (hi-IN-SwaraNeural) to reorder low-stock inventory automatically.",
                badge: "Voice AI",
                color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
              },
              {
                icon: Globe,
                title: "12 Indian Regional Languages",
                desc: "Native UI translation into Hindi, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Bengali, Punjabi, Odia, Assamese, and English.",
                badge: "Localization",
                color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
              },
              {
                icon: Package,
                title: "Smart Inventory & Stock Control",
                desc: "Track stock levels across store branches in real-time with FIFO batch management, expiry date warnings, and automated reorder alerts.",
                badge: "Stock Ledger",
                color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
              },
              {
                icon: Receipt,
                title: "Double-Entry Accounting GL",
                desc: "Full general ledger accounting, real-time Profit & Loss statements, balance sheets, expense tracking, and GST tax reports.",
                badge: "Accounting",
                color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
              },
              {
                icon: Activity,
                title: "Automated 5-Min System Health",
                desc: "Proactive background health checks every 5 minutes that trigger instant email alert reports to admins if database or latency issues occur.",
                badge: "24/7 Monitor",
                color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
              },
              {
                icon: ShieldCheck,
                title: "Multi-Tenant Data Isolation",
                desc: "Super Admin approval queue for store onboarding with 100% private and isolated workspace databases for each business tenant.",
                badge: "Enterprise Security",
                color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group card-elevated p-6 border border-hairline hover:border-primary/40 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${feature.color}`}>
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Comparison Matrix: Bizora AI vs Traditional Software */}
        <section className="border-t border-hairline bg-surface/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary">THE BIZORA AI ADVANTAGE</h2>
              <p className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
                Why Retailers are Switching to Bizora AI
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                See how Bizora AI compares to traditional legacy billing software and basic book-keeping apps.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-hairline bg-card shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-hairline bg-surface/80">
                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Features</th>
                    <th className="p-4 font-bold text-primary text-sm">✨ Bizora AI OS</th>
                    <th className="p-4 font-semibold text-muted-foreground">Vyapar / Khatabook</th>
                    <th className="p-4 font-semibold text-muted-foreground">Tally / Legacy Desktop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {[
                    { feature: "AI Voice Agent Reordering (Hindi)", bizora: true, alt1: false, alt2: false },
                    { feature: "Automated WhatsApp Digital Receipts", bizora: true, alt1: "Manual", alt2: false },
                    { feature: "12 Indian Regional Languages", bizora: true, alt1: "Limited", alt2: false },
                    { feature: "Camera Barcode Scanner (Web API)", bizora: true, alt1: false, alt2: false },
                    { feature: "Automated 5-Min Server Health Check", bizora: true, alt1: false, alt2: false },
                    { feature: "Multi-Store Cloud Synchronization", bizora: true, alt1: false, alt2: "Extra Cost" },
                    { feature: "Zero Hardware Gun Required", bizora: true, alt1: false, alt2: false },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface/40 transition-colors">
                      <td className="p-4 font-semibold text-foreground">{row.feature}</td>
                      <td className="p-4 font-bold text-success flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-success" /> Included Native
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {typeof row.alt1 === "boolean" ? (row.alt1 ? "Yes" : "❌ No") : row.alt1}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {typeof row.alt2 === "boolean" ? (row.alt2 ? "Yes" : "❌ No") : row.alt2}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Business Type Compatibility */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">TAILORED FOR YOUR INDUSTRY</h2>
            <p className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
              Built for Every Type of Business
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-center">
            {[
              { title: "Supermarkets", icon: Store },
              { title: "Electronics", icon: HardDrive },
              { title: "Apparel & Shoes", icon: ShoppingCart },
              { title: "Pharmacies", icon: ShieldCheck },
              { title: "Hardware", icon: Package },
              { title: "Multi-Franchise", icon: Building2 },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-hairline bg-card hover:border-primary/40 transition-all flex flex-col items-center gap-2">
                <item.icon className="h-6 w-6 text-primary" />
                <span className="font-semibold text-xs text-foreground">{item.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="border-t border-hairline bg-surface/30 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary">FREQUENTLY ASKED QUESTIONS</h2>
              <p className="mt-2 font-display text-3xl font-extrabold">Got Questions? We Have Answers.</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "Do I need to buy expensive barcode scanning hardware?",
                  a: "No! Bizora AI features an integrated Camera Barcode Scanner utilizing browser BarcodeDetector API. You can scan barcodes directly using your laptop webcam or smartphone camera.",
                },
                {
                  q: "How does automated WhatsApp billing work?",
                  a: "When a checkout is completed at POS, the system automatically dispatches a digital PDF receipt via Twilio WhatsApp API directly to the customer's phone number.",
                },
                {
                  q: "Can I switch the app interface to my native Indian regional language?",
                  a: "Yes! Bizora AI supports 12 Indian regional languages including Hindi, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Bengali, Punjabi, Odia, Assamese, and English.",
                },
                {
                  q: "How does the automated 5-minute health check work?",
                  a: "Our backend continuously tests database connectivity and response latency every 5 minutes. If an issue occurs, a detailed HTML report is emailed to the super admin immediately.",
                },
              ].map((faq, idx) => (
                <div key={idx} className="rounded-xl border border-hairline bg-card overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${activeFaq === idx ? "rotate-90" : ""}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-hairline bg-surface/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* High-Converting CTA Footer Banner */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl gradient-primary p-8 sm:p-12 text-center text-primary-foreground shadow-2xl relative overflow-hidden">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Ready to Digitize Your Store Operations?
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-xs sm:text-sm opacity-90">
              Join thousands of retail business owners across India. Register your store in under 2 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-primary font-bold text-sm shadow-xl hover:bg-white/90 transition-all"
              >
                Register Business Now
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-all"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-hairline bg-card py-8 text-center text-xs text-muted-foreground">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <BizoraLogo variant="owner" size="sm" />
            <p>© 2026 Bizora AI · Enterprise Decision Intelligence & Business OS</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
