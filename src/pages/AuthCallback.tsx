import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token") || searchParams.get("access_token");
    const err = searchParams.get("error");

    if (err) {
      setError(err);
      return;
    }

    if (token) {
      login(token);
      navigate("/app", { replace: true });
    } else {
      setError("No token received. Try logging in again.");
    }
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl text-destructive mb-4">AUTH FAILED</h1>
          <p className="text-muted-foreground font-body mb-6">{error}</p>
          <a
            href="/login"
            className="text-primary font-display text-sm uppercase tracking-wider hover:underline"
          >
            TRY AGAIN
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-primary font-display text-2xl animate-pulse">AUTHENTICATING...</div>
    </div>
  );
}
