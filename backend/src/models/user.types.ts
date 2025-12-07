import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(3).max(255),
  whatsapp: z.string().regex(/^\d{10,15}$/),
  customMessage: z.string().max(500).optional(),
  checkTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .default('14:00'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  whatsapp: z
    .string()
    .regex(/^\d{10,15}$/)
    .optional(),
  customMessage: z.string().max(500).optional().nullable(),
  checkTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
