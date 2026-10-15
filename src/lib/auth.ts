import {
  hashPassword as _hashPassword,
  createSessionToken as _createSessionToken,
  verifySessionToken as _verifySessionToken,
  hasPermission as _hasPermission,
  ROLE_PERMISSIONS as _ROLE_PERMISSIONS,
} from "./auth-core.mjs";

export type Role =
  | "SUPER_ADMIN"
  | "HOTEL_MANAGER"
  | "RECEPTIONIST"
  | "HOUSEKEEPING"
  | "RESTAURANT_MANAGER"
  | "KITCHEN"
  | "ACCOUNTANT"
  | "MAINTENANCE";

export const hashPassword = _hashPassword as (password: string) => string;
export const createSessionToken = _createSessionToken as (payload: {
  userId: string;
  email: string;
  name: string;
  roles: string[];
}) => string;
export const verifySessionToken = _verifySessionToken as (token: string) => {
  userId: string;
  email: string;
  name: string;
  roles: string[];
} | null;
export const ROLE_PERMISSIONS = _ROLE_PERMISSIONS as Record<Role, string[]>;
export const hasPermission = _hasPermission as (
  userRoles: string[],
  requiredPermission: string
) => boolean;
