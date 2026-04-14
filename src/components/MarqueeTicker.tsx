const phrases = [
  "MURDER YOUR PR",
  "DEATH TO REST DAYS",
  "PICKLED AND DANGEROUS",
  "RUN LIKE YOU STOLE IT",
  "NO PAIN NO PICKLE",
  "EMBRACE THE BRINE",
  "SALTY BY NATURE",
  "DESTROY YOUR LIMITS",
];

const MarqueeTicker = () => {
  const repeated = [...phrases, ...phrases];

  return (
    <div className="relative z-10 overflow-hidden border-y-2 border-border bg-card/50 py-3 select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((phrase, i) => (
          <span key={i} className="flex items-center">
            <span className="font-metal text-sm md:text-base tracking-[0.2em] uppercase text-muted-foreground px-6">
              {phrase}
            </span>
            <span className="text-primary text-lg">✕</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeTicker;
