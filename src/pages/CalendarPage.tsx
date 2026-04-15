import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { RefreshCw } from "lucide-react";

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
  const [syncing, setSyncing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const fetchEvents = useCallback(() => {
    setLoading(true);
    api
      .get<CalendarEvent[]>("/api/v1/calendar/events?days=30")
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setEvents(arr);
      })
      .catch(() => toast({ title: "Failed to load calendar", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post("/api/v1/calendar/sync");
      toast({ title: "Calendar synced" });
      fetchEvents();
    } catch {
      toast({ title: "Sync failed", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  // Dates that have events
  const eventDates = events
    .filter((ev) => ev.start)
    .map((ev) => new Date(ev.start!));

  // Events for the selected date
  const selectedEvents = selectedDate
    ? events.filter((ev) => {
        if (!ev.start) return false;
        const d = new Date(ev.start);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      })
    : [];

  // Group all events by date for the list view
  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    const date = ev.start ? new Date(ev.start).toLocaleDateString() : "Unscheduled";
    (acc[date] = acc[date] || []).push(ev);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">CALENDAR</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            Upcoming 30 days of training.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 border-2 border-primary text-primary px-4 py-2 font-display text-sm uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "SYNCING…" : "SYNC"}
        </button>
      </div>

      {/* Workout type legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {[
          { label: "Easy / Recovery", color: "bg-green-500" },
          { label: "Long Run", color: "bg-blue-500" },
          { label: "Interval / Speed", color: "bg-red-500" },
          { label: "Tempo / Threshold", color: "bg-orange-500" },
          { label: "Race", color: "bg-pink-500" },
          { label: "Cross-training", color: "bg-purple-500" },
          { label: "Rest", color: "bg-muted-foreground" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
            <span className="text-muted-foreground font-body text-xs">{item.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-primary font-display text-xl animate-pulse text-center py-16">
          LOADING...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
          {/* Mini calendar */}
          <div className="border-2 border-border bg-card p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{ hasEvent: "bg-primary/20 text-primary font-bold" }}
            />
          </div>

          {/* Event detail panel */}
          <div className="space-y-4 min-w-0">
            {selectedDate ? (
              <>
                <h2 className="font-display text-sm text-primary uppercase tracking-wider">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                {selectedEvents.length === 0 ? (
                  <div className="border border-border bg-card p-6 text-center">
                    <p className="text-muted-foreground font-body text-sm">
                      No workouts scheduled for this day.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedEvents.map((ev, i) => (
                      <EventCard key={ev.id || i} event={ev} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Show all upcoming if no date selected */
              <>
                <h2 className="font-display text-sm text-primary uppercase tracking-wider">
                  ALL UPCOMING
                </h2>
                {Object.keys(grouped).length === 0 ? (
                  <div className="border-2 border-border bg-card p-12 text-center">
                    <p className="text-muted-foreground font-body">
                      No events scheduled. Hit SYNC to pull workouts from your plan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(grouped).map(([date, evts]) => (
                      <div key={date}>
                        <h3 className="font-display text-xs text-muted-foreground uppercase tracking-wider mb-2">
                          {date}
                        </h3>
                        <div className="space-y-2">
                          {evts.map((ev, i) => (
                            <EventCard key={ev.id || i} event={ev} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const WORKOUT_COLORS: Record<string, { dot: string; border: string; label: string }> = {
  easy: { dot: "bg-green-500", border: "hover:border-green-500/40", label: "text-green-400" },
  recovery: { dot: "bg-green-500", border: "hover:border-green-500/40", label: "text-green-400" },
  long: { dot: "bg-blue-500", border: "hover:border-blue-500/40", label: "text-blue-400" },
  interval: { dot: "bg-red-500", border: "hover:border-red-500/40", label: "text-red-400" },
  intervals: { dot: "bg-red-500", border: "hover:border-red-500/40", label: "text-red-400" },
  speed: { dot: "bg-red-500", border: "hover:border-red-500/40", label: "text-red-400" },
  tempo: { dot: "bg-orange-500", border: "hover:border-orange-500/40", label: "text-orange-400" },
  threshold: { dot: "bg-orange-500", border: "hover:border-orange-500/40", label: "text-orange-400" },
  race: { dot: "bg-pink-500", border: "hover:border-pink-500/40", label: "text-pink-400" },
  rest: { dot: "bg-muted-foreground", border: "hover:border-muted-foreground/40", label: "text-muted-foreground" },
  cross: { dot: "bg-purple-500", border: "hover:border-purple-500/40", label: "text-purple-400" },
};

function getWorkoutColor(event: CalendarEvent) {
  const text = `${event.type || ""} ${event.title || ""} ${event.summary || ""}`.toLowerCase();
  for (const [key, colors] of Object.entries(WORKOUT_COLORS)) {
    if (text.includes(key)) return colors;
  }
  return { dot: "bg-primary", border: "hover:border-primary/40", label: "text-primary" };
}

function EventCard({ event }: { event: CalendarEvent }) {
  const colors = getWorkoutColor(event);
  return (
    <div className={`border border-border bg-card p-4 flex items-center gap-4 ${colors.border} transition-colors`}>
      <div className={`w-2 h-2 rounded-full ${colors.dot} shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-body text-sm truncate">
          {event.title || event.summary || "Training event"}
        </p>
        {event.type && (
          <p className={`${colors.label} font-body text-xs mt-0.5 uppercase tracking-wider`}>{event.type}</p>
        )}
      </div>
      {event.start && (
        <span className="text-muted-foreground font-body text-xs shrink-0">
          {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}
