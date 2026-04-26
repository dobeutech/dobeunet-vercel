import type { VercelRequest } from "@vercel/node";
import { createRemoteJWKSet, jwtVerify } from "jose";

export type Auth0Claims = {
  sub: string;
  permissions?: string[];
  roles?: string[];
  [k: string]: unknown;
};

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val || val.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

const jwks = (() => {
  const domain = process.env.AUTH0_DOMAIN?.trim();
  if (!domain) return null;
  return createRemoteJWKSet(new URL(`https://${domain}/.well-known/jwks.json`));
})();

function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header) return null;
  const match = (header as string).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function extractArrayClaim(
  claims: Record<string, unknown>,
  key: string,
): string[] {
  const v = claims[key];
  if (!v) return [];
  if (Array.isArray(v))
    return v.filter((x) => typeof x === "string") as string[];
  return [];
}

export async function verifyAuth0Jwt(req: VercelRequest): Promise<Auth0Claims> {
  const token = getBearerToken(req);
  if (!token) {
    throw new Error("Missing Authorization bearer token");
  }

  const domain = requireEnv("AUTH0_DOMAIN");
  const audience = requireEnv("AUTH0_AUDIENCE");
  const issuer = `https://${domain}/`;
  if (!jwks) {
    throw new Error("Auth0 JWKS not configured (missing AUTH0_DOMAIN)");
  }

  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience,
  });

  const claims = payload as unknown as Record<string, unknown>;
  const sub = typeof claims.sub === "string" ? claims.sub : "";
  if (!sub) throw new Error("Invalid token (missing sub)");

  const permissions = extractArrayClaim(claims, "permissions");

  const ns = process.env.AUTH0_CLAIMS_NAMESPACE?.trim();
  const roles = [
    ...extractArrayClaim(claims, "roles"),
    ...(ns ? extractArrayClaim(claims, `${ns}/roles`) : []),
  ];

  return { ...payload, sub, permissions, roles } as Auth0Claims;
}

export async function requireAuth(req: VercelRequest): Promise<Auth0Claims> {
  return await verifyAuth0Jwt(req);
}

export function requirePermission(claims: Auth0Claims, permission: string) {
  const perms = claims.permissions || [];
  if (!perms.includes(permission)) {
    throw new Error(`Forbidden (missing permission: ${permission})`);
  }
}

export function requireRole(claims: Auth0Claims, role: string) {
  const roles = claims.roles || [];
  if (!roles.includes(role)) {
    throw new Error(`Forbidden (missing role: ${role})`);
  }
}
