import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * Component that checks phone verification status and redirects if needed
 * Should be used in protected routes that require phone verification
 */
export function PhoneVerificationGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, getAccessToken, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setChecking(false);
      return;
    }

    const checkVerification = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          setChecking(false);
          return;
        }

        const response = await fetch("/api/check-phone-verification", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (!data.phone_verified) {
            navigate("/verify-phone");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking phone verification:", error);
      } finally {
        setChecking(false);
      }
    };

    checkVerification();
  }, [user, authLoading, getAccessToken, navigate]);

  if (checking || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying account...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
