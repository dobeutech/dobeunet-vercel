import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError, getBody } from "./_helpers/http";
import { requireAuth, requirePermission } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = getSupabaseClient();
    const claims = await requireAuth(req);

    const id = (req.query.id as string | undefined)?.trim();

    if (req.method === "GET") {
      // Members-only feed: published posts
      let query = supabase
        .from("newsletter_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (id) {
        query = query.eq("id", id);
      }

      const { data, error } = await query;

      if (error) {
        return sendError(res, 500, "Failed to fetch posts", error.message);
      }

      return sendJson(res, 200, data);
    }

    // Admin manage posts
    requirePermission(claims, "admin:access");

    if (req.method === "POST") {
      const body = getBody<{
        title?: string;
        excerpt?: string | null;
        content?: string;
        slug?: string;
        published_at?: string | null;
        is_published?: boolean;
        is_public?: boolean;
      }>(req);

      if (!body.title || !body.content || !body.slug)
        return sendError(
          res,
          400,
          "Missing required fields: title, content, slug",
        );

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("newsletter_posts")
        .insert({
          title: body.title,
          excerpt: body.excerpt ?? null,
          content: body.content,
          slug: body.slug,
          published_at: body.published_at ?? null,
          is_published: body.is_published ?? false,
          is_public: body.is_public ?? false,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        return sendError(res, 500, "Failed to create post", error.message);
      }

      return sendJson(res, 201, data);
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      if (!id) return sendError(res, 400, "Missing id");

      const body = getBody<{
        title?: string;
        excerpt?: string | null;
        content?: string;
        slug?: string;
        published_at?: string | null;
        is_published?: boolean;
        is_public?: boolean;
      }>(req);

      const now = new Date().toISOString();
      const update: Record<string, unknown> = { updated_at: now };

      if (body.title !== undefined) update.title = body.title;
      if (body.excerpt !== undefined) update.excerpt = body.excerpt;
      if (body.content !== undefined) update.content = body.content;
      if (body.slug !== undefined) update.slug = body.slug;
      if (body.published_at !== undefined)
        update.published_at = body.published_at;
      if (body.is_published !== undefined)
        update.is_published = body.is_published;
      if (body.is_public !== undefined) update.is_public = body.is_public;

      const { data, error } = await supabase
        .from("newsletter_posts")
        .update(update)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return sendError(res, 404, "Not found");
        }
        return sendError(res, 500, "Failed to update post", error.message);
      }

      return sendJson(res, 200, data);
    }

    if (req.method === "DELETE") {
      if (!id) return sendError(res, 400, "Missing id");

      const { error } = await supabase
        .from("newsletter_posts")
        .delete()
        .eq("id", id);

      if (error) {
        return sendError(res, 500, "Failed to delete post", error.message);
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
