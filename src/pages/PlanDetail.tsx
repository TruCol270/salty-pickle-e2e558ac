import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Target, Clock, Zap, RefreshCw } from "lucide-react";

interface Workout {
  id: string;
  date?: string;
  day_of_week?: string;
  workout_type?: string;
  title?: string;
  description?: string;
  distance_km?: number;
  duration_minutes?: number;
  intensity?: string;
  completed?: boolean;
  notes?: string;
  [key: string]: unknown;
}

interface PlanDetail {
  id: string;
  name: string;
  status: string;
  start_date?: string;
  end_date?: string;
  goal?: string;
  description?: string;
  workouts?: Workout[];
  weeks?: Array<{
    week_number: number;
    theme?: string;
    workouts: Workout[];
  }>;
  [key: string]: unknown;
}

const intensityColor: Record<string, string> = {
  easy: "text-green-400 border-green-400/30 bg-green-400/10",
  moderate: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  hard: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  race: "text-red-400 border-red-400/30 bg-red-400/10",
  recovery: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  rest: "text-muted-foreground border-border bg-muted/30",
};

function getIntensityClass(intensity?: string) {
  if (!intensity) return "text-muted-foreground border-border bg-muted/30";
  return intensityColor[intensity.toLowerCase()] || "text-muted-foreground border-border bg-muted/30";
}

export default function PlanDetail() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(false);
  const { toast } = useToast();

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const data = await api.get<PlanDetail>(`/api/v1/plans/${planId}`);
      setPlan(data);
    } catch {
      toast({ title: "Failed to load plan", variant: "destructive" });
    }
    setLoading(false);
  };

  const adjustPlan = async () => {
    setAdjusting(true);
    try {
      await api.post(`/api/v1/plans/${planId}/adjust`);
      toast({ title: "Plan adjusted! 🔄" });
      fetchPlan();
    } catch (err: any) {
      toast({ title: "Adjust failed", description: err.message, variant: "destructive" });
    }
    setAdjusting(false);
  };

  useEffect(() => {
    if (planId) fetchPlan();
  }, [planId]);

  if (loading) {
    return (
      <div className="text-primary font-display text-xl animate-pulse text-center py-16">
        LOADING...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground font-body mb-4">Plan not found.</p>
        <Button
          variant="outline"
          onClick={() => navigate("/app/plans")}
          className="font-display text-xs uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          BACK TO PLANS
        </Button>
      </div>
    );
  }

  // Flatten workouts: either plan.workouts or from plan.weeks
  const allWorkouts: Workout[] =
    plan.workouts && plan.workouts.length > 0
      ? plan.workouts
      : plan.weeks
        ? plan.weeks.flatMap((w) => w.workouts || [])
        : [];

  // Group by week if weeks exist, otherwise group by date
  const hasWeeks = plan.weeks && plan.weeks.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/app/plans")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary font-body text-sm transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to plans
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-3xl md:text-4xl text-foreground truncate">
                {plan.name}
              </h1>
              <span
                className={`text-xs font-display uppercase tracking-wider px-2 py-0.5 shrink-0 ${
                  plan.status === "active"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {plan.status}
              </span>
            </div>
            {plan.description && (
              <p className="text-muted-foreground font-body text-sm mt-1">{plan.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-body flex-wrap">
              {plan.goal && (
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-primary" />
                  {plan.goal}
                </span>
              )}
              {plan.start_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(plan.start_date).toLocaleDateString()} —{" "}
                  {plan.end_date ? new Date(plan.end_date).toLocaleDateString() : "Ongoing"}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                {allWorkouts.length} workouts
              </span>
            </div>
          </div>

          <Button
            onClick={adjustPlan}
            disabled={adjusting}
            variant="outline"
            className="font-display text-xs uppercase tracking-wider border-border text-foreground hover:border-primary hover:text-primary shrink-0"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${adjusting ? "animate-spin" : ""}`} />
            {adjusting ? "ADJUSTING..." : "AI ADJUST"}
          </Button>
        </div>
      </div>

      {/* Workouts */}
      {allWorkouts.length === 0 ? (
        <div className="border-2 border-border bg-card p-12 text-center">
          <p className="text-muted-foreground font-body">
            No workouts in this plan yet. Try adjusting or regenerating.
          </p>
        </div>
      ) : hasWeeks ? (
        // Grouped by week
        <div className="space-y-8">
          {plan.weeks!.map((week) => (
            <div key={week.week_number}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-display text-lg text-foreground uppercase tracking-wider">
                  WEEK {week.week_number}
                </h2>
                {week.theme && (
                  <span className="text-xs text-muted-foreground font-body">— {week.theme}</span>
                )}
              </div>
              <div className="space-y-2">
                {(week.workouts || []).map((workout, idx) => (
                  <WorkoutCard key={workout.id || idx} workout={workout} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat list
        <div className="space-y-2">
          {allWorkouts.map((workout, idx) => (
            <WorkoutCard key={workout.id || idx} workout={workout} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkoutCard({ workout }: { workout: Workout }) {
  const intensityClass = getIntensityClass(workout.intensity);

  return (
    <div
      className={`border-2 border-border bg-card p-4 transition-colors hover:border-primary/30 ${
        workout.completed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {workout.completed && (
              <span className="text-primary font-display text-xs">✓</span>
            )}
            <h3 className="font-display text-sm text-foreground uppercase tracking-wider truncate">
              {workout.title || workout.workout_type || "Workout"}
            </h3>
            {workout.intensity && (
              <span
                className={`text-[10px] font-display uppercase tracking-wider px-2 py-0.5 border ${intensityClass}`}
              >
                {workout.intensity}
              </span>
            )}
            {workout.workout_type && workout.title && (
              <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
                {workout.workout_type}
              </span>
            )}
          </div>

          {workout.description && (
            <p className="text-muted-foreground font-body text-xs mt-1">{workout.description}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-body flex-wrap">
            {workout.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(workout.date).toLocaleDateString()}
              </span>
            )}
            {workout.day_of_week && !workout.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {workout.day_of_week}
              </span>
            )}
            {workout.distance_km != null && (
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {workout.distance_km} km
              </span>
            )}
            {workout.duration_minutes != null && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {workout.duration_minutes} min
              </span>
            )}
          </div>

          {workout.notes && (
            <p className="text-muted-foreground/70 font-body text-xs mt-2 italic">
              {workout.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
