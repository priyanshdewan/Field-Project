import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck,
  Package,
  CheckCircle2,
  PhoneCall,
  CreditCard,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Supplier & Vendor Network | Bizora" },
      {
        name: "description",
        content:
          "Manage purchase orders, delivery dispatches, SLA ratings, and settlement payments.",
      },
    ],
  }),
  component: SupplierLandingPage,
});

function SupplierLandingPage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[520px] w-[520px] animate-pulse-slow rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[520px] w-[520px] animate-pulse-slow rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(var(--color-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 sm:px-10 sm:py-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Bizora Supplier Network</p>
              <p className="text-[10px] text-muted-foreground">Vendor Operations & PO Fulfillment</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/30 transition-all"
            >
              Supplier Login <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-16 pb-20 text-center sm:px-10 sm:pt-24 sm:pb-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-emerald-400">
            <ShieldCheck className="h-3 w-3" /> Procurement & Supply Chain Network
          </p>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Inbound PO fulfillment & <span className="gradient-text">logistics dispatch</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Accept corporate purchase requests, log delivery vehicle ETAs, receive automated voice reorder calls, and review payment settlements.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-500"
            >
              Sign In to Supplier Portal <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Sign in with <code className="rounded bg-surface px-1.5 py-0.5 text-foreground">supplier@gmail.com</code> / password <code className="rounded bg-surface px-1.5 py-0.5 text-foreground">123456789</code>
          </p>
        </section>

        {/* Features grid */}
        <section className="mx-auto max-w-5xl px-6 pb-24 sm:px-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Package,
                title: "Purchase Orders (POs)",
                desc: "Review and accept corporate purchase requests with unit cost breakdowns.",
              },
              {
                icon: Truck,
                title: "Logistics & Dispatches",
                desc: "Log delivery vehicle dispatch status and estimated arrival times (ETAs).",
              },
              {
                icon: PhoneCall,
                title: "Vapi AI Voice Outreach",
                desc: "Receive automated Indian Hindi voice calls for emergency inventory reorders.",
              },
              {
                icon: CreditCard,
                title: "Payment Settlements",
                desc: "Track invoice payment statuses and general ledger settlement receipts.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group glass rounded-xl border border-hairline p-6 transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-hairline bg-surface/30 py-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 Bizora Supplier Network · Procurement & Vendor Logistics
          </p>
        </footer>
      </div>
    </div>
  );
}
