import { z } from "zod";

export const eventSchema = z
  .object({
    workout: z.string().min(1, "Veuillez choisir un plan d'entraînement"),

    date: z.string().min(1, "Veuillez choisir une date"),

    startTime: z.string().min(1, "Veuillez choisir une heure de début"),

    endTime: z.string().min(1, "Veuillez choisir une heure de fin"),

    duration: z
      .number("Veuillez saisir une durée valide")
      .min(1, "La durée doit être d'au moins 1 minute")
      .max(1440, "La durée ne peut pas dépasser 24 heures"),
  })
  .refine(
    (data) => new Date(data.date) >= new Date(new Date().setHours(0, 0, 0, 0)),
    {
      message: "Cette date est déjà passée",
      path: ["date"], // Afficher l'erreur sur le champ date
    },
  )
  .refine(
    (data) => {
      // ✅ Vérifier que la date/heure complète est dans le futur
      const scheduledDateTime = new Date(`${data.date}T${data.startTime}`);
      return scheduledDateTime > new Date();
    },
    {
      message: "L'heure de début doit être dans le futur",
      path: ["startTime"],
    },
  )
  .refine(
    (data) => {
      // ✅ Vérifier que startTime < endTime
      const [startH, startM] = data.startTime.split(":").map(Number);
      const [endH, endM] = data.endTime.split(":").map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      return endMinutes > startMinutes;
    },
    {
      message: "L'heure de fin doit être après l'heure de début",
      path: ["endTime"],
    },
  );

  export type EventSchemaType = z.infer<typeof eventSchema>;