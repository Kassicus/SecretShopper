import { z } from "zod";

export const wishlistItemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  price: z
    .number()
    .min(0, "Price must be positive")
    .optional()
    .nullable(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  category: z.string().optional(),
});

export type WishlistItemInput = z.infer<typeof wishlistItemSchema>;
