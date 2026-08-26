import { createFileRoute } from "@tanstack/react-router";
import { getMallSettingsServer, updateMallSettingsServer } from "@/lib/server-settings";
import { getVapiConfigServer, updateVapiConfigServer } from "@/lib/server-vapi";
import { getWhatsAppConfigServer, updateWhatsAppConfigServer } from "@/lib/server-whatsapp-config";
import { PageHeader, SectionCard } from "@/components/page-header";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Phone,
  Key,
  ShieldCheck,
  Globe,
  Check,
} from "lucide-react";
import { INDIAN_LANGUAGES, useLanguage } from "@/lib/language-context";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Bizora" },
      { name: "description", content: "Workspace, roles, and integration settings." },
    ],
  }),
  loader: () => getMallSettingsServer(),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { currentLang, setLanguage } = useLanguage();
  const mallData = Route.useLoaderData();
  const [mall, setMall] = useState({
    id: mallData?.id || "grandsquare-mall",
    name: mallData?.name || "GrandSquare Supermart & Mall",
    location: mallData?.location || "Bandra West, Mumbai 400050",
    currency: mallData?.currency || "INR (₹)",
    timezone: mallData?.timezone || "Asia/Kolkata (IST)",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [vapi, setVapi] = useState({
    vapiPhoneId: "027dfd39-b626-43cf-859f-6583a33f580b",
    vapiAgentId: "88b76de6-b66b-46f0-a536-8182804fab8a",
    vapiPublicKey: "e3322c27-c9ac-45cb-9c58-e49c8f423a1f",
    vapiPrivateKey: "581c84cb-6185-4714-98d1-bdd823189ea0",
  });
  const [loadingVapi, setLoadingVapi] = useState(true);
  const [savingVapi, setSavingVapi] = useState(false);

  const [whatsapp, setWhatsapp] = useState({
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioWhatsAppSender: "",
    ownerWhatsAppNumber: "",
    managerWhatsAppNumber: "",
  });
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(true);
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);

  const canEdit = user?.role === "owner" || user?.role === "admin";

  useEffect(() => {
    getVapiConfigServer()
      .then((res) => {
        if (res) setVapi(res);
      })
      .catch((err) => {
        console.error("Failed to load Vapi config:", err);
      })
      .finally(() => {
        setLoadingVapi(false);
      });

    getWhatsAppConfigServer()
      .then((res) => {
        if (res) setWhatsapp(res);
      })
      .catch((err) => {
        console.error("Failed to load WhatsApp config:", err);
      })
      .finally(() => {
        setLoadingWhatsApp(false);
      });
  }, []);

  const handleChange = (field: keyof typeof mall, value: string) => {
    setMall({ ...mall, [field]: value });
  };

  const handleVapiChange = (field: keyof typeof vapi, value: string) => {
    setVapi({ ...vapi, [field]: value });
  };

  const handleWhatsAppChange = (field: keyof typeof whatsapp, value: string) => {
    setWhatsapp({ ...whatsapp, [field]: value });
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit settings.");
      return;
    }

    try {
      setIsSaving(true);
      await updateMallSettingsServer({
        data: {
          id: mall.id,
          name: mall.name,
          location: mall.location,
          currency: mall.currency,
          timezone: mall.timezone,
        },
      });
      toast.success("Settings updated successfully", {
        description: "Your workspace settings have been saved to the database.",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveVapi = async () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit integrations.");
      return;
    }

    try {
      setSavingVapi(true);
      await updateVapiConfigServer({
        data: vapi,
      });
      toast.success("Vapi AI credentials updated successfully", {
        description: "Your voice agent settings have been saved.",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update Vapi credentials");
    } finally {
      setSavingVapi(false);
    }
  };

  const handleSaveWhatsApp = async () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit integrations.");
      return;
    }

    try {
      setSavingWhatsApp(true);
      await updateWhatsAppConfigServer({
        data: whatsapp,
      });
      toast.success("WhatsApp credentials updated successfully", {
        description: "Your Twilio WhatsApp configurations have been saved.",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update WhatsApp configurations");
    } finally {
      setSavingWhatsApp(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your workspace details, roles, and notifications."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-6">
          {/* Workspace Form (Dynamic) */}
          <SectionCard title="Workspace Settings" subtitle="General details about your mall">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mall Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={mall.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      disabled={!canEdit || isSaving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={mall.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      disabled={!canEdit || isSaving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={mall.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      disabled={!canEdit || isSaving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={mall.timezone}
                      onChange={(e) => handleChange("timezone", e.target.value)}
                      disabled={!canEdit || isSaving}
                    />
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Indian Regional Language Settings */}
          <SectionCard
            title="Regional Language & Localization"
            subtitle="Select your preferred Indian regional language for all app portals"
          >
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                All 12 major Indian languages are supported. Selecting a language instantly translates all interfaces, menus, reports, and data.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                {INDIAN_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all text-left",
                      currentLang === lang.code
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-hairline bg-surface hover:bg-surface-2 text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <span className="font-semibold block truncate leading-tight">{lang.nativeName}</span>
                        <span className="text-[10px] text-muted-foreground block truncate leading-tight">{lang.name}</span>
                      </div>
                    </div>
                    {currentLang === lang.code && <Check className="h-4 w-4 text-primary shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Vapi AI Form */}
          <SectionCard
            title="Voice Agent Integration (Vapi AI)"
            subtitle="Configure outbound AI calling credentials"
          >
            {loadingVapi ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone Number ID</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={vapi.vapiPhoneId}
                        onChange={(e) => handleVapiChange("vapiPhoneId", e.target.value)}
                        placeholder="e.g. 7d905648-..."
                        disabled={!canEdit || savingVapi}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Assistant (Agent) ID</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={vapi.vapiAgentId}
                        onChange={(e) => handleVapiChange("vapiAgentId", e.target.value)}
                        placeholder="e.g. 294c5d56-..."
                        disabled={!canEdit || savingVapi}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Public Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={vapi.vapiPublicKey}
                        onChange={(e) => handleVapiChange("vapiPublicKey", e.target.value)}
                        placeholder="e.g. 4a80f4e1-..."
                        disabled={!canEdit || savingVapi}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Private API Key (Bearer Token)</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        type="password"
                        value={vapi.vapiPrivateKey}
                        onChange={(e) => handleVapiChange("vapiPrivateKey", e.target.value)}
                        placeholder="e.g. 6ab6eb8f-..."
                        disabled={!canEdit || savingVapi}
                      />
                    </div>
                  </div>
                </div>

                {canEdit && (
                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={handleSaveVapi}
                      disabled={savingVapi}
                      className="gap-2 bg-violet hover:bg-violet/90 text-white font-semibold"
                    >
                      {savingVapi ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Credentials
                    </Button>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Twilio WhatsApp Form */}
          <SectionCard
            title="Twilio WhatsApp Integration"
            subtitle="Configure Twilio WhatsApp settings and Administrator alerts recipient phones"
          >
            {loadingWhatsApp ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Twilio Account SID</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={whatsapp.twilioAccountSid}
                        onChange={(e) => handleWhatsAppChange("twilioAccountSid", e.target.value)}
                        placeholder="AC..."
                        disabled={!canEdit || savingWhatsApp}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Twilio Auth Token</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        type="password"
                        value={whatsapp.twilioAuthToken}
                        onChange={(e) => handleWhatsAppChange("twilioAuthToken", e.target.value)}
                        placeholder="Twilio secret auth token"
                        disabled={!canEdit || savingWhatsApp}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Twilio WhatsApp Sender Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={whatsapp.twilioWhatsAppSender}
                        onChange={(e) =>
                          handleWhatsAppChange("twilioWhatsAppSender", e.target.value)
                        }
                        placeholder="e.g. whatsapp:+14155238886"
                        disabled={!canEdit || savingWhatsApp}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Owner Alert Number (Aarav Mehra)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={whatsapp.ownerWhatsAppNumber}
                        onChange={(e) =>
                          handleWhatsAppChange("ownerWhatsAppNumber", e.target.value)
                        }
                        placeholder="e.g. +919876543210"
                        disabled={!canEdit || savingWhatsApp}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Manager Alert Number (Priya Nair)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={whatsapp.managerWhatsAppNumber}
                        onChange={(e) =>
                          handleWhatsAppChange("managerWhatsAppNumber", e.target.value)
                        }
                        placeholder="e.g. +919876543211"
                        disabled={!canEdit || savingWhatsApp}
                      />
                    </div>
                  </div>
                </div>

                {canEdit && (
                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={handleSaveWhatsApp}
                      disabled={savingWhatsApp}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-600/90 text-white font-semibold"
                    >
                      {savingWhatsApp ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save WhatsApp Settings
                    </Button>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          {/* Roles (Static Readonly Reference) */}
          <SectionCard title="Roles" subtitle="Access levels (Read Only)">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-sm font-medium">Owner</span>
                <span className="text-xs text-muted-foreground">Full access</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-sm font-medium">Admin</span>
                <span className="text-xs text-muted-foreground">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Manager</span>
                <span className="text-xs text-muted-foreground">Department</span>
              </div>
            </div>
          </SectionCard>

          {/* Notifications (Static Readonly Reference) */}
          <SectionCard title="Notifications" subtitle="Delivery channels (Read Only)">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-sm font-medium">Email</span>
                <span className="text-xs text-success">Enabled</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-sm font-medium">WhatsApp</span>
                <span className="text-xs text-success">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Slack</span>
                <span className="text-xs text-success">Enabled</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
