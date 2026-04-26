import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError, getBody, getClientIp } from "./_helpers/http";
import { getSupabaseClient } from "./_helpers/supabase";

// Simple in-memory rate limiting (resets on function restart)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count++;
  return false;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return sendError(res, 405, "Method not allowed");
    }

    const clientIp = getClientIp(req) || "unknown";

    if (isRateLimited(clientIp)) {
      return sendError(res, 429, "Too many requests. Please try again later.");
    }

    const body = getBody<{ email?: string; marketingConsent?: boolean }>(req);
    const { email, marketingConsent } = body;

    if (!email || typeof email !== "string") {
      return sendError(res, 400, "Email is required");
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      return sendError(res, 400, "Invalid email format");
    }

    if (marketingConsent !== true) {
      return sendError(res, 400, "Marketing consent is required");
    }

    const supabase = getSupabaseClient();

    const { data: existing, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (fetchError) {
      return sendError(res, 500, "Failed to check subscription");
    }

    if (existing) {
      if (existing.is_active) {
        return sendError(res, 409, "This email is already subscribed");
      }

      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          is_active: true,
          opted_in_marketing: true,
          unsubscribed_at: null,
        })
        .eq("id", existing.id);

      if (updateError) {
        return sendError(res, 500, "Failed to reactivate subscription");
      }

      return sendJson(res, 200, {
        success: true,
        message: "Subscription reactivated successfully",
      });
    }

    const now = new Date().toISOString();
    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: trimmedEmail,
        opted_in_marketing: true,
        is_active: true,
        subscribed_at: now,
        unsubscribed_at: null,
      });

    if (insertError) {
      return sendError(res, 500, "Failed to subscribe");
    }

    return sendJson(res, 200, {
      success: true,
      message: "Subscribed successfully",
    });
  } catch (err) {
    console.error("Newsletter subscription error:", err);

    if (err instanceof Error && err.message.includes("environment variable")) {
      console.error(
        "Supabase configuration error - check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars",
      );
      return sendError(
        res,
        503,
        "Service temporarily unavailable. Please try again later.",
      );
    }

    return sendError(
      res,
      500,
      "Failed to process subscription. Please try again later.",
    );
  }
}
