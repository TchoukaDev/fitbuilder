"use client";

// Page d'administration pour initialiser la base de données avec des exercices
import { Header } from "@/Global/components";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const exercises = [
  // ========== PECTORAUX ==========
  {
    name: "Développé couché",
    muscle: "Pectoraux",
    equipment: "Barre",
    description:
      "Allongé sur un banc, descendre la barre vers la poitrine puis pousser vers le haut",
  },
  {
    name: "Pompes",
    muscle: "Pectoraux",
    equipment: "Poids du corps",
    description:
      "En position planche, descendre le corps en pliant les coudes puis remonter",
  },
  {
    name: "Écarté aux haltères",
    muscle: "Pectoraux",
    equipment: "Haltères",
    description:
      "Allongé sur un banc, écarter les bras avec haltères puis ramener en contractant",
  },
  {
    name: "Développé incliné",
    muscle: "Pectoraux",
    equipment: "Barre",
    description:
      "Sur banc incliné à 30-45°, pousser la barre vers le haut depuis la poitrine haute",
  },

  // ========== DOS ==========
  {
    name: "Tractions",
    muscle: "Dos",
    equipment: "Poids du corps",
    description:
      "Suspendu à une barre, se hisser jusqu'à ce que le menton dépasse la barre",
  },
  {
    name: "Rowing barre",
    muscle: "Dos",
    equipment: "Barre",
    description:
      "Penché en avant, tirer la barre vers le bas du ventre en contractant le dos",
  },
  {
    name: "Tirage horizontal",
    muscle: "Dos",
    equipment: "Machine",
    description: "Assis, tirer la poignée vers soi en gardant le dos droit",
  },
  {
    name: "Pull-over haltère",
    muscle: "Dos",
    equipment: "Haltères",
    description:
      "Allongé, bras tendus, descendre l'haltère derrière la tête puis remonter",
  },

  // ========== JAMBES ==========
  {
    name: "Squat",
    muscle: "Jambes",
    equipment: "Barre",
    description:
      "Barre sur les épaules, descendre en fléchissant les genoux puis remonter",
  },
  {
    name: "Fentes",
    muscle: "Jambes",
    equipment: "Haltères",
    description:
      "Faire un grand pas en avant, descendre en pliant le genou avant puis remonter",
  },
  {
    name: "Leg press",
    muscle: "Jambes",
    equipment: "Machine",
    description:
      "Assis, pousser la plateforme avec les pieds en tendant les jambes",
  },
  {
    name: "Soulevé de terre",
    muscle: "Jambes",
    equipment: "Barre",
    description:
      "Soulever la barre du sol en gardant le dos droit, extension complète",
  },
  {
    name: "Pistol squat",
    muscle: "Jambes",
    equipment: "Poids du corps",
    description:
      "Squat sur une jambe, l'autre tendue devant, descendre puis remonter",
  },

  // ========== ÉPAULES ==========
  {
    name: "Développé militaire",
    muscle: "Épaules",
    equipment: "Barre",
    description:
      "Debout ou assis, pousser la barre au-dessus de la tête depuis les épaules",
  },
  {
    name: "Élévations latérales",
    muscle: "Épaules",
    equipment: "Haltères",
    description:
      "Bras le long du corps, lever les haltères sur les côtés jusqu'à l'horizontale",
  },
  {
    name: "Oiseau",
    muscle: "Épaules",
    equipment: "Haltères",
    description:
      "Penché en avant, écarter les bras sur les côtés avec haltères",
  },
  {
    name: "Face pull",
    muscle: "Épaules",
    equipment: "Élastique",
    description:
      "Tirer l'élastique vers le visage en écartant les mains, coudes hauts",
  },

  // ========== BRAS ==========
  {
    name: "Curl biceps",
    muscle: "Bras",
    equipment: "Haltères",
    description:
      "Bras le long du corps, fléchir les coudes pour monter les haltères vers les épaules",
  },
  {
    name: "Curl marteau",
    muscle: "Bras",
    equipment: "Haltères",
    description: "Curl avec prise neutre, pouces vers le haut",
  },
  {
    name: "Dips",
    muscle: "Bras",
    equipment: "Poids du corps",
    description:
      "Entre deux barres parallèles, descendre en pliant les coudes puis remonter",
  },
  {
    name: "Extension triceps poulie",
    muscle: "Bras",
    equipment: "Machine",
    description:
      "Debout face à la poulie, pousser la barre vers le bas en tendant les bras",
  },
  {
    name: "Curl barre",
    muscle: "Bras",
    equipment: "Barre",
    description:
      "Barre en prise supination, fléchir les coudes pour monter la barre",
  },

  // ========== ABDOS ==========
  {
    name: "Crunch",
    muscle: "Abdos",
    equipment: "Poids du corps",
    description:
      "Allongé, genoux pliés, relever le buste en contractant les abdos",
  },
  {
    name: "Planche",
    muscle: "Abdos",
    equipment: "Poids du corps",
    description:
      "En appui sur les avant-bras et pieds, maintenir le corps aligné et gainé",
  },
  {
    name: "Russian twist",
    muscle: "Abdos",
    equipment: "Haltères",
    description:
      "Assis, pieds décollés, tourner le buste de gauche à droite avec haltère",
  },
  {
    name: "Mountain climbers",
    muscle: "Abdos",
    equipment: "Poids du corps",
    description:
      "En position pompe, ramener alternativement les genoux vers la poitrine",
  },

  // ========== EXERCICES COMPLETS ==========
  {
    name: "Burpees",
    muscle: "Corps entier",
    equipment: "Poids du corps",
    description:
      "Descendre en squat, planche, pompe, sauter debout avec les mains en l'air",
  },
  {
    name: "Kettlebell swing",
    muscle: "Corps entier",
    equipment: "Haltères",
    description:
      "Balancer le kettlebell entre les jambes puis propulser à hauteur des épaules",
  },
  {
    name: "Thruster",
    muscle: "Corps entier",
    equipment: "Haltères",
    description:
      "Squat avec haltères sur les épaules puis développé en remontant",
  },
  {
    name: "Box jump",
    muscle: "Jambes",
    equipment: "Poids du corps",
    description: "Sauter sur une plateforme en hauteur puis redescendre",
  },
];

export default function SeedExercises() {
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session && session.user.email !== "romain.wirth@gmail.com") {
      router.push("/dashboard?error=access-denied");
    }
  }, [session, router]);

  const seedDB = async () => {
    setLoading(true);
    setMessage("");

    let added = 0;
    let errors = 0;

    for (const ex of exercises) {
      try {
        const res = await fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ex),
        });

        if (res.ok) {
          added++;
        } else {
          errors++;
        }
      } catch (error) {
        errors++;
      }
    }

    setMessage(`✅ ${added} exercices ajoutés | ❌ ${errors} erreurs`);
    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <Header />
      <h1>Seed la base de données</h1>
      <p>Ajouter 30 exercices d'un coup</p>

      <button
        onClick={seedDB}
        disabled={loading}
        style={{
          padding: "15px 30px",
          background: loading ? "#ccc" : "#8b5cf6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "20px",
        }}
      >
        {loading ? "⏳ Ajout en cours..." : "🚀 Ajouter 30 exercices"}
      </button>

      {message && (
        <p
          style={{
            marginTop: "30px",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
