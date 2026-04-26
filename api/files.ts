import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, sendError } from "./_helpers/http";
import { requireAuth, requirePermission } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

const STORAGE_BUCKET = "client-files";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const claims = await requireAuth(req);
    const supabase = getSupabaseClient();

    const id = (req.query.id as string | undefined)?.trim();
    const download = req.query.download === "true";
    const userIdParam = (req.query.user_id as string | undefined)?.trim();

    if (req.method !== "GET") return sendError(res, 405, "Method not allowed");

    if (!id) {
      let userId = claims.sub;
      if (userIdParam && userIdParam !== claims.sub) {
        requirePermission(claims, "admin:access");
        userId = userIdParam;
      }

      const { data, error } = await supabase
        .from("client_files")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return sendError(res, 500, "Failed to fetch files", error.message);
      }

      return sendJson(res, 200, data);
    }

    const { data: file, error: fileError } = await supabase
      .from("client_files")
      .select("*")
      .eq("id", id)
      .single();

    if (fileError) {
      if (fileError.code === "PGRST116") {
        return sendError(res, 404, "Not found");
      }
      return sendError(res, 500, "Failed to fetch file", fileError.message);
    }

    const isOwner = file.user_id === claims.sub;
    const isAdmin = (claims.permissions || []).includes("admin:access");
    if (!isOwner && !isAdmin) return sendError(res, 403, "Forbidden");

    if (!download) {
      return sendJson(res, 200, file);
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(file.file_path);

    if (downloadError) {
      return sendError(
        res,
        500,
        "Failed to download file",
        downloadError.message,
      );
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    res.setHeader(
      "Content-Type",
      file.file_type || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.file_name)}"`,
    );
    res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");
    return res.send(buf);
  } catch (err) {
    return sendError(
      res,
      500,
      "Internal error",
      err instanceof Error ? err.message : String(err),
    );
  }
}
