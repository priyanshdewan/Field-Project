import { BizoraLogo } from "@/components/bizora-logo";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ShoppingBag, Store, Zap, Truck, Loader2, ArrowLeft, UserCheck, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { z } from "zod";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => loginSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Buy From Nearby Stores — Bizora Customer" },
      {
        name: "description",
        content: "Buy groceries & daily items from your nearest local shops with 10-minute delivery.",
      },
    ],
  }),
  component: CustomerLoginPage,
});

function CustomerLoginPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const getRedirectTarget = (u?: any) => {
    const activeUser = u || user;
    if (!redirect) {
      if (activeUser?.isSystemAdmin) {
        return "/system-admin";
      }
      return "/customer-portal";
    }
    try {
      const url = new URL(redirect);
      return url.pathname + url.search;
    } catch {
      return redirect;
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter your email");
    setSubmitting(true);
    try {
      const loggedIn = await login(email, pass);
      toast.success("Welcome! Showing items from your nearest local stores.");
      navigate({ to: getRedirectTarget(loggedIn) });
    } catch (err: any) {
      toast.error(err.message || "Customer login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail("customer@gmail.com");
    setPass("123456789");
    toast.info("Loaded demo shopper credentials");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Back button */}
      <div className="absolute left-6 top-6 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-amber-600/15 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-orange-600/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(var(--color-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left: Simple Local Storefront Story */}
        <div className="hidden flex-col justify-between p-10 lg:flex xl:p-14 border-r border-border/40 bg-amber-950/10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-foreground">Bizora Local Storefront</p>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Nearby Shopkeeper Delivery</p>
            </div>
          </div>

          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Zap className="h-3.5 w-3.5" /> 🛍️ LOCAL NEIGHBORHOOD STOREFRONT
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-5xl">
              Buy Daily Essentials From <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Your Nearest Local Shops</span>.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Order milk, butter, groceries, electronics & daily products directly from shopkeepers in your area. First available store accepts and delivers in 10 minutes!
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: Store, label: "Nearest Local Shops" },
                { icon: Zap, label: "10-Min Fast Delivery" },
                { icon: Truck, label: "Live Order Tracking" },
              ].map((f) => (
                <div key={f.label} className="glass rounded-xl p-3.5 border border-amber-500/20 bg-amber-500/5">
                  <f.icon className="h-4 w-4 text-amber-400" />
                  <p className="mt-2 text-xs font-semibold text-foreground">{f.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-4">
            <span>Bizora Hyperlocal Shopping Hub</span>
            <span className="font-medium text-amber-400">customer@gmail.com</span>
          </div>
        </div>

        {/* Right: Customer Sign In Form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500 text-slate-950">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Bizora Local</p>
                <p className="text-xs text-amber-400">Shop Near You</p>
              </div>
            </div>

            <div className="card-elevated p-6 sm:p-8 border border-amber-500/20 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Customer Sign In</h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Local Storefront
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sign in to order items from local shops near your address.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleFormLogin}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Customer Email / Phone</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show ? "text" : "password"}
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      className="bg-background pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" defaultChecked />
                  <Label htmlFor="remember" className="text-xs text-muted-foreground">
                    Remember me on this device
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Explore Nearest Stores & Shop Now
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-muted-foreground">
                New shopper?{" "}
                <Link to="/register" className="text-amber-400 hover:underline font-semibold">
                  Create Shopper Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
