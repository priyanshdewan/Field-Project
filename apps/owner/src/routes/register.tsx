"use client";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, Loader2, CheckCircle2, ChevronRight, Building, User, MapPin, Briefcase, Lock, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { registerCompanyServer } from "@/lib/server-registration";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { GoogleMapsPicker } from "@/components/google-maps-picker";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register Company | Bizora" },
      {
        name: "description",
        content: "Register your enterprise for Bizora AI.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Google Pre-Fill Modal state
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");

  // Terms & Privacy Modal state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Company
    companyName: "",
    businessType: "Retail Shop / Store",
    industry: "Retail",
    gstNumber: "",
    companyWebsite: "",
    // Owner
    ownerName: "",
    ownerEmail: "",
    mobileNumber: "",
    designation: "CEO / Owner",
    // Address
    country: "India",
    state: "",
    city: "",
    address: "",
    // Business
    employeeCount: "1-5",
    branchCount: "1",
    revenueRange: "Under 10L",
    timezone: "Asia/Kolkata",
    currency: "INR",
    // Security
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const parseGoogleJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleGooglePreFillSelect = (gEmail: string, gName?: string) => {
    const cleanEmail = (gEmail || "").toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return toast.error("Please enter a valid Google email address");
    }
    const cleanName = gName || cleanEmail.split("@")[0].replace(/[^a-zA-Z]/g, " ") || "Store Owner";
    setFormData((prev) => ({
      ...prev,
      ownerEmail: cleanEmail,
      ownerName: cleanName,
    }));
    setGoogleModalOpen(false);
    toast.success(`Pre-filled owner details from Google: ${cleanEmail}`);
  };

  const handleGooglePreFill = () => {
    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId && typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            if (response?.credential) {
              const profile = parseGoogleJwt(response.credential);
              if (profile?.email) {
                handleGooglePreFillSelect(profile.email, profile.name);
                return;
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setGoogleModalOpen(true);
          }
        });
        return;
      } catch (err) {
        console.warn("[Google GIS Error]", err);
      }
    }
    setGoogleModalOpen(true);
  };

  const handleAddressFromMap = (fullAddr: string, details?: { city?: string; state?: string; country?: string }) => {
    setFormData((prev) => ({
      ...prev,
      address: fullAddr,
      city: details?.city || prev.city || "",
      state: details?.state || prev.state || "",
      country: details?.country || prev.country || "",
    }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.companyName) return toast.error("Company Name is required");
    if (step === 2 && (!formData.ownerName || !formData.ownerEmail)) return toast.error("Owner Name and Email are required");
    if (step === 3 && (!formData.city || !formData.state)) return toast.error("City and State are required");
    setStep((s) => Math.min(s + 1, 5));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      return toast.error("You must accept the Terms of Service and Privacy Policy");
    }

    setSubmitting(true);
    try {
      const cleanEmail = (formData.ownerEmail || "").toLowerCase().trim();
      const wsId = `ws_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
      if (typeof window !== "undefined") {
        localStorage.setItem(`bizora_company_name_${wsId}`, formData.companyName);
        localStorage.setItem(`bizora_store_industry_${wsId}`, formData.businessType);
      }

      await registerCompanyServer({ data: formData });
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="card-elevated w-full max-w-md p-8 text-center border border-amber-500/30">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-semibold text-foreground">Store Registration Submitted</h2>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>
              Your store <strong className="text-foreground">{formData.companyName}</strong> has been registered and is currently <span className="text-amber-400 font-semibold">Pending Admin Approval</span>.
            </p>
            <p className="text-xs bg-surface p-3 rounded-lg border border-hairline mt-3">
              🛡️ The Super Admin has been notified. Access will be unlocked as soon as your store is verified and approved in the System Admin dashboard.
            </p>
          </div>
          <Button className="mt-8 w-full gradient-primary text-primary-foreground font-semibold" onClick={() => navigate({ to: "/login" })}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  const StepIndicator = () => (
    <div className="mb-8 flex items-center justify-between">
      {[
        { num: 1, label: "Company", icon: Building },
        { num: 2, label: "Owner", icon: User },
        { num: 3, label: "Address", icon: MapPin },
        { num: 4, label: "Business", icon: Briefcase },
        { num: 5, label: "Security", icon: Lock },
      ].map((s) => (
        <div key={s.num} className="flex flex-col items-center gap-2">
          <div
            className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition-colors ${
              step >= s.num
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted-foreground"
            }`}
          >
            {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
          </div>
          <span
            className={`hidden text-[10px] uppercase tracking-wider sm:block ${
              step >= s.num ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-background py-10 px-6 sm:px-10">
      {/* Brand Header */}
      <div className="mx-auto mb-10 flex max-w-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg gradient-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Bizora AI</p>
            <p className="text-[11px] text-muted-foreground">Enterprise Registration</p>
          </div>
        </div>
        <Link to="/login" className="text-sm font-medium text-primary hover:underline">
          Sign In Instead
        </Link>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <div className="card-elevated p-6 sm:p-10">
          <StepIndicator />

          <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            {/* STEP 1: COMPANY */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                <h3 className="mb-4 text-lg font-semibold">Company Details</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="e.g. Priyansh Supermart" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <select id="businessType" name="businessType" value={formData.businessType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option>Retail Shop / Store</option>
                      <option>Supermarket Chain</option>
                      <option>Grocery & Provision</option>
                      <option>F&B / Restaurant</option>
                      <option>Apparel & Clothing</option>
                      <option>Electronics & Hardware</option>
                      <option>Pharmacy & Healthcare</option>
                      <option>Wholesale & Distribution</option>
                      <option>Other Enterprise</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="industry">Industry *</Label>
                    <Input id="industry" name="industry" value={formData.industry} onChange={handleChange} required placeholder="e.g. Retail FMCG" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                    <Input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="e.g. 27ABCDE1234F1Z5" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="companyWebsite">Company Website (Optional)</Label>
                    <Input id="companyWebsite" name="companyWebsite" type="url" value={formData.companyWebsite} onChange={handleChange} placeholder="https://example.com" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: OWNER */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Owner Details</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGooglePreFill}
                    className="inline-flex items-center gap-1.5 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-400"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.62H1.29c-.8 1.6-1.29 3.4-1.29 5.38s.49 3.78 1.29 5.38l3.99-3.14z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"/>
                    </svg>
                    Use Google Account
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ownerName">Full Name *</Label>
                  <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="e.g. Priyansh Dewan" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ownerEmail">Email Address *</Label>
                  <Input id="ownerEmail" name="ownerEmail" type="email" value={formData.ownerEmail} onChange={handleChange} required placeholder="priyansh@gmail.com" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="mobileNumber">Mobile Number *</Label>
                    <Input id="mobileNumber" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleChange} required placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="designation">Designation *</Label>
                    <Input id="designation" name="designation" value={formData.designation} onChange={handleChange} required placeholder="e.g. Shop Owner / Manager" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: ADDRESS WITH GOOGLE MAPS AUTO-SELECT */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                <h3 className="mb-2 text-lg font-semibold">Business Address</h3>

                <GoogleMapsPicker
                  address={formData.address}
                  onAddressChange={handleAddressFromMap}
                  label="Full Business Address (Auto-Select from Live Map)"
                  placeholder="Type shop location or click '📍 Auto-Select Address from Map'..."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} required placeholder="e.g. Pune" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleChange} required placeholder="e.g. Maharashtra" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" name="country" value={formData.country} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: BUSINESS */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                <h3 className="mb-4 text-lg font-semibold">Business Operations</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="employeeCount">Number of Employees *</Label>
                    <select id="employeeCount" name="employeeCount" value={formData.employeeCount} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="1-5">1 - 5 Staff</option>
                      <option value="6-15">6 - 15 Staff</option>
                      <option value="16-30">16 - 30 Staff</option>
                      <option value="31-50">31 - 50 Staff</option>
                      <option value="50+">50+ Staff</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="branchCount">Number of Outlets / Stores *</Label>
                    <select id="branchCount" name="branchCount" value={formData.branchCount} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="1">1 Store / Single Shop</option>
                      <option value="2-5">2 - 5 Stores</option>
                      <option value="6-10">6 - 10 Stores</option>
                      <option value="10+">10+ Outlets</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="revenueRange">Estimated Monthly / Annual Sales *</Label>
                  <select id="revenueRange" name="revenueRange" value={formData.revenueRange} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="Under 10L">Under ₹10 Lakhs</option>
                    <option value="10L - 50L">₹10 Lakhs - ₹50 Lakhs</option>
                    <option value="50L - 1Cr">₹50 Lakhs - ₹1 Crore</option>
                    <option value="1Cr - 5Cr">₹1 Crore - ₹5 Crore</option>
                    <option value="Above 5Cr">Above ₹5 Crore</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="timezone">Time Zone *</Label>
                    <Input id="timezone" name="timezone" value={formData.timezone} onChange={handleChange} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="currency">Currency *</Label>
                    <Input id="currency" name="currency" value={formData.currency} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: SECURITY */}
            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                <h3 className="mb-4 text-lg font-semibold">Security & Terms</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password *</Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required minLength={8} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required minLength={8} />
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="acceptTerms" checked={formData.acceptTerms} onCheckedChange={(c) => handleCheckbox("acceptTerms", !!c)} />
                    <label htmlFor="acceptTerms" className="text-sm font-medium leading-none">
                      I accept the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-primary underline font-semibold hover:text-primary/80"
                      >
                        Terms of Service
                      </button>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="acceptPrivacy" checked={formData.acceptPrivacy} onCheckedChange={(c) => handleCheckbox("acceptPrivacy", !!c)} />
                    <label htmlFor="acceptPrivacy" className="text-sm font-medium leading-none">
                      I accept the{" "}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-primary underline font-semibold hover:text-primary/80"
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep} disabled={submitting}>
                  Back
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => navigate({ to: "/login" })} disabled={submitting}>
                  ← Back to Login
                </Button>
              )}

              {step < 5 ? (
                <Button type="button" onClick={nextStep}>
                  Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Registration
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* TERMS OF SERVICE MODAL */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <FileText className="h-5 w-5 text-primary" />
              Bizora AI — Terms of Service
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Last updated: July 2026. Please read carefully before operating your store workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-xs leading-relaxed text-muted-foreground py-2">
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">1. Acceptance of Terms</h4>
              <p>By creating an account or registering a store workspace on Bizora AI, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must not use our platform services.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">2. Store Data Ownership & Privacy</h4>
              <p>You retain 100% full ownership of all store inventory, sales transactions, customer lists, and financial figures uploaded or processed in your workspace. Bizora AI will never sell, rent, or unauthorizedly disclose your business intelligence to third parties.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">3. Account & Password Responsibility</h4>
              <p>Store owners are strictly responsible for maintaining account credential secrecy. Any actions performed under your credentials by sub-users or suppliers remain your sole responsibility.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">4. AI Co-Pilot & Automation Disclaimer</h4>
              <p>Bizora AI recommendations (such as markdown suggestions, inventory reorder forecasts, and anomaly detection) are algorithmic analytical tools designed to assist decision-making. Final commercial execution remains under human owner review.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">5. Account Termination & Suspension</h4>
              <p>Bizora AI reserves the right to suspend accounts violating system integrity, engaging in fraudulent commercial activities, or attempting unauthorized system admin access.</p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => { handleCheckbox("acceptTerms", true); setShowTermsModal(false); toast.success("Accepted Terms of Service"); }}>
              Accept Terms of Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRIVACY POLICY MODAL */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Bizora AI — Privacy Policy
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              How we collect, protect, and process your business and personal information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-xs leading-relaxed text-muted-foreground py-2">
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">1. Information We Collect</h4>
              <p>We collect store owner registration details (Name, Business Name, Phone Number, Email, City), transactional metrics, inventory records, and device login IP addresses required for platform functionality and security auditing.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">2. How We Use Information</h4>
              <p>Collected data is strictly utilized to render your Command Center dashboards, calculate real-time analytics, issue AI anomaly alerts, deliver WhatsApp/Email notifications, and verify multi-tenant isolation.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">3. Data Security & Encryption</h4>
              <p>All sensitive credentials and database payloads are encrypted using industry-standard TLS 1.3 protocol in transit and AES-256 at rest. Account passwords are encrypted via bcrypt cryptographic hashing.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">4. Third-Party Integrations</h4>
              <p>We utilize trusted third-party providers (such as Resend for transactional email dispatch and WhatsApp Business API for system alerts) strictly for automated service communications.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">5. Data Deletion & Export Rights</h4>
              <p>Store owners can export full workspace archives or request complete account data purging at any time by contacting our System Admin team.</p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => { handleCheckbox("acceptPrivacy", true); setShowPrivacyModal(false); toast.success("Accepted Privacy Policy"); }}>
              Accept Privacy Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Account Selector Dialog */}
      <Dialog open={googleModalOpen} onOpenChange={setGoogleModalOpen}>
        <DialogContent className="sm:max-w-[400px] p-6 bg-card border-border/60">
          <DialogHeader className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface/80 border border-hairline shadow-sm">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.62H1.29c-.8 1.6-1.29 3.4-1.29 5.38s.49 3.78 1.29 5.38l3.99-3.14z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"/>
              </svg>
            </div>
            <DialogTitle className="text-xl font-display font-semibold">Pre-fill with Google</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your Google Account to auto-fill owner registration details
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGooglePreFillSelect(customGoogleEmail, customGoogleName);
            }}
            className="space-y-3 pt-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="reg-google-email" className="text-xs font-medium">Google Email *</Label>
              <Input
                id="reg-google-email"
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={customGoogleEmail}
                onChange={(e) => setCustomGoogleEmail(e.target.value)}
                className="bg-background text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-google-name" className="text-xs font-medium">Full Name (Optional)</Label>
              <Input
                id="reg-google-name"
                placeholder="e.g. Store Owner"
                value={customGoogleName}
                onChange={(e) => setCustomGoogleName(e.target.value)}
                className="bg-background text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={!customGoogleEmail.trim()}
              className="w-full mt-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-medium shadow-md flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.62H1.29c-.8 1.6-1.29 3.4-1.29 5.38s.49 3.78 1.29 5.38l3.99-3.14z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"/>
              </svg>
              Pre-fill Details
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

