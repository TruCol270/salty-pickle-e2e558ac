import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Plus } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  status: string;
  start_date?: string;
  end_date?: string;
  goal?: string;
  description?: string;
}

export default function Plans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await api.get<Plan[]>("/api/v1/plans");
      setPlans(data);
    } catch {
      toast({ title: "Failed to load plans", variant: "destructive" });
    }
    setLoading(false);
  };

  const generatePlan = async () => {
    setGenerating(true);
    try {
      await api.post("/api/v1/plans/ai-generate");
      toast({ title: "Plan generated! 🧠🔥" });
      fetchPlans();
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">TRAINING PLANS</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            Create, manage, and evolve your plans.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={generatePlan}
            disabled={generating}
            className="font-display text-xs uppercase tracking-wider bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/80"
          >
            <Sparkles className={`w-4 h-4 mr-2 ${generating ? "animate-spin" : ""}`} />
            {generating ? "GENERATING..." : "AI GENERATE"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-primary font-display text-xl animate-pulse text-center py-16">
          LOADING...
        </div>
      ) : plans.length === 0 ? (
        <div className="border-2 border-border bg-card p-12 text-center">
          <p className="text-muted-foreground font-body mb-6">
            No plans yet. Let the AI build one for you, or create your own.
          </p>
          <Button
            onClick={generatePlan}
            disabled={generating}
            className="font-display text-sm uppercase tracking-wider bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/80"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            GENERATE MY FIRST PLAN
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border-2 bg-card p-6 transition-colors hover:border-primary/50 ${
                plan.status === "active" ? "border-primary" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-lg text-foreground truncate">{plan.name}</h3>
                    <span
                      className={`text-xs font-display uppercase tracking-wider px-2 py-0.5 ${
                        plan.status === "active"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>
                  {plan.description && (
                    <p className="text-muted-foreground font-body text-sm mt-1 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                  <p className="text-muted-foreground font-body text-xs mt-2">
                    {plan.start_date
                      ? `${new Date(plan.start_date).toLocaleDateString()} — ${plan.end_date ? new Date(plan.end_date).toLocaleDateString() : "Ongoing"}`
                      : "No dates set"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/app/plans/${plan.id}`)}
                  className="font-display text-xs uppercase tracking-wider border-border text-foreground hover:border-primary hover:text-primary shrink-0"
                >
                  VIEW
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
