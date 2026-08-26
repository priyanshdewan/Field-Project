import { BizoraLogo } from "@/components/bizora-logo";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ShieldAlert, Loader2, Building2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      { title: "Super Admin Console Sign In | Bizora" },
      {
        name: "description",
        content: "Sign in to Bizora Super Admin Portal to manage registered shopkeepers and company approvals.",
      },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter your admin email");
    setSubmitting(true);
    try {
      await login(email, pass);
      toast.success("Authorized Super Admin Console");
      navigate({ to: "/system-admin", replace: true });
    } catch (err: any) {
      toast.error(err.message || "Super admin login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("khade8915@gmail.com");
    setPass("123456789");
    toast.info("Loaded Super Admin credentials");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-rose-600/15 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(var(--color-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left: Super Admin Brand Story */}
        <div className="hidden flex-col justify-between p-10 lg:flex xl:p-14 border-r border-border/40 bg-rose-950/10">
          <BizoraLogo variant="admin" size="lg" />

          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Building2 className="h-3.5 w-3.5" /> 🛡️ SHOPKEEPER & COMPANY APPROVALS
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-5xl">
              Super Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-violet-400">Management Console</span>.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Sign in to review newly registered shopkeepers, approve or reject company onboarding requests, adjust store branch limits, and monitor platform health.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-4">
            <span>Platform Super Admin</span>
            <span className="font-medium text-muted-foreground font-mono">Platform Admin</span>
          </div>
        </div>

        {/* Right: Sign In Form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="card-elevated p-6 sm:p-8 border border-rose-500/20 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Super Admin Sign In</h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Super Admin
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sign in to approve registered shopkeepers & manage store tenants.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleFormLogin}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Super Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@company.com"
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

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/20"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Sign In to Shopkeeper Approval Console
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
