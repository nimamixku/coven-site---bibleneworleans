// Tells apart "the keeper" (you, running this site) from an anonymous
// visitor — nothing more elaborate than a shared passcode, hashed into a
// cookie value so the raw passcode itself never sits in the visitor's
// browser. Same pattern as the kaqchikel-site project's ownerAuth.js.
//
// Set COVEN_KEEPER_PASSCODE in your environment variables to enable this.
// Until it's set, the "sign in" control simply won't authenticate anyone
// — the booth still renders fine for visitors, it just stays dormant.

import crypto from "crypto";

export const OWNER_COOKIE_NAME = "coven_keeper";

export function ownerToken() {
  const passcode = process.env.COVEN_KEEPER_PASSCODE;
  if (!passcode) return null;
  return crypto.createHash("sha256").update("keeper|" + passcode).digest("hex");
}

export function isOwnerRequest(req) {
  const token = ownerToken();
  if (!token) return false;
  const cookie = req.cookies.get(OWNER_COOKIE_NAME)?.value;
  return cookie === token;
}

export function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || "coven-site-booth";
  return crypto.createHash("sha256").update(salt + "|" + (ip || "unknown")).digest("hex");
}
