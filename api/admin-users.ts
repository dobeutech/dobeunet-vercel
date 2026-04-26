import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError, getBody } from "./_helpers/http";
import { requireAuth, requirePermission } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const claims = await requireAuth(req);
    requirePermission(claims, "admin:access");

    const supabase = getSupabaseClient();

    if (req.method === "GET") {
      const [profilesResult, rolesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      if (profilesResult.error) {
        return sendError(
          res,
          500,
          "Failed to fetch profiles",
          profilesResult.error.message,
        );
      }

      if (rolesResult.error) {
        return sendError(
          res,
          500,
          "Failed to fetch roles",
          rolesResult.error.message,
        );
      }

      return sendJson(res, 200, {
        profiles: profilesResult.data,
        roles: rolesResult.data,
      });
    }

    if (req.method === "POST") {
      const rawBody = getBody<unknown>(req);
      if (!rawBody || typeof rawBody !== "object") {
        return sendError(res, 400, "Invalid JSON body");
      }
      const body = rawBody as {
        user_id?: string;
        role?: "admin" | "moderator" | "user";
        enabled?: boolean;
      };
      if (!body.user_id || !body.role)
        return sendError(res, 400, "Missing user_id or role");
      const enabled = body.enabled !== false;

      if (!enabled) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", body.user_id)
          .eq("role", body.role);

        if (error) {
          return sendError(res, 500, "Failed to remove role", error.message);
        }

        return sendJson(res, 200, {
          user_id: body.user_id,
          role: body.role,
          enabled: false,
        });
      }

      const now = new Date().toISOString();
      const { error } = await supabase.from("user_roles").upsert(
        {
          user_id: body.user_id,
          role: body.role,
          created_at: now,
        },
        {
          onConflict: "user_id,role",
          ignoreDuplicates: true,
        },
      );

      if (error) {
        return sendError(res, 500, "Failed to add role", error.message);
      }

      return sendJson(res, 200, {
        user_id: body.user_id,
        role: body.role,
        enabled: true,
      });
    }

    return sendError(res, 405, "Method not allowed");
  } catch (err) {
    return sendError(res, 500, "Internal error");
  }
}
