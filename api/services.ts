import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError, getBody } from "./_helpers/http";
import { requireAuth, requirePermission } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = getSupabaseClient();
    const id = (req.query.id as string | undefined)?.trim();
    const onlyActive = req.query.active === "true";

    if (req.method === "GET") {
      if (id) {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            return sendError(res, 404, "Not found");
          }
          return sendError(res, 500, "Failed to fetch service", error.message);
        }

        return sendJson(res, 200, data);
      }

      let query = supabase
        .from("services")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (onlyActive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) {
        return sendError(res, 500, "Failed to fetch services", error.message);
      }

      return sendJson(res, 200, data);
    }

    // Mutations require admin permission
    const claims = await requireAuth(req);
    requirePermission(claims, "admin:access");

    if (req.method === "POST") {
      const body = getBody<{
        name?: string;
        category?: string;
        description?: string;
        base_price?: number;
        features?: unknown;
        add_ons?: unknown;
        is_active?: boolean;
      }>(req);

      if (!body.name || !body.category || typeof body.base_price !== "number") {
        return sendError(
          res,
          400,
          "Missing required fields: name, category, base_price",
        );
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("services")
        .insert({
          name: body.name,
          category: body.category,
          description: body.description ?? "",
          base_price: body.base_price,
          features: body.features ?? null,
          add_ons: body.add_ons ?? null,
          is_active: body.is_active ?? true,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        return sendError(res, 500, "Failed to create service", error.message);
      }

      return sendJson(res, 201, data);
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      if (!id) return sendError(res, 400, "Missing id");

      const body = getBody<{
        name?: string;
        category?: string;
        description?: string;
        base_price?: number;
        features?: unknown;
        add_ons?: unknown;
        is_active?: boolean;
      }>(req);

      const now = new Date().toISOString();
      const update: Record<string, unknown> = { updated_at: now };

      if (body.name !== undefined) update.name = body.name;
      if (body.category !== undefined) update.category = body.category;
      if (body.description !== undefined) update.description = body.description;
      if (body.base_price !== undefined) update.base_price = body.base_price;
      if (body.features !== undefined) update.features = body.features;
      if (body.add_ons !== undefined) update.add_ons = body.add_ons;
      if (body.is_active !== undefined) update.is_active = body.is_active;

      const { data, error } = await supabase
        .from("services")
        .update(update)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return sendError(res, 404, "Not found");
        }
        return sendError(res, 500, "Failed to update service", error.message);
      }

      return sendJson(res, 200, data);
    }

    if (req.method === "DELETE") {
      if (!id) return sendError(res, 400, "Missing id");

      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) {
        return sendError(res, 500, "Failed to delete service", error.message);
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
