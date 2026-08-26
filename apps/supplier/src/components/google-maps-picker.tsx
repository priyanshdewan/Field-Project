import React, { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GoogleMapsPickerProps {
  address: string;
  onAddressChange: (newAddress: string, details?: { lat?: number; lng?: number; city?: string; state?: string; country?: string }) => void;
  label?: string;
  placeholder?: string;
}

export const GoogleMapsPicker: React.FC<GoogleMapsPickerProps> = ({
  address,
  onAddressChange,
  label = "Business Store Address (Google Maps Auto-Fill)",
  placeholder = "Enter store location or click Auto-Detect GPS...",
}) => {
  const [detecting, setDetecting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 19.0760, lng: 72.8777 }); // Default Mumbai

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setDetecting(true);
    toast.info("📍 Fetching store GPS location from map...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          if (res.ok) {
            const data = await res.json();
            const fullAddr = data.display_name || `${data.address?.road || "Main Street"}, ${data.address?.suburb || data.address?.city || "City"}`;
            const city = data.address?.city || data.address?.town || data.address?.suburb || data.address?.county || data.address?.state_district || "";
            const state = data.address?.state || "";
            const country = data.address?.country || "";

            onAddressChange(fullAddr, { lat, lng, city, state, country });
            toast.success("📍 Store Location Auto-Selected from Map!");
          } else {
            const fallbackAddr = `Store Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            onAddressChange(fallbackAddr, { lat, lng, city: "", state: "", country: "" });
            toast.success("📍 Store GPS Location Auto-Filled!");
          }
        } catch (err) {
          const fallbackAddr = `Store Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          onAddressChange(fallbackAddr, { lat, lng, city: "", state: "", country: "" });
          toast.success("📍 Store GPS Location Auto-Filled!");
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        setDetecting(false);
        toast.error("Could not detect store GPS. Please type address manually.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold block flex items-center gap-1.5 text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={detecting}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-md hover:bg-primary/20 transition-all cursor-pointer"
        >
          {detecting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Locating...
            </>
          ) : (
            <>
              <Navigation className="h-3.5 w-3.5" /> 📍 Auto-Select Address from Map
            </>
          )}
        </button>
      </div>

      <input
        type="text"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      {/* Embedded Interactive Google Maps Live iFrame Preview */}
      <div className="relative rounded-md overflow-hidden border border-input h-36 bg-muted shadow-inner mt-2">
        <iframe
          title="Google Maps Store Preview"
          width="100%"
          height="100%"
          loading="lazy"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
        />
        <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 shadow">
          <MapPin className="h-3.5 w-3.5 text-primary" /> GPS Pin: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
};

