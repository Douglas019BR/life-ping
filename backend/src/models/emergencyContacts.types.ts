import { z } from 'zod';

export const CreateEmergencyContactSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(3).max(255),
  whatsapp: z.string().regex(/^\d{10,15}$/),
  order: z.number().int().min(1).max(3),
});

export const UpdateEmergencyContactSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  whatsapp: z.string().regex(/^\d{10,15}$/).optional(),
  order: z.number().int().min(1).max(3).optional(),
});

export type CreateEmergencyContactDTO = z.infer<typeof CreateEmergencyContactSchema>;
export type UpdateEmergencyContactDTO = z.infer<typeof UpdateEmergencyContactSchema>;
