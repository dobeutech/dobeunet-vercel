import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError, getBody, getClientIp } from "./_helpers/http";
import { requireAuth, requirePermission } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = getSupabaseClient();
    const id = (req.query.id as string | undefined)?.trim();

    if (req.method === "POST") {
      // Public endpoint for website contact form. (Auth not required)
      const body = getBody<{
        name?: string;
        email?: string;
        phone?: string | null;
        message?: string;
        smsConsent?: boolean;
        marketingConsent?: boolean;
      }>(req);

      const name = (body.name || "").trim();
      const email = (body.email || "").trim().toLowerCase();
      const message = (body.message || "").trim();
      const phone = body.phone ? String(body.phone).trim() : null;

      if (name.length < 2)
        return sendError(res, 400, "Name must be at least 2 characters");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return sendError(res, 400, "Please enter a valid email address");
      if (message.length < 10)
        return sendError(res, 400, "Message must be at least 10 characters");
      if (phone && phone.length > 20)
        return sendError(res, 400, "Phone must be less than 20 characters");

      const smsConsent = Boolean(body.smsConsent);
      if (phone && !smsConsent)
        return sendError(
          res,
          400,
          "SMS consent is required when providing a phone number",
        );

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("contact_submissions")
        .insert({
          name,
          email,
          phone,
          message,
          sms_consent: smsConsent,
          marketing_consent: Boolean(body.marketingConsent),
          status: "new",
          notes: null,
          ip_address: getClientIp(req),
          user_agent: (req.headers["user-agent"] as string | undefined) || null,
          submitted_at: now,
          responded_at: null,
          created_at: now,
        })
        .select()
        .single();

      if (error) {
        return sendError(res, 500, "Failed to save submission", error.message);
      }

      return sendJson(res, 200, { success: true, submission: data });
    }

    // Admin endpoints
    const claims = await requireAuth(req);
    requirePermission(claims, "admin:access");

    if (req.method === "GET") {
      const status = req.query.status as string | undefined;

      let query = supabase
        .from("contact_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        return sendError(
          res,
          500,
          "Failed to fetch submissions",
          error.message,
        );
      }

      return sendJson(res, 200, data);
    }

    if (req.method === "PATCH") {
      if (!id) return sendError(res, 400, "Missing id");

      const body = getBody<{
        notes?: string | null;
        status?: string;
      }>(req);

      const now = new Date().toISOString();
      const update: Record<string, unknown> = { updated_at: now };

      if (typeof body.notes === "string" || body.notes === null)
        update.notes = body.notes;
      if (typeof body.status === "string") {
        update.status = body.status;
        if (body.status === "responded") update.responded_at = now;
      }

      const { data, error } = await supabase
        .from("contact_submissions")
        .update(update)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return sendError(res, 404, "Not found");
        }
        return sendError(
          res,
          500,
          "Failed to update submission",
          error.message,
        );
      }

      return sendJson(res, 200, data);
    }

    return sendError(res, 405, "Method not allowed");
  } catch (err) {
    return sendError(
      res,
      500,
      "Internal error",
      err instanceof Error ? err.message : String(err),
    );
  }
}
