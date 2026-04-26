import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import {
  trackEvent,
  identifyUser,
  resetUser,
  MIXPANEL_EVENTS,
  trackFunnelStep,
} from "@/lib/mixpanel";
import {
  identifyPostHogUser,
  resetPostHogUser,
  trackFunnelStep as trackPostHogFunnel,
  FUNNEL_STEPS,
  reloadFeatureFlags,
} from "@/lib/posthog";

export interface AuthUser {
  id: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

export interface AuthSession {
  accessToken?: string;
  claims?: Record<string, unknown>;
}

export interface AuthError {
  message: string;
}
interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  signIn: (
    email?: string,
    password?: string,
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email?: string,
    password?: string,
    username?: string,
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: () => Promise<{ error: AuthError | Error | null }>;
  getAccessToken: () => Promise<string | null>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(
      payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "="),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function AuthContextInner({ children }: { children: React.ReactNode }) {
  const {
    isLoading,
    isAuthenticated,
    user: auth0User,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthSession | null>(null);

  const user = useMemo<AuthUser | null>(() => {
    if (!isAuthenticated || !auth0User?.sub) return null;
    return {
      id: auth0User.sub,
      email: auth0User.email,
      email_verified: auth0User.email_verified,
      name: auth0User.name,
    };
  }, [auth0User, isAuthenticated]);

  useEffect(() => {
    if (!user) return;
    identifyUser(user.id, { email: user.email });
    identifyPostHogUser(user.id, { email: user.email });
    reloadFeatureFlags();
  }, [user]);

  // Check phone verification status after OAuth login
  useEffect(() => {
    if (!isAuthenticated || !user || isLoading) return;

    const checkPhoneVerification = async () => {
      try {
        const token = await getAccessTokenSilently();
        if (!token) return;

        const response = await fetch("/api/check-phone-verification", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // If user is new or phone not verified, redirect to phone verification
          // Skip if already on verify-phone page to avoid redirect loop
          if (
            !data.phone_verified &&
            !window.location.pathname.includes("/verify-phone")
          ) {
            navigate("/verify-phone");
          }
        }
      } catch (error) {
        // Silently fail - don't block user if check fails
        console.error("Error checking phone verification:", error);
      }
    };

    // Small delay to ensure token is available
    const timer = setTimeout(checkPhoneVerification, 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, isLoading, getAccessTokenSilently, navigate]);

  const getAccessToken = useMemo(
    () => async (): Promise<string | null> => {
      if (!isAuthenticated) return null;
      try {
        const token = await getAccessTokenSilently();
        setSession({
          accessToken: token,
          claims: decodeJwtPayload(token) ?? undefined,
        });
        return token;
      } catch {
        return null;
      }
    },
    [isAuthenticated, getAccessTokenSilently],
  );

  const signIn = async () => {
    try {
      trackEvent(MIXPANEL_EVENTS.SIGN_IN);
      await loginWithRedirect({
        appState: { returnTo: "/" },
      });
      return { error: null };
    } catch (e) {
      return {
        error: { message: e instanceof Error ? e.message : "Login failed" },
      };
    }
  };

  const signUp = async () => {
    try {
      trackEvent(MIXPANEL_EVENTS.SIGN_UP);
      await loginWithRedirect({
        authorizationParams: { screen_hint: "signup" },
        appState: { returnTo: "/" },
      });
      trackFunnelStep("FUNNEL_SIGNUP_COMPLETE");
      trackPostHogFunnel(FUNNEL_STEPS.SIGNUP_COMPLETE);
      return { error: null };
    } catch (e) {
      return {
        error: { message: e instanceof Error ? e.message : "Signup failed" },
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      trackEvent(MIXPANEL_EVENTS.SIGN_IN_GOOGLE);
      await loginWithRedirect({
        appState: { returnTo: "/" },
      });
      return { error: null };
    } catch (e) {
      return {
        error: {
          message: e instanceof Error ? e.message : "Google sign-in failed",
        },
      };
    }
  };

  const signOut = async () => {
    trackEvent(MIXPANEL_EVENTS.SIGN_OUT);
    resetUser();
    resetPostHogUser();
    setSession(null);
    await logout({
      logoutParams: { returnTo: `${window.location.origin}/auth` },
    });
    navigate("/auth");
  };

  const resendVerificationEmail = async () => {
    // Auth0 verification resend is handled via Auth0 flows (Universal Login / email templates).
    return {
      error: new Error("Email verification resend is managed by Auth0"),
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resendVerificationEmail,
        getAccessToken,
        loading: isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  // If Auth0 isn't configured, keep the app usable for public pages.
  if (!domain || !clientId) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          session: null,
          signIn: async () => ({
            error: { message: "Auth is not configured" },
          }),
          signUp: async () => ({
            error: { message: "Auth is not configured" },
          }),
          signInWithGoogle: async () => ({
            error: { message: "Auth is not configured" },
          }),
          signOut: async () => undefined,
          resendVerificationEmail: async () => ({
            error: new Error("Auth is not configured"),
          }),
          getAccessToken: async () => null,
          loading: false,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      cacheLocation="localstorage"
      useRefreshTokens
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience || undefined,
      }}
      onRedirectCallback={(appState) => {
        const to = (appState as { returnTo?: string } | undefined)?.returnTo;
        navigate(to || "/");
      }}
    >
      <AuthContextInner>{children}</AuthContextInner>
    </Auth0Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
