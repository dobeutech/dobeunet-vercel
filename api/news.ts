import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError, getBody } from "./_helpers/http";
import { requireAuth, requirePermission } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = getSupabaseClient();

    const id = (req.query.id as string | undefined)?.trim();
    const slug = (req.query.slug as string | undefined)?.trim();

    if (req.method === "GET") {
      let query = supabase
        .from("newsletter_posts")
        .select("*")
        .eq("is_published", true)
        .eq("is_public", true)
        .order("published_at", { ascending: false });

      if (id) {
        query = query.eq("id", id);
      }
      if (slug) {
        query = query.eq("slug", slug);
      }

      const { data, error } = await query;

      if (error) {
        return sendError(res, 500, "Failed to fetch posts", error.message);
      }

      return sendJson(res, 200, data);
    }

    // Admin write ops
    const claims = await requireAuth(req);
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
          is_public: body.is_public ?? true,
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
