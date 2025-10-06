import { z } from "zod";

export const createGiftGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(100, "Group name must be less than 100 characters"),
  description: z.string().optional(),
  occasion: z.string().optional(),
  occasionDate: z.string().optional().nullable(),
  targetUserId: z.string().optional().nullable(),
  targetAmount: z
    .number()
    .min(0, "Target amount must be positive")
    .optional()
    .nullable(),
});

export const updateGiftGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  occasion: z.string().optional(),
  occasionDate: z.string().optional().nullable(),
  targetAmount: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const contributeSchema = z.object({
  amount: z.number().min(0.01, "Contribution must be at least $0.01"),
  hasPaid: z.boolean().default(false),
});

export type CreateGiftGroupInput = z.infer<typeof createGiftGroupSchema>;
export type UpdateGiftGroupInput = z.infer<typeof updateGiftGroupSchema>;
export type ContributeInput = z.infer<typeof contributeSchema>;
