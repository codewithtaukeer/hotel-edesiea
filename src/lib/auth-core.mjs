import crypto from "node:crypto";

export const AUTH_SALT = "edesiea_salt_2026";
export const AUTH_SECRET = process.env.AUTH_SECRET || "edesiea_hotel_jwt_secure_secret_pali_2026_super_key";

export function hashPassword(password) {
  return crypto.createHash("sha256").update(password + AUTH_SALT).digest("hex");
}

export function createSessionToken(payload) {
  const data = JSON.stringify({
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days validity
  });
  const encoded = Buffer.from(data).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token) {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(encoded)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (payload.exp && Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

// Role-Based Access Control matrix for 8 roles
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ["*"], // Unrestricted
  HOTEL_MANAGER: [
    "rooms:view",
    "rooms:manage",
    "bookings:view",
    "bookings:manage",
    "reception:checkin",
    "reception:checkout",
    "housekeeping:view",
    "housekeeping:manage",
    "maintenance:view",
    "maintenance:manage",
    "restaurant:view",
    "reports:view",
    "settings:view",
    "settings:edit",
  ],
  RECEPTIONIST: [
    "rooms:view",
    "bookings:view",
    "bookings:manage",
    "reception:checkin",
    "reception:checkout",
    "folios:manage",
    "payments:create",
    "guests:view",
    "guests:create",
  ],
  HOUSEKEEPING: [
    "housekeeping:view",
    "housekeeping:status_update",
    "rooms:view",
  ],
  RESTAURANT_MANAGER: [
    "restaurant:view",
    "restaurant:manage",
    "menu:edit",
    "tables:manage",
    "orders:create",
    "orders:manage",
  ],
  KITCHEN: [
    "orders:view",
    "orders:status_update",
  ],
  ACCOUNTANT: [
    "finance:view",
    "reports:view",
    "invoices:view",
    "payments:view",
    "expenses:manage",
  ],
  MAINTENANCE: [
    "maintenance:view",
    "maintenance:manage",
    "rooms:block",
  ],
};

export function hasPermission(userRoles, requiredPermission) {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  if (userRoles.includes("SUPER_ADMIN")) return true;
  for (const r of userRoles) {
    const perms = ROLE_PERMISSIONS[r];
    if (perms && (perms.includes("*") || perms.includes(requiredPermission))) {
      return true;
    }
  }
  return false;
}
