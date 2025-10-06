import { randomBytes } from "crypto";

/**
 * Generate a unique invite code for family invitations
 * Format: XXXX-XXXX (8 characters, uppercase alphanumeric, no confusing chars)
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude I, O, 0, 1 to avoid confusion
  let code = "";

  const randomValues = randomBytes(8);

  for (let i = 0; i < 8; i++) {
    code += chars[randomValues[i] % chars.length];
  }

  // Format as XXXX-XXXX
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/**
 * Validate invite code format
 */
export function isValidInviteCodeFormat(code: string): boolean {
  const pattern = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
  return pattern.test(code);
}
