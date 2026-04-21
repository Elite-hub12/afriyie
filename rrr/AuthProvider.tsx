import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  displayName: string | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_CLOCK_TOLERANCE_SECONDS = 60;

function getAuthStorageKey() {
  const authWithStorageKey = supabase.auth as typeof supabase.auth & { storageKey?: string };
  if (authWithStorageKey.storageKey) return authWithStorageKey.storageKey;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) return null;

  try {
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
    return `sb-${projectRef}-auth-token`;
  } catch {
    return null;
  }
}

function persistNormalizedSession(session: Session) {
  if (typeof window === "undefined") return;

  const storageKey = getAuthStorageKey();
  if (!storageKey) return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(session));
  } catch {}
}

function normalizeSessionClock(session: Session | null) {
  if (!session?.expires_in || !session.expires_at) return session;

  const localExpiresAt = Math.floor(Date.now() / 1000) + session.expires_in;
  const clockDrift = Math.abs(session.expires_at - localExpiresAt);

  if (clockDrift <= SESSION_CLOCK_TOLERANCE_SECONDS) return session;

  const normalizedSession = { ...session, expires_at: localExpiresAt };
  persistNormalizedSession(normalizedSession);
  return normalizedSession;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const syncIdRef = useRef(0);

  const syncAuthState = async (nextSession: Session | null) => {
    const syncId = ++syncIdRef.current;
    const normalizedSession = normalizeSessionClock(nextSession);

    setSession(normalizedSession);
    setUser(normalizedSession?.user ?? null);

    if (!normalizedSession?.user) {
      setDisplayName(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const userId = normalizedSession.user.id;
      const [{ data: profile }, { data: role }] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle(),
      ]);

      if (syncId !== syncIdRef.current) return;

      setDisplayName(profile?.display_name ?? normalizedSession.user.user_metadata.display_name ?? null);
      setIsAdmin(!!role);
    } finally {
      if (syncId === syncIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "SIGNED_OUT") {
        void syncAuthState(null);
        return;
      }

      if (newSession) {
        void syncAuthState(newSession);
        return;
      }

      void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        void syncAuthState(currentSession);
      });
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      void syncAuthState(existing);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, displayName, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
