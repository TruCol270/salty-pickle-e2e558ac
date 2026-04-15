import { useEffect, useState } from "react";
import { api, getApiBase } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UserPrefs {
  units?: string;
  weekly_mileage_goal?: number;
  preferred_run_days?: string[];
  notification_enabled?: boolean;
  [key: string]: unknown;
}

export default function Preferences() {
  const [prefs, setPrefs] = useState<UserPrefs>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { integrations, refreshIntegrations } = useAuth();

  useEffect(() => {
    api
      .get<UserPrefs>("/api/v1/user/preferences")
      .then(setPrefs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/api/v1/user/preferences", prefs);
      toast({ title: "Preferences saved! 🥒" });
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const FRONTEND_URL = window.location.origin;
  const base = getApiBase();

  const handleConnectWhoop = () => {
    window.location.href = `${base}/auth/whoop/authorize?redirect_url=${encodeURIComponent(FRONTEND_URL + "/auth/callback")}`;
  };

  const handleConnectStrava = () => {
    window.location.href = `${base}/auth/strava/authorize?redirect_url=${encodeURIComponent(FRONTEND_URL + "/auth/callback")}`;
  };

  const handleConnectGoogle = () => {
    window.location.href = `${base}/auth/google/authorize?redirect_url=${encodeURIComponent(FRONTEND_URL + "/auth/callback")}`;
  };

  if (loading) {
    return (
      <div className="text-primary font-display text-xl animate-pulse text-center py-16">
        LOADING...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">SETTINGS</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">Tweak your training vibe.</p>
      </div>

      {/* Connected Services */}
      <div className="border-2 border-border bg-card p-6 space-y-5">
        <h2 className="font-display text-lg text-foreground uppercase tracking-wider">
          CONNECTED SERVICES
        </h2>

        <div className="space-y-3">
          {/* Strava */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FC4C02]">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              <span className="font-display text-sm uppercase tracking-wider text-foreground">Strava</span>
            </div>
            {integrations?.strava ? (
              <span className="font-display text-xs uppercase tracking-wider text-primary border border-primary px-3 py-1">
                CONNECTED
              </span>
            ) : (
              <button
                onClick={handleConnectStrava}
                className="font-display text-xs uppercase tracking-wider text-[#FC4C02] border border-[#FC4C02] px-3 py-1 hover:bg-[#FC4C02]/10 transition-colors"
              >
                CONNECT
              </button>
            )}
          </div>

          {/* Google */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-display text-sm uppercase tracking-wider text-foreground">Google</span>
            </div>
            {integrations?.google ? (
              <span className="font-display text-xs uppercase tracking-wider text-primary border border-primary px-3 py-1">
                CONNECTED
              </span>
            ) : (
              <button
                onClick={handleConnectGoogle}
                className="font-display text-xs uppercase tracking-wider text-muted-foreground border border-border px-3 py-1 hover:border-primary hover:text-primary transition-colors"
              >
                CONNECT
              </button>
            )}
          </div>

          {/* Whoop */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" className="stroke-[#44D62C]" />
                <path d="M8 12a4 4 0 0 1 8 0" className="stroke-[#44D62C]" />
              </svg>
              <span className="font-display text-sm uppercase tracking-wider text-foreground">Whoop</span>
            </div>
            {integrations?.whoop ? (
              <span className="font-display text-xs uppercase tracking-wider text-primary border border-primary px-3 py-1">
                CONNECTED
              </span>
            ) : (
              <button
                onClick={handleConnectWhoop}
                className="font-display text-xs uppercase tracking-wider text-[#44D62C] border border-[#44D62C] px-3 py-1 hover:bg-[#44D62C]/10 transition-colors"
              >
                CONNECT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Training Preferences */}
      <div className="border-2 border-border bg-card p-6 space-y-6">
        <h2 className="font-display text-lg text-foreground uppercase tracking-wider">
          TRAINING PREFERENCES
        </h2>

        {/* Units */}
        <div>
          <label className="font-display text-sm text-foreground uppercase tracking-wider block mb-2">
            UNITS
          </label>
          <div className="flex gap-3">
            {["metric", "imperial"].map((u) => (
              <button
                key={u}
                onClick={() => setPrefs({ ...prefs, units: u })}
                className={`px-4 py-2 border-2 font-display text-xs uppercase tracking-wider transition-colors ${
                  prefs.units === u
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly mileage goal */}
        <div>
          <label className="font-display text-sm text-foreground uppercase tracking-wider block mb-2">
            WEEKLY MILEAGE GOAL (KM)
          </label>
          <input
            type="number"
            value={prefs.weekly_mileage_goal || ""}
            onChange={(e) =>
              setPrefs({ ...prefs, weekly_mileage_goal: Number(e.target.value) || undefined })
            }
            className="w-32 px-3 py-2 bg-background border-2 border-border text-foreground font-body focus:border-primary focus:outline-none"
            placeholder="40"
          />
        </div>

        {/* Save */}
        <Button
          onClick={save}
          disabled={saving}
          className="font-display text-sm uppercase tracking-wider bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/80"
        >
          {saving ? "SAVING..." : "SAVE PREFERENCES"}
        </Button>
      </div>
    </div>
  );
}