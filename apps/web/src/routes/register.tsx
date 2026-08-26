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
        <div className="card-elevated w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-semibold">Request Submitted</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Your registration request has been submitted successfully.
            <br /><br />
            The Bizora administrator has been notified. You will receive an email after approval.
          </p>
          <Button className="mt-8 w-full" onClick={() => navigate({ to: "/login" })}>
            Return to Login
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
                <h3 className="mb-4 text-lg font-semibold">Owner Details</h3>
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
    </div>
  );
}

