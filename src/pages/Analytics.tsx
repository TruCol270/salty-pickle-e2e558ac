import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Heart, TrendingUp } from "lucide-react";

interface Performance {
  total_distance?: number;
  total_runs?: number;
  avg_pace?: number;
  longest_run?: number;
  [key: string]: unknown;
}

interface Recovery {
  score?: number;
  hrv?: number;
  resting_heart_rate?: number;
  sleep_performance?: number;
}

export default function Analytics() {
  const { integrations } = useAuth();
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [recovery, setRecovery] = useState<Recovery | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const promises: Promise<void>[] = [
      api
        .get<Performance>("/api/v1/analytics/performance")
        .then(setPerformance)
        .catch(() => {}),
    ];

    if (integrations?.whoop) {
      promises.push(
        api
          .get<Recovery>("/api/v1/whoop/recovery")
          .then(setRecovery)
          .catch(() => {})
      );
    }

    Promise.allSettled(promises).then(() => setLoading(false));
  }, [integrations]);

  if (loading) {
    return (
      <div className="text-primary font-display text-xl animate-pulse text-center py-16">
        LOADING...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">ANALYTICS</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">Raw stats. No sugarcoating.</p>
      </div>

      {/* Performance */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl text-foreground">PERFORMANCE</h2>
        </div>
        {performance ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "TOTAL RUNS", value: performance.total_runs ?? "—" },
              {
                label: "DISTANCE",
                value: performance.total_distance
                  ? `${(performance.total_distance / 1000).toFixed(0)} km`
                  : "—",
              },
              {
                label: "LONGEST RUN",
                value: performance.longest_run
                  ? `${(performance.longest_run / 1000).toFixed(1)} km`
                  : "—",
              },
              { label: "AVG PACE", value: performance.avg_pace ? `${performance.avg_pace}` : "—" },
            ].map((s) => (
              <div key={s.label} className="border-2 border-border bg-card p-5 text-center">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-2">
                  {s.label}
                </p>
                <p className="text-2xl font-display text-primary">{s.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-border bg-card p-8 text-center">
            <p className="text-muted-foreground font-body text-sm">
              No performance data yet. Sync workouts to see stats.
            </p>
          </div>
        )}
      </div>

      {/* Whoop Recovery */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-secondary" />
          <h2 className="font-display text-xl text-foreground">WHOOP RECOVERY</h2>
        </div>
        {integrations?.whoop && recovery ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "RECOVERY", value: recovery.score != null ? `${recovery.score}%` : "—" },
              { label: "HRV", value: recovery.hrv != null ? `${recovery.hrv} ms` : "—" },
              {
                label: "RESTING HR",
                value: recovery.resting_heart_rate
                  ? `${recovery.resting_heart_rate} bpm`
                  : "—",
              },
              {
                label: "SLEEP",
                value: recovery.sleep_performance
                  ? `${recovery.sleep_performance}%`
                  : "—",
              },
            ].map((s) => (
              <div key={s.label} className="border-2 border-border bg-card p-5 text-center">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-2">
                  {s.label}
                </p>
                <p className="text-2xl font-display text-secondary">{s.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-border bg-card p-8 text-center">
            <p className="text-muted-foreground font-body text-sm">
              {integrations?.whoop
                ? "No recovery data available."
                : "Connect Whoop to see recovery metrics."}
            </p>
            {!integrations?.whoop && (
              <p className="text-xs text-muted-foreground font-body mt-2">
                Link your Whoop on the login page or settings.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
