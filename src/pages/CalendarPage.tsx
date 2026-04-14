import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id?: string;
  title?: string;
  summary?: string;
  start?: string;
  end?: string;
  type?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    api
      .get<CalendarEvent[]>("/api/v1/calendar/events?days=30")
      .then(setEvents)
      .catch(() => toast({ title: "Failed to load calendar", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    const date = ev.start ? new Date(ev.start).toLocaleDateString() : "Unscheduled";
    (acc[date] = acc[date] || []).push(ev);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">CALENDAR</h1>
        <p className="text-muted-foreground font-body text-sm mt-1">
          Upcoming 30 days of training.
        </p>
      </div>

      {loading ? (
        <div className="text-primary font-display text-xl animate-pulse text-center py-16">
          LOADING...
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="border-2 border-border bg-card p-12 text-center">
          <p className="text-muted-foreground font-body">
            No events scheduled. Sync a plan to your calendar from the Plans page.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, evts]) => (
            <div key={date}>
              <h2 className="font-display text-sm text-primary uppercase tracking-wider mb-3">
                {date}
              </h2>
              <div className="space-y-2">
                {evts.map((ev, i) => (
                  <div
                    key={ev.id || i}
                    className="border border-border bg-card p-4 flex items-center gap-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-body text-sm truncate">
                        {ev.title || ev.summary || "Training event"}
                      </p>
                      {ev.type && (
                        <p className="text-muted-foreground font-body text-xs mt-0.5">{ev.type}</p>
                      )}
                    </div>
                    {ev.start && (
                      <span className="text-muted-foreground font-body text-xs shrink-0">
                        {new Date(ev.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
