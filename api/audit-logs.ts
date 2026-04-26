import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError, getBody } from "./_helpers/http";
import { requireAuth, requirePermission } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = getSupabaseClient();
    const claims = await requireAuth(req);

    if (req.method === "POST") {
      const body = getBody<{
        action?: string;
        entity_type?: string;
        entity_id?: string | null;
        old_values?: unknown;
        new_values?: unknown;
        user_agent?: string | null;
      }>(req);

      if (!body.action || !body.entity_type)
        return sendError(
          res,
          400,
          "Missing required fields: action, entity_type",
        );

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("audit_logs")
        .insert({
          user_id: claims.sub,
          action: body.action,
          entity_type: body.entity_type,
          entity_id: body.entity_id ?? null,
          old_values: body.old_values ?? null,
          new_values: body.new_values ?? null,
          user_agent:
            body.user_agent ??
            ((req.headers["user-agent"] as string | undefined) || null),
          created_at: now,
        })
        .select()
        .single();

      if (error) {
        return sendError(
          res,
          500,
          "Failed to create audit log",
          error.message,
        );
      }

      return sendJson(res, 201, data);
    }

    // Admin-only read access
    requirePermission(claims, "admin:access");

    if (req.method === "GET") {
      const action = req.query.action as string | undefined;
      const entityType = req.query.entity_type as string | undefined;
      const limitRaw = req.query.limit as string | undefined;

      const limit = Math.min(Number(limitRaw || 100), 500);

      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (action && action !== "all") {
        query = query.eq("action", action);
      }
      if (entityType && entityType !== "all") {
        query = query.eq("entity_type", entityType);
      }

      const { data, error } = await query;

      if (error) {
        return sendError(res, 500, "Failed to fetch audit logs", error.message);
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
