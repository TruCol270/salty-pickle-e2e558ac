import { useState } from "react";
import useScrollReveal from "@/hooks/use-scroll-reveal";
import { Zap, Brain, CloudRain, TrendingUp, Quote, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import skullPickle from "@/assets/skull-pickle.png";
import spraySplatters from "@/assets/spray-splatters.png";
import skatePickle from "@/assets/skate-pickle.png";
import saltyPickleLogo from "@/assets/salty-pickle-logo.png";
import saltyPickleIcon from "@/assets/salty-pickle-icon.png";

const features = [
  {
    icon: Brain,
    title: "LEARNS YOUR BODY",
    description: "Our AI doesn't just track miles — it reads your fatigue, recovery, and performance patterns like a psychic with a stopwatch.",
  },
  {
    icon: Zap,
    title: "ADAPTS ON THE FLY",
    description: "Missed a run? Crushed a PR? Your plan reshuffles itself in real-time. No guilt trips, just gains.",
  },
  {
    icon: CloudRain,
    title: "WEATHER AWARE",
    description: "Heat wave? Ice storm? Salty Pickle adjusts intensity and timing so you're not dying out there (unless you want to).",
  },
  {
    icon: TrendingUp,
    title: "RAW PROGRESS",
    description: "No sugarcoating. See exactly where you're crushing it and where you need to grind harder. Stats with attitude.",
  },
];

const testimonials = [
  {
    quote: "I told Salty Pickle I ran a half marathon hungover and it just... adjusted. No judgment. Respect.",
    name: "Jess K.",
    detail: "Ultra runner, 3x DNF survivor",
  },
  {
    quote: "My old plan had me doing tempo runs in a thunderstorm. Salty Pickle told me to stay home and stretch. It gets me.",
    name: "Marcus D.",
    detail: "Marathon PB: 3:12",
  },
  {
    quote: "I skipped two weeks for a surf trip. Came back to a plan that actually made sense. This pickle is smarter than my coach.",
    name: "Tara L.",
    detail: "Trail runner & chaos agent",
  },
];

const pricingTiers = [
  {
    name: "FREE PICKLE",
    price: "$0",
    description: "Dip your toes in the brine",
    features: [
      { text: "Basic adaptive plan", included: true },
      { text: "Weekly adjustments", included: true },
      { text: "Community access", included: true },
      { text: "Weather integration", included: false },
      { text: "AI coaching insights", included: false },
    ],
    cta: "START FREE",
    highlighted: false,
  },
  {
    name: "SALTY PRO",
    price: "$9",
    period: "/mo",
    description: "For runners who mean business",
    features: [
      { text: "Full adaptive AI plan", included: true },
      { text: "Daily adjustments", included: true },
      { text: "Weather & fatigue aware", included: true },
      { text: "AI coaching insights", included: true },
      { text: "Priority support", included: false },
    ],
    cta: "GO PRO",
    highlighted: true,
  },
  {
    name: "ELITE BRINE",
    price: "$19",
    period: "/mo",
    description: "Unlimited chaos, unlimited gains",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Real-time plan shifts", included: true },
      { text: "Race strategy AI", included: true },
      { text: "1-on-1 AI coaching", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "GO ELITE",
    highlighted: false,
  },
];

const Index = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const featuresHeading = useScrollReveal<HTMLDivElement>();
  const featuresGrid = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const testimonialsSection = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const pricingSection = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const bottomCta = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Invalid email", description: "Enter a real email, pickle.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("email_subscribers").insert({ email: trimmed });
    setIsSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already signed up! 🥒", description: "You're already on the list. We see you." });
      } else {
        toast({ title: "Something broke", description: "Try again in a sec.", variant: "destructive" });
      }
      return;
    }

    toast({ title: "You're in! 🔥", description: "Welcome to the pickle club. We'll be in touch." });
    setEmail("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Spray splatter - top right decorative */}
      <img
        src={spraySplatters}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={600}
        height={400}
        className="absolute top-0 right-0 w-[500px] opacity-15 pointer-events-none select-none rotate-12"
      />
      {/* Spray splatter - bottom left decorative */}
      <img
        src={spraySplatters}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={600}
        height={400}
        className="absolute bottom-0 left-0 w-[400px] opacity-10 pointer-events-none select-none -rotate-45 scale-x-[-1]"
      />

      {/* ==================== HERO ==================== */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Skull pickle floating behind the headline */}
        <img
          src={skullPickle}
          alt="Salty Pickle skull logo"
          width={300}
          height={300}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] md:w-[380px] opacity-10 pointer-events-none select-none"
        />

        <img
          src={saltyPickleLogo}
          alt="Salty Pickle"
          width={400}
          height={170}
          className="w-[280px] sm:w-[350px] md:w-[420px] mb-6"
        />

        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none tracking-tight glitch-text">
          <span className="block text-foreground">TRAIN HARD.</span>
          <span className="block text-primary mt-2">RUN DIRTY.</span>
        </h1>

        <p className="mt-8 max-w-xl text-lg md:text-xl text-muted-foreground font-body leading-relaxed relative z-10">
          AI-powered running plans that adapt to your life, your body, and your
          chaos. No cookie-cutter BS — just a plan that{" "}
          <span className="text-primary font-semibold scratch-underline">actually keeps up with you</span>.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 relative z-10">
          <Button
            size="lg"
            className="glow-pulse bg-primary text-primary-foreground font-display text-lg px-10 py-6 uppercase tracking-wider border-2 border-primary hover:bg-primary/80 transition-all duration-200 hover:scale-105"
          >
            GET STARTED
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="font-body text-lg px-10 py-6 uppercase tracking-wider border-2 border-muted-foreground/30 text-foreground hover:border-primary hover:text-primary transition-all duration-200"
          >
            LEARN MORE ↓
          </Button>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
          <span className="text-xs uppercase tracking-widest font-body">Scroll</span>
          <div className="w-px h-8 bg-muted-foreground/40" />
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        {/* Skate deck floating on the right side */}
        <img
          src={skatePickle}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={512}
          height={1024}
          className="absolute -right-16 md:right-8 top-1/2 -translate-y-1/2 w-[150px] md:w-[200px] opacity-20 pointer-events-none select-none rotate-[15deg]"
        />

        <div
          ref={featuresHeading.ref}
          className={`text-center mb-16 md:mb-24 transition-all duration-700 ${featuresHeading.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-foreground">
            NOT YOUR GRANDMA'S
            <br />
            <span className="text-secondary">TRAINING PLAN</span>
          </h2>
          <p className="mt-6 text-muted-foreground font-body text-lg max-w-lg mx-auto">
            Powered by LLMs. Fueled by chaos. Built for runners who don't do "easy."
          </p>
        </div>

        <div ref={featuresGrid.ref} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group relative border-2 border-border bg-card p-8 transition-all duration-500 hover:border-primary hover:-translate-y-1 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)] ${featuresGrid.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
              style={{
                transform: `rotate(${i % 2 === 0 ? "-0.5" : "0.5"}deg)`,
                transitionDelay: featuresGrid.isVisible ? `${i * 150}ms` : "0ms",
              }}
            >
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary/30 group-hover:border-primary transition-colors" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary/30 group-hover:border-primary transition-colors" />

              <feature.icon className="w-10 h-10 text-primary mb-4 group-hover:animate-slam-in" />
              <h3 className="font-display text-xl md:text-2xl text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-body leading-relaxed text-sm md:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <div
          ref={testimonialsSection.ref}
          className={`max-w-5xl mx-auto transition-all duration-700 ${testimonialsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-foreground">
              REAL <span className="text-primary">RUNNERS</span>
              <br />
              REAL TALK
            </h2>
            <p className="mt-6 text-muted-foreground font-body text-lg max-w-lg mx-auto">
              Don't take our word for it. These pickled athletes did.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`relative border-2 border-border bg-card p-8 transition-all duration-500 hover:border-secondary ${testimonialsSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{
                  transform: `rotate(${i === 0 ? "-1" : i === 2 ? "1" : "0"}deg)`,
                  transitionDelay: testimonialsSection.isVisible ? `${i * 150 + 200}ms` : "0ms",
                }}
              >
                <Quote className="w-8 h-8 text-secondary/40 mb-4" />
                <p className="text-foreground font-body text-sm md:text-base leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-display text-base text-primary">{t.name}</p>
                  <p className="text-muted-foreground font-body text-xs mt-1">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <div
          ref={pricingSection.ref}
          className={`max-w-5xl mx-auto transition-all duration-700 ${pricingSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-foreground">
              PICK YOUR <span className="text-accent">BRINE</span>
            </h2>
            <p className="mt-6 text-muted-foreground font-body text-lg max-w-lg mx-auto">
              Every plan comes with attitude. Premium just gets you more of it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`relative border-2 bg-card p-8 flex flex-col transition-all duration-500 ${
                  tier.highlighted
                    ? "border-primary shadow-[0_0_40px_hsl(var(--primary)/0.2)] scale-[1.02] md:scale-105"
                    : "border-border hover:border-muted-foreground/40"
                } ${pricingSection.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{
                  transitionDelay: pricingSection.isVisible ? `${i * 150 + 200}ms` : "0ms",
                }}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-display text-xs px-4 py-1 uppercase tracking-wider">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="font-display text-xl md:text-2xl text-foreground mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-4xl md:text-5xl text-primary">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground font-body text-sm">{tier.period}</span>}
                </div>
                <p className="text-muted-foreground font-body text-sm mb-6">{tier.description}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm font-body">
                      {f.included ? (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/40"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`font-display text-base uppercase tracking-wider border-2 transition-all duration-200 hover:scale-105 w-full ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/80"
                      : "bg-transparent text-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BOTTOM CTA ==================== */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <div
          ref={bottomCta.ref}
          className={`max-w-3xl mx-auto text-center border-2 border-border p-12 md:p-16 relative bg-card transition-all duration-700 ${bottomCta.isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-16 scale-95"}`}
        >
          <div className="absolute -top-3 left-1/4 w-24 h-6 bg-accent/80 -rotate-2" />
          <div className="absolute -top-3 right-1/4 w-20 h-6 bg-primary/80 rotate-1" />

          {/* Small skull pickle accent */}
          <img
            src={skullPickle}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={120}
            height={120}
            className="absolute -bottom-10 -right-10 w-[100px] md:w-[120px] opacity-30 pointer-events-none select-none rotate-12"
          />

          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-foreground mb-6">
            STOP <span className="text-primary">RUNNING</span>
            <br />
            BORING PLANS
          </h2>
          <p className="text-muted-foreground font-body text-lg mb-10 max-w-md mx-auto">
            Sign up and let Salty Pickle build you a training plan that's as unpredictable as your life.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 bg-background border-2 border-border text-foreground font-body placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground font-display text-base px-8 py-3 uppercase tracking-wider border-2 border-primary hover:bg-primary/80 transition-all duration-200 hover:scale-105 whitespace-nowrap disabled:opacity-50"
            >
              {isSubmitting ? "HOLD ON..." : "LET'S GO 🔥"}
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground font-body">
            By signing up you agree to let a pickle coach you. No spam, just gains.
          </p>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative z-10 border-t border-border py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={saltyPickleIcon} alt="Salty Pickle" width={32} height={32} className="w-8 h-8" />
            <span className="font-metal text-sm tracking-[0.2em] uppercase text-muted-foreground">
              Salty Pickle © 2026
            </span>
          </div>
          <div className="flex gap-6 text-muted-foreground font-body text-sm">
            <a href="#" className="hover:text-primary transition-colors">GitHub</a>
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
