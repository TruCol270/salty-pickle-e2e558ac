import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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

      <div className="border-2 border-border bg-card p-6 space-y-6">
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
