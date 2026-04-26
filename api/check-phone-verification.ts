import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError } from "./_helpers/http";
import { requireAuth } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "authorization");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      return res.status(204).end();
    }

    if (req.method !== "GET") {
      return sendError(res, 405, "Method not allowed");
    }

    const claims = await requireAuth(req);
    const supabase = getSupabaseClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("phone, phone_verified")
      .eq("auth_user_id", claims.sub)
      .maybeSingle();

    if (!profile) {
      return sendJson(res, 200, {
        phone_verified: false,
        phone: null,
        is_new_user: true,
      });
    }

    return sendJson(res, 200, {
      phone_verified: profile.phone_verified === true,
      phone: profile.phone || null,
      is_new_user: false,
    });
  } catch (err) {
    console.error("Check phone verification error:", err);
    if (err instanceof Error && err.message.includes("Missing Authorization")) {
      return sendError(res, 401, "Authentication required");
    }
    return sendError(res, 500, "Internal server error");
  }
}
