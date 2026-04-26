import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, Phone, CheckCircle2 } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyPhone() {
  const { getAccessToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Check if already verified
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const checkVerificationStatus = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        navigate("/auth");
        return;
      }

      const response = await fetch("/api/check-phone-verification", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.phone_verified) {
          setVerified(true);
          setTimeout(() => navigate("/"), 2000);
        } else if (data.phone) {
          setPhone(data.phone);
          setStep("code");
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to continue",
        });
        navigate("/auth");
        return;
      }

      const response = await fetch("/api/send-sms-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("code");
        setCountdown(10 * 60); // 10 minutes
        toast({
          title: "Code sent",
          description: "Verification code has been sent to your phone",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to send code",
          description: data.error || "Please try again",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send verification code. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "Please enter the 6-digit verification code",
      });
      return;
    }

    setLoading(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to continue",
        });
        navigate("/auth");
        return;
      }

      const response = await fetch("/api/verify-sms-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerified(true);
        toast({
          title: "Phone verified",
          description: "Your phone number has been verified successfully",
        });
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description:
            data.error || "Invalid verification code. Please try again.",
        });
        setCode("");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify code. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch("/api/send-sms-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        setCountdown(10 * 60);
        toast({
          title: "Code resent",
          description: "A new verification code has been sent",
        });
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Failed to resend",
          description: data.error || "Please try again",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend code. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
        <Card className="w-full max-w-md shadow-elegant">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold">Phone Verified!</h2>
              <p className="text-muted-foreground">
                Redirecting you to the dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Phone className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {step === "phone"
              ? "Verify Your Phone Number"
              : "Enter Verification Code"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "phone"
              ? "We need to verify your phone number to complete your account setup"
              : `Enter the 6-digit code sent to ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formatPhoneNumber(phone)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    if (digits.length <= 10) {
                      setPhone(digits);
                    }
                  }}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  US phone numbers only. Standard message rates may apply.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || phone.length < 10}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={setCode}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || code.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend code in {Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, "0")}
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-sm"
                  >
                    Resend code
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
