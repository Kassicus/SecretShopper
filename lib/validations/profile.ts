import { z } from "zod";

export const profileSchema = z.object({
  shoeSize: z.string().optional(),
  pantSize: z.string().optional(),
  shirtSize: z.string().optional(),
  dressSize: z.string().optional(),
  ringSize: z.string().optional(),
  favoriteColors: z.array(z.string()).optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  hobbies: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  allergies: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
  birthday: z.string().optional().nullable(),
  anniversary: z.string().optional().nullable(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
