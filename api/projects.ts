import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError, getBody } from "./_helpers/http";
import { requireAuth, requirePermission } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = getSupabaseClient();
    const claims = await requireAuth(req);

    const id = (req.query.id as string | undefined)?.trim();
    const all = req.query.all === "true";

    if (req.method === "GET") {
      if (id) {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            return sendError(res, 404, "Not found");
          }
          return sendError(res, 500, "Failed to fetch project", error.message);
        }

        const isOwner = data.user_id === claims.sub;
        const isAdmin = (claims.permissions || []).includes("admin:access");
        if (!isOwner && !isAdmin) return sendError(res, 403, "Forbidden");

        return sendJson(res, 200, data);
      }

      if (all) {
        requirePermission(claims, "admin:access");
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          return sendError(
            res,
            500,
            "Failed to fetch projects",
            error.message,
          );
        }

        return sendJson(res, 200, data);
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", claims.sub)
        .order("created_at", { ascending: false });

      if (error) {
        return sendError(res, 500, "Failed to fetch projects", error.message);
      }

      return sendJson(res, 200, data);
    }

    // Create/update/delete: admin only
    requirePermission(claims, "admin:access");

    if (req.method === "POST") {
      const body = getBody<{
        user_id?: string;
        title?: string;
        description?: string | null;
        status?: string;
        progress_percentage?: number;
        start_date?: string | null;
        end_date?: string | null;
      }>(req);

      if (!body.user_id || !body.title)
        return sendError(
          res,
          400,
          "Missing required fields: user_id, title",
        );

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: body.user_id,
          title: body.title,
          description: body.description ?? null,
          status: body.status ?? "not_started",
          progress_percentage:
            typeof body.progress_percentage === "number"
              ? body.progress_percentage
              : 0,
          start_date: body.start_date ?? null,
          end_date: body.end_date ?? null,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        return sendError(res, 500, "Failed to create project", error.message);
      }

      return sendJson(res, 201, data);
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      if (!id) return sendError(res, 400, "Missing id");

      const body = getBody<{
        title?: string;
        description?: string | null;
        status?: string;
        progress_percentage?: number;
        start_date?: string | null;
        end_date?: string | null;
      }>(req);

      const now = new Date().toISOString();
      const update: Record<string, unknown> = { updated_at: now };

      if (body.title !== undefined) update.title = body.title;
      if (body.description !== undefined) update.description = body.description;
      if (body.status !== undefined) update.status = body.status;
      if (body.progress_percentage !== undefined)
        update.progress_percentage = body.progress_percentage;
      if (body.start_date !== undefined) update.start_date = body.start_date;
      if (body.end_date !== undefined) update.end_date = body.end_date;

      const { data, error } = await supabase
        .from("projects")
        .update(update)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return sendError(res, 404, "Not found");
        }
        return sendError(res, 500, "Failed to update project", error.message);
      }

      return sendJson(res, 200, data);
    }

    if (req.method === "DELETE") {
      if (!id) return sendError(res, 400, "Missing id");

      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) {
        return sendError(res, 500, "Failed to delete project", error.message);
      }

      return sendJson(res, 200, { deleted: true });
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
