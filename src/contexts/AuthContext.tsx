import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";

interface Integrations {
  strava: boolean;
  google: boolean;
  whoop: boolean;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  integrations: Integrations | null;
  login: (token: string) => void;
  logout: () => void;
  refreshIntegrations: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("sp_token"));
  const [isLoading, setIsLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integrations | null>(null);

  const login = (newToken: string) => {
    localStorage.setItem("sp_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("sp_token");
    setToken(null);
    setIntegrations(null);
  };

  const refreshIntegrations = async () => {
    try {
      const data = await api.get<Integrations>("/api/v1/integrations");
      setIntegrations(data);
    } catch {
      // If integrations fail, user might not be authenticated
    }
  };

  useEffect(() => {
    if (token) {
      refreshIntegrations().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        integrations,
        login,
        logout,
        refreshIntegrations,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
