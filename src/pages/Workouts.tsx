import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Workout {
  id: string;
  name?: string;
  type?: string;
  distance?: number;
  moving_time?: number;
  start_date?: string;
  average_heartrate?: number;
  average_speed?: number;
}

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const data = await api.get<Workout[]>("/api/v1/workouts?limit=50");
      setWorkouts(data);
    } catch {
      toast({ title: "Failed to load workouts", variant: "destructive" });
    }
    setLoading(false);
  };

  const syncStrava = async () => {
    setSyncing(true);
    try {
      await api.post("/api/v1/workouts/sync?days=30");
      toast({ title: "Sync complete! 🔥" });
      fetchWorkouts();
    } catch (err: any) {
      toast({ title: "Sync failed", description: err.message, variant: "destructive" });
    }
    setSyncing(false);
  };

  useEffect(() => { fetchWorkouts(); }, []);

  const formatTime = (s?: number) => {
    if (!s) return "—";
    const m = Math.floor(s / 60);
    return m > 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">WORKOUTS</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">Your training history.</p>
        </div>
        <Button
          onClick={syncStrava}
          disabled={syncing}
          className="font-display text-xs uppercase tracking-wider bg-[#FC4C02] text-foreground border-2 border-[#FC4C02] hover:bg-[#FC4C02]/80"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "SYNCING..." : "SYNC STRAVA"}
        </Button>
      </div>

      {loading ? (
        <div className="text-primary font-display text-xl animate-pulse text-center py-16">LOADING...</div>
      ) : workouts.length === 0 ? (
        <div className="border-2 border-border bg-card p-12 text-center">
          <p className="text-muted-foreground font-body">No workouts yet. Sync from Strava to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <div
              key={w.id}
              className="border-2 border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-display text-base text-foreground truncate">
                  {w.name || w.type || "Workout"}
                </p>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  {w.start_date ? new Date(w.start_date).toLocaleDateString() : "—"} ·{" "}
                  {w.type || "Activity"}
                </p>
              </div>
              <div className="flex gap-6 text-sm font-body">
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">DIST</p>
                  <p className="text-foreground">
                    {w.distance ? `${(w.distance / 1000).toFixed(1)} km` : "—"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">TIME</p>
                  <p className="text-foreground">{formatTime(w.moving_time)}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">HR</p>
                  <p className="text-foreground">
                    {w.average_heartrate ? `${Math.round(w.average_heartrate)} bpm` : "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
