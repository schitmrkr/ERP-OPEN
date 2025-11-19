import { type UserRole } from '../models/user';

/**
 * Check if user has any of the required roles
 */
export const hasRole = (userRole: UserRole | undefined, requiredRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};

/**
 * Check if user is owner or admin
 */
export const isOwnerOrAdmin = (userRole: UserRole | undefined): boolean => {
  return hasRole(userRole, ["OWNER", "ADMIN"]);
};

/**
 * Check if user is owner
 */
export const isOwner = (userRole: UserRole | undefined): boolean => {
  return userRole === "OWNER";
};

/**
 * Check if user is admin
 */
export const isAdmin = (userRole: UserRole | undefined): boolean => {
  return userRole === "ADMIN";
};

/**
 * Check if user can modify users (OWNER or ADMIN)
 */
export const canModifyUsers = (userRole: UserRole | undefined): boolean => {
  return isOwnerOrAdmin(userRole);
};

