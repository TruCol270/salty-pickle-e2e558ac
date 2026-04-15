import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Heart, TrendingUp, Activity, Moon, Zap } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface Performance {
  total_distance?: number;
  total_runs?: number;
  avg_pace?: number;
  longest_run?: number;
  [key: string]: unknown;
}

interface RecoveryCycle {
  score?: number;
  hrv?: number;
  resting_heart_rate?: number;
  sleep_performance?: number;
  date?: string;
  created_at?: string;
}

type RecoveryResponse = RecoveryCycle | RecoveryCycle[];

function getRecoveryColor(score: number | undefined | null): string {
  if (score == null) return "hsl(var(--muted-foreground))";
  if (score >= 67) return "hsl(82, 100%, 50%)"; // green / primary
  if (score >= 34) return "hsl(50, 100%, 50%)"; // yellow / accent
  return "hsl(0, 84%, 60%)"; // red / destructive
}

function getRecoveryLabel(score: number | undefined | null): string {
  if (score == null) return "—";
  if (score >= 67) return "GREEN";
  if (score >= 34) return "YELLOW";
  return "RED";
}

const chartConfig: ChartConfig = {
  score: { label: "Recovery %", color: "hsl(var(--primary))" },
  hrv: { label: "HRV (ms)", color: "hsl(var(--secondary))" },
};

export default function Analytics() {
  const { integrations } = useAuth();
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [recoveryData, setRecoveryData] = useState<RecoveryCycle[]>([]);
  const [loading, setLoading] = useState(true);

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
          .get<RecoveryResponse>("/api/v1/whoop/recovery")
          .then((data) => {
            const arr = Array.isArray(data) ? data : data ? [data] : [];
            setRecoveryData(arr);
          })
          .catch(() => {})
      );
    }

    Promise.allSettled(promises).then(() => setLoading(false));
  }, [integrations]);

  const latest = recoveryData.length > 0 ? recoveryData[recoveryData.length - 1] : null;

  if (loading) {
    return (
      <div className="text-primary font-display text-xl animate-pulse text-center py-16">
        LOADING...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">ANALYTICS</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">Raw stats. No sugarcoating.</p>
      </div>

      {/* Performance */}
      <section>
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
      </section>

      {/* Whoop Recovery */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-secondary" />
          <h2 className="font-display text-xl text-foreground">WHOOP RECOVERY</h2>
        </div>

        {integrations?.whoop && latest ? (
          <div className="space-y-6">
            {/* Hero recovery score */}
            <div className="border-2 border-border bg-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex flex-col items-center">
                <div
                  className="w-28 h-28 rounded-full border-4 flex items-center justify-center"
                  style={{ borderColor: getRecoveryColor(latest.score) }}
                >
                  <span
                    className="text-4xl font-display"
                    style={{ color: getRecoveryColor(latest.score) }}
                  >
                    {latest.score != null ? `${latest.score}%` : "—"}
                  </span>
                </div>
                <span
                  className="font-display text-sm mt-2 tracking-widest"
                  style={{ color: getRecoveryColor(latest.score) }}
                >
                  {getRecoveryLabel(latest.score)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 flex-1 w-full">
                <div className="text-center">
                  <Activity className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">HRV</p>
                  <p className="text-xl font-display text-foreground">
                    {latest.hrv != null ? `${latest.hrv}` : "—"}
                    <span className="text-xs text-muted-foreground ml-1">ms</span>
                  </p>
                </div>
                <div className="text-center">
                  <Heart className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">RESTING HR</p>
                  <p className="text-xl font-display text-foreground">
                    {latest.resting_heart_rate != null ? `${latest.resting_heart_rate}` : "—"}
                    <span className="text-xs text-muted-foreground ml-1">bpm</span>
                  </p>
                </div>
                <div className="text-center">
                  <Moon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">SLEEP</p>
                  <p className="text-xl font-display text-foreground">
                    {latest.sleep_performance != null ? `${latest.sleep_performance}%` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Recovery trend chart */}
            {recoveryData.length > 1 && (
              <div className="border-2 border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="font-display text-sm text-foreground tracking-wider">RECOVERY TREND</h3>
                </div>
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <BarChart
                    data={recoveryData.map((r, i) => ({
                      day: r.date || r.created_at?.slice(5, 10) || `D${i + 1}`,
                      score: r.score ?? 0,
                      fill: getRecoveryColor(r.score),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="score" radius={[2, 2, 0, 0]} fill="hsl(var(--primary))" />
                  </BarChart>
                </ChartContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-border bg-card p-8 text-center">
            <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-body text-sm">
              {integrations?.whoop
                ? "No recovery data available yet."
                : "Connect Whoop to see recovery metrics."}
            </p>
            {!integrations?.whoop && (
              <p className="text-xs text-muted-foreground font-body mt-2">
                Link your Whoop in Settings → Connected Services.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
