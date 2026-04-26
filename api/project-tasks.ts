import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError, getBody } from "./_helpers/http";
import { requireAuth, requirePermission } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = getSupabaseClient();
    const claims = await requireAuth(req);

    const id = (req.query.id as string | undefined)?.trim();
    const projectId = (req.query.project_id as string | undefined)?.trim();

    if (req.method === "GET") {
      if (!projectId) return sendError(res, 400, "Missing project_id");

      const { data: proj, error: projError } = await supabase
        .from("projects")
        .select("id, user_id")
        .eq("id", projectId)
        .single();

      if (projError) {
        if (projError.code === "PGRST116") {
          return sendError(res, 404, "Project not found");
        }
        return sendError(
          res,
          500,
          "Failed to fetch project",
          projError.message,
        );
      }

      const isOwner = proj.user_id === claims.sub;
      const isAdmin = (claims.permissions || []).includes("admin:access");
      if (!isOwner && !isAdmin) return sendError(res, 403, "Forbidden");

      const { data, error } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      if (error) {
        return sendError(res, 500, "Failed to fetch tasks", error.message);
      }

      return sendJson(res, 200, data);
    }

    if (req.method === "PATCH") {
      if (!id) return sendError(res, 400, "Missing id");

      const body = getBody<{
        is_completed?: boolean;
        title?: string;
        description?: string | null;
        order_index?: number;
      }>(req);

      const { data: existing, error: existingError } = await supabase
        .from("project_tasks")
        .select("*, projects!inner(user_id)")
        .eq("id", id)
        .single();

      if (existingError) {
        if (existingError.code === "PGRST116") {
          return sendError(res, 404, "Not found");
        }
        return sendError(
          res,
          500,
          "Failed to fetch task",
          existingError.message,
        );
      }

      const isOwner = existing.projects.user_id === claims.sub;
      const isAdmin = (claims.permissions || []).includes("admin:access");
      if (!isOwner && !isAdmin) return sendError(res, 403, "Forbidden");

      const now = new Date().toISOString();
      const update: Record<string, unknown> = { updated_at: now };

      if (typeof body.is_completed === "boolean") {
        update.is_completed = body.is_completed;
        update.completed_at = body.is_completed ? now : null;
      }

      if (isAdmin) {
        if (typeof body.title === "string") update.title = body.title;
        if (body.description === null || typeof body.description === "string")
          update.description = body.description;
        if (typeof body.order_index === "number")
          update.order_index = body.order_index;
      }

      const { data, error } = await supabase
        .from("project_tasks")
        .update(update)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return sendError(res, 500, "Failed to update task", error.message);
      }

      return sendJson(res, 200, data);
    }

    // Admin-only for create/delete
    requirePermission(claims, "admin:access");

    if (req.method === "POST") {
      const body = getBody<{
        project_id?: string;
        title?: string;
        description?: string | null;
        is_completed?: boolean;
        order_index?: number;
      }>(req);

      if (!body.project_id || !body.title)
        return sendError(
          res,
          400,
          "Missing required fields: project_id, title",
        );

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("project_tasks")
        .insert({
          project_id: body.project_id,
          title: body.title,
          description: body.description ?? null,
          is_completed: body.is_completed ?? false,
          completed_at: null,
          order_index:
            typeof body.order_index === "number" ? body.order_index : 0,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        return sendError(res, 500, "Failed to create task", error.message);
      }

      return sendJson(res, 201, data);
    }

    if (req.method === "DELETE") {
      if (!id) return sendError(res, 400, "Missing id");

      const { error } = await supabase
        .from("project_tasks")
        .delete()
        .eq("id", id);

      if (error) {
        return sendError(res, 500, "Failed to delete task", error.message);
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
