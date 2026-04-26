import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError, getBody } from "./_helpers/http";
import { requireAuth } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "authorization, content-type",
      );
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      return res.status(204).end();
    }

    if (req.method !== "POST") {
      return sendError(res, 405, "Method not allowed");
    }

    const claims = await requireAuth(req);
    const supabase = getSupabaseClient();

    const body = getBody<{ code?: string }>(req);
    const code = body.code?.trim();

    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      return sendError(res, 400, "Invalid verification code format");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("phone")
      .eq("auth_user_id", claims.sub)
      .maybeSingle();

    if (!profile?.phone) {
      return sendError(
        res,
        400,
        "No phone number found. Please request a new code.",
      );
    }

    const codeKey = `sms_code:${claims.sub}:${profile.phone}`;
    const { data: storedCode, error: fetchError } = await supabase
      .from("kv_store_050eebdd")
      .select("*")
      .eq("key", codeKey)
      .maybeSingle();

    if (fetchError || !storedCode) {
      return sendError(
        res,
        400,
        "No valid verification code found. Please request a new code.",
      );
    }

    const codeData = storedCode.value as {
      code: string;
      phone: string;
      expires_at: string;
      verified: boolean;
      attempts: number;
    };

    if (codeData.verified) {
      return sendError(
        res,
        400,
        "Code has already been used. Please request a new code.",
      );
    }

    if (new Date(codeData.expires_at) < new Date()) {
      return sendError(
        res,
        400,
        "Verification code has expired. Please request a new code.",
      );
    }

    if (codeData.attempts >= 5) {
      return sendError(
        res,
        429,
        "Too many verification attempts. Please request a new code.",
      );
    }

    if (codeData.code !== code) {
      const updatedData = { ...codeData, attempts: codeData.attempts + 1 };
      await supabase
        .from("kv_store_050eebdd")
        .update({ value: updatedData })
        .eq("key", codeKey);

      const remainingAttempts = 5 - (codeData.attempts + 1);
      return sendError(
        res,
        400,
        `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
      );
    }

    const verifiedData = { ...codeData, verified: true };
    await supabase
      .from("kv_store_050eebdd")
      .update({ value: verifiedData })
      .eq("key", codeKey);

    const now = new Date().toISOString();
    await supabase
      .from("profiles")
      .update({
        phone: codeData.phone,
        phone_verified: true,
        phone_verified_at: now,
      })
      .eq("auth_user_id", claims.sub);

    return sendJson(res, 200, {
      success: true,
      message: "Phone number verified successfully",
    });
  } catch (err) {
    console.error("Verify SMS code error:", err);
    if (err instanceof Error && err.message.includes("Missing Authorization")) {
      return sendError(res, 401, "Authentication required");
    }
    return sendError(res, 500, "Internal server error");
  }
}
