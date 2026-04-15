import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dumbbell,
  ClipboardList,
  TrendingUp,
  Activity,
  Calendar,
  Heart,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Line, ComposedChart } from "recharts";

interface ActivePlan {
  id: string;
  name: string;
  status: string;
  start_date?: string;
  end_date?: string;
}

interface Workout {
  id: string;
  name?: string;
  type?: string;
  distance?: number;
  moving_time?: number;
  start_date?: string;
}

interface CalendarEvent {
  id?: string;
  title?: string;
  summary?: string;
  start?: string;
  type?: string;
}

interface RecoveryData {
  recovery_score?: number;
  hrv?: number;
  resting_heart_rate?: number;
  sleep_performance?: number;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

function recoveryColor(score: number) {
  if (score >= 67) return "text-green-400";
  if (score >= 34) return "text-yellow-400";
  return "text-red-400";
}

function recoveryBorder(score: number) {
  if (score >= 67) return "border-green-500";
  if (score >= 34) return "border-yellow-500";
  return "border-red-500";
}

export default function Dashboard() {
  const { integrations } = useAuth();
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [upcoming, setUpcoming] = useState<CalendarEvent[]>([]);
  const [recovery, setRecovery] = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<ActivePlan>("/api/v1/plans/active"),
      api.get<Workout[]>("/api/v1/workouts?limit=5"),
      api.get<Workout[]>("/api/v1/workouts?limit=100"),
      api.get<CalendarEvent[]>("/api/v1/calendar/events?days=7"),
      api.get<RecoveryData | RecoveryData[]>("/api/v1/whoop/recovery"),
    ]).then(([planRes, workoutsRes, allWorkoutsRes, calRes, recRes]) => {
      if (planRes.status === "fulfilled") setActivePlan(planRes.value);
      if (workoutsRes.status === "fulfilled") {
        setRecentWorkouts(Array.isArray(workoutsRes.value) ? workoutsRes.value : []);
      }
      if (allWorkoutsRes.status === "fulfilled") {
        setAllWorkouts(Array.isArray(allWorkoutsRes.value) ? allWorkoutsRes.value : []);
      }
      if (calRes.status === "fulfilled") {
        const arr = Array.isArray(calRes.value) ? calRes.value : [];
        const now = new Date();
        setUpcoming(
          arr
            .filter((e) => e.start && new Date(e.start) >= now)
            .sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime())
            .slice(0, 4)
        );
      }
      if (recRes.status === "fulfilled") {
        const d = recRes.value;
        setRecovery(Array.isArray(d) ? d[0] || null : d);
      }
      setLoading(false);
    });
  }, []);

  // Compute weekly volume for last 4 weeks
  const weeklyVolume = useMemo(() => {
    const now = new Date();
    const weeks: { label: string; distance: number; count: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 7);
      
      const weekWorkouts = allWorkouts.filter((w) => {
        if (!w.start_date) return false;
        const d = new Date(w.start_date);
        return d >= weekStart && d < weekEnd;
      });

      const dist = weekWorkouts.reduce((s, w) => s + (w.distance || 0), 0) / 1000;
      const time = weekWorkouts.reduce((s, w) => s + (w.moving_time || 0), 0) / 60; // minutes
      const pace = dist > 0 ? Math.round((time / dist) * 10) / 10 : null; // min/km
      const label = i === 0 ? "This wk" : i === 1 ? "Last wk" : `${i}w ago`;
      weeks.push({ label, distance: Math.round(dist * 10) / 10, count: weekWorkouts.length, pace });
    }
    return weeks;
  }, [allWorkouts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary font-display text-xl animate-pulse">LOADING...</div>
      </div>
    );
  }

  const totalDistance = recentWorkouts.reduce((s, w) => s + (w.distance || 0), 0);
  const totalTime = recentWorkouts.reduce((s, w) => s + (w.moving_time || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">DASHBOARD</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">Your training at a glance.</p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Dumbbell}
          label="RECENT RUNS"
          value={`${recentWorkouts.length}`}
        />
        <StatCard
          icon={TrendingUp}
          label="DISTANCE"
          value={totalDistance > 0 ? `${(totalDistance / 1000).toFixed(1)} km` : "—"}
        />
        <StatCard
          icon={Activity}
          label="TIME"
          value={totalTime > 0 ? formatDuration(totalTime) : "—"}
        />
        <StatCard
          icon={Heart}
          label="RECOVERY"
          value={recovery?.recovery_score != null ? `${Math.round(recovery.recovery_score)}%` : "—"}
          valueClass={recovery?.recovery_score != null ? recoveryColor(recovery.recovery_score) : undefined}
        />
      </div>

      {/* Weekly Volume Chart */}
      <div className="border-2 border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-accent" />
          <h2 className="font-display text-lg text-foreground">WEEKLY VOLUME</h2>
          <span className="text-muted-foreground font-body text-xs ml-auto">Last 4 weeks</span>
        </div>
        {weeklyVolume.some((w) => w.distance > 0) ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVolume} barCategoryGap="20%">
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(0 0% 55%)", fontSize: 12, fontFamily: "Inter" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(0 0% 55%)", fontSize: 11, fontFamily: "Inter" }}
                  tickFormatter={(v) => `${v} km`}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0 0% 10%)",
                    border: "1px solid hsl(0 0% 18%)",
                    borderRadius: "4px",
                    fontFamily: "Inter",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(60 10% 92%)", fontWeight: 600 }}
                  formatter={(value: number, _name: string, props: { payload: { count: number } }) => [
                    `${value} km (${props.payload.count} runs)`,
                    "Distance",
                  ]}
                />
                <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
                  {weeklyVolume.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === weeklyVolume.length - 1 ? "hsl(82 100% 50%)" : "hsl(82 100% 50% / 0.4)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted-foreground font-body text-sm">
              No workout data yet. Sync your workouts to see volume trends.
            </p>
          </div>
        )}
      </div>

      {/* Recovery + Plan row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recovery card */}
        <div
          className={`border-2 ${recovery?.recovery_score != null ? recoveryBorder(recovery.recovery_score) : "border-border"} bg-card p-6`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-lg text-foreground">WHOOP RECOVERY</h2>
          </div>
          {recovery ? (
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p
                    className={`font-display text-4xl ${recovery.recovery_score != null ? recoveryColor(recovery.recovery_score) : "text-foreground"}`}
                  >
                    {recovery.recovery_score != null ? `${Math.round(recovery.recovery_score)}%` : "—"}
                  </p>
                  <p className="text-muted-foreground font-body text-xs mt-1 uppercase tracking-wider">
                    SCORE
                  </p>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <MiniMetric label="HRV" value={recovery.hrv != null ? `${Math.round(recovery.hrv)}` : "—"} unit="ms" />
                  <MiniMetric label="RHR" value={recovery.resting_heart_rate != null ? `${recovery.resting_heart_rate}` : "—"} unit="bpm" />
                  <MiniMetric label="SLEEP" value={recovery.sleep_performance != null ? `${Math.round(recovery.sleep_performance)}%` : "—"} />
                </div>
              </div>
              <Link to="/app/analytics">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-display text-xs uppercase tracking-wider border-border text-foreground hover:border-secondary hover:text-secondary w-full"
                >
                  VIEW ANALYTICS
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground font-body text-sm mb-4">
                {integrations?.whoop ? "No recovery data yet." : "Connect Whoop to see recovery."}
              </p>
              {!integrations?.whoop && (
                <Link to="/app/preferences">
                  <Button
                    size="sm"
                    className="font-display text-xs uppercase tracking-wider bg-secondary text-secondary-foreground border-2 border-secondary hover:bg-secondary/80"
                  >
                    CONNECT WHOOP
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Active Plan */}
        <div className="border-2 border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg text-foreground">ACTIVE PLAN</h2>
          </div>
          {activePlan ? (
            <div>
              <p className="text-foreground font-body text-base mb-1">{activePlan.name}</p>
              <p className="text-muted-foreground font-body text-xs mb-4">
                Status: {activePlan.status}
              </p>
              <Link to="/app/plans">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-display text-xs uppercase tracking-wider border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  VIEW PLAN
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground font-body text-sm mb-4">No active plan yet.</p>
              <Link to="/app/plans">
                <Button
                  size="sm"
                  className="font-display text-xs uppercase tracking-wider bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/80"
                >
                  CREATE PLAN
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming sessions + Recent workouts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming sessions */}
        <div className="border-2 border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg text-foreground">UPCOMING</h2>
            </div>
            <Link to="/app/calendar" className="text-muted-foreground hover:text-primary transition-colors">
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          {upcoming.length > 0 ? (
            <ul className="space-y-3">
              {upcoming.map((ev, i) => {
                const d = ev.start ? new Date(ev.start) : null;
                return (
                  <li key={ev.id || i} className="flex items-center gap-3">
                    {d && (
                      <div className="text-center shrink-0 w-10">
                        <p className="text-primary font-display text-sm leading-none">
                          {d.toLocaleDateString(undefined, { day: "numeric" })}
                        </p>
                        <p className="text-muted-foreground font-body text-[10px] uppercase">
                          {d.toLocaleDateString(undefined, { weekday: "short" })}
                        </p>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 border-l border-border pl-3">
                      <p className="text-foreground font-body text-sm truncate">
                        {ev.title || ev.summary || "Training"}
                      </p>
                      {ev.type && (
                        <p className="text-muted-foreground font-body text-xs">{ev.type}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground font-body text-sm">
              No upcoming sessions. Sync your calendar to see what's next.
            </p>
          )}
        </div>

        {/* Recent Workouts */}
        <div className="border-2 border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-secondary" />
              <h2 className="font-display text-lg text-foreground">RECENT WORKOUTS</h2>
            </div>
            <Link to="/app/workouts" className="text-muted-foreground hover:text-secondary transition-colors">
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          {recentWorkouts.length > 0 ? (
            <ul className="space-y-3">
              {recentWorkouts.slice(0, 4).map((w) => (
                <li key={w.id} className="flex items-center justify-between text-sm font-body">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate">{w.name || w.type || "Workout"}</p>
                    {w.start_date && (
                      <p className="text-muted-foreground text-xs">
                        {new Date(w.start_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-foreground">
                      {w.distance ? `${(w.distance / 1000).toFixed(1)} km` : "—"}
                    </p>
                    {w.moving_time && (
                      <p className="text-muted-foreground text-xs">{formatDuration(w.moving_time)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground font-body text-sm">No workouts synced yet.</p>
          )}
        </div>
      </div>

      {/* Integration status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: "Strava", connected: integrations?.strava, color: "border-orange-500" },
          { name: "Google", connected: integrations?.google, color: "border-primary" },
          { name: "Whoop", connected: integrations?.whoop, color: "border-secondary" },
        ].map((p) => (
          <div
            key={p.name}
            className={`border-2 ${p.connected ? p.color : "border-border"} bg-card p-4 flex items-center justify-between`}
          >
            <span className="font-display text-sm text-foreground">{p.name}</span>
            <span
              className={`text-xs font-body ${p.connected ? "text-primary" : "text-muted-foreground"}`}
            >
              {p.connected ? "CONNECTED" : "NOT LINKED"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="border border-border bg-card p-4 text-center">
      <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
      <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">{label}</p>
      <p className={`font-display text-lg mt-1 ${valueClass || "text-foreground"}`}>{value}</p>
    </div>
  );
}

function MiniMetric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="text-center">
      <p className="text-foreground font-display text-sm">
        {value}
        {unit && <span className="text-muted-foreground font-body text-[10px] ml-0.5">{unit}</span>}
      </p>
      <p className="text-muted-foreground font-body text-[10px] uppercase tracking-wider">{label}</p>
    </div>
  );
}
