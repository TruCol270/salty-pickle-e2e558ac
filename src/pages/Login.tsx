import { getApiBase } from "@/lib/api";
import saltyPickleLogo from "@/assets/salty-pickle-logo.png";
import skullPickle from "@/assets/skull-pickle.png";

const FRONTEND_URL = window.location.origin;

export default function Login() {
  const base = getApiBase();

  const handleStrava = () => {
    window.location.href = `${base}/auth/strava/authorize?redirect_url=${encodeURIComponent(FRONTEND_URL + "/auth/callback")}`;
  };

  const handleGoogle = () => {
    window.location.href = `${base}/auth/google/authorize?redirect_url=${encodeURIComponent(FRONTEND_URL + "/auth/callback")}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      <div className="grain-overlay" />

      <img
        src={skullPickle}
        alt=""
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] opacity-5 pointer-events-none select-none"
      />

      <div className="relative z-10 w-full max-w-sm text-center">
        <img src={saltyPickleLogo} alt="Salty Pickle" className="w-[240px] mx-auto mb-8" />

        <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-2">
          LET'S <span className="text-primary">GO</span>
        </h1>
        <p className="text-muted-foreground font-body text-sm mb-10">
          Connect your running account to get started.
        </p>

        <div className="space-y-4">
          {/* Strava */}
          <button
            onClick={handleStrava}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-[#FC4C02] bg-[#FC4C02]/10 text-foreground font-display text-base uppercase tracking-wider hover:bg-[#FC4C02]/20 transition-all duration-200 hover:scale-[1.02]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FC4C02]">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            CONNECT WITH STRAVA
          </button>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-border bg-card text-foreground font-display text-base uppercase tracking-wider hover:border-primary hover:bg-muted transition-all duration-200 hover:scale-[1.02]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            SIGN IN WITH GOOGLE
          </button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground font-body">
          By signing in, you agree to let a pickle coach you.
        </p>

        <a
          href="/"
          className="inline-block mt-6 text-sm text-muted-foreground hover:text-primary font-body transition-colors"
        >
          ← Back to home
        </a>
      </div>
    </div>
  );
}
