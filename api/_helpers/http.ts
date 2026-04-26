import type { VercelRequest, VercelResponse } from "@vercel/node";

export type Json =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

export function sendJson(
  res: VercelResponse,
  statusCode: number,
  body: Json,
  headers: Record<string, string> = {},
) {
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  res.status(statusCode).json(body);
}

export function sendError(
  res: VercelResponse,
  statusCode: number,
  message: string,
  details?: unknown,
) {
  res.status(statusCode).json({
    error: message,
    details: details ?? undefined,
  });
}

export function getBody<T = unknown>(req: VercelRequest): T {
  return req.body as T;
}

export function getClientIp(req: VercelRequest): string | null {
  const raw =
    (req.headers["x-forwarded-for"] as string | undefined) ||
    (req.headers["X-Forwarded-For"] as string | undefined);
  if (!raw) return null;
  return String(raw).split(",")[0]?.trim() || null;
}
