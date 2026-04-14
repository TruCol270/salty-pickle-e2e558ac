import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, ClipboardList, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function Dashboard() {
  const { integrations } = useAuth();
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<ActivePlan>("/api/v1/plans/active"),
      api.get<Workout[]>("/api/v1/workouts?limit=5"),
    ]).then(([planRes, workoutsRes]) => {
      if (planRes.status === "fulfilled") setActivePlan(planRes.value);
      if (workoutsRes.status === "fulfilled") setRecentWorkouts(workoutsRes.value);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary font-display text-xl animate-pulse">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">DASHBOARD</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">Your training at a glance.</p>
      </div>

      {/* Integration status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: "Strava", connected: integrations?.strava, color: "border-[#FC4C02]" },
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

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Link to={`/app/plans`}>
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

        {/* Recent Workouts */}
        <div className="border-2 border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-lg text-foreground">RECENT WORKOUTS</h2>
          </div>
          {recentWorkouts.length > 0 ? (
            <ul className="space-y-2">
              {recentWorkouts.slice(0, 3).map((w) => (
                <li key={w.id} className="flex items-center justify-between text-sm font-body">
                  <span className="text-foreground truncate">{w.name || w.type || "Workout"}</span>
                  <span className="text-muted-foreground text-xs">
                    {w.distance ? `${(w.distance / 1000).toFixed(1)} km` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground font-body text-sm">No workouts synced yet.</p>
          )}
          <Link to="/app/workouts" className="block mt-4">
            <Button
              variant="outline"
              size="sm"
              className="font-display text-xs uppercase tracking-wider border-border text-foreground hover:border-secondary hover:text-secondary"
            >
              ALL WORKOUTS
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Activity, label: "THIS WEEK", value: `${recentWorkouts.length} runs` },
          { icon: TrendingUp, label: "PLAN STATUS", value: activePlan?.status || "—" },
          { icon: Dumbbell, label: "STRAVA", value: integrations?.strava ? "Synced" : "—" },
          { icon: Activity, label: "WHOOP", value: integrations?.whoop ? "Linked" : "—" },
        ].map((stat) => (
          <div key={stat.label} className="border border-border bg-card p-4 text-center">
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-foreground font-display text-sm mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
