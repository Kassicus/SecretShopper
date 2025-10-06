import { z } from "zod";

export const createFamilySchema = z.object({
  name: z
    .string()
    .min(2, "Family name must be at least 2 characters")
    .max(50, "Family name must be less than 50 characters"),
});

export const joinFamilySchema = z.object({
  inviteCode: z
    .string()
    .regex(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/, "Invalid invite code format"),
});

export const updateFamilySchema = z.object({
  name: z
    .string()
    .min(2, "Family name must be at least 2 characters")
    .max(50, "Family name must be less than 50 characters"),
});

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
export type JoinFamilyInput = z.infer<typeof joinFamilySchema>;
export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>;
