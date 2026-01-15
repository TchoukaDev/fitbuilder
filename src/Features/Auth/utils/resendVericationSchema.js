import { z } from "zod";

export const resendVerificationSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
});
