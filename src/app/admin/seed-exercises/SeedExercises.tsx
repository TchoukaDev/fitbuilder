"use client";

// Page d'administration pour initialiser la base de données avec des exercices
import { useState } from "react";

const exercises = [
  // ========== POITRINE ==========
  {
    name: "Développé couché",
    primary_muscle: "Pectoraux moyens",
    secondary_muscles: ["Pectoraux supérieurs", "Triceps", "Deltoïde antérieur"],
    equipment: "Barre",
    description: "Allongé sur un banc, descendre la barre vers la poitrine puis pousser vers le haut",
  },
  {
    name: "Pompes",
    primary_muscle: "Pectoraux moyens",
    secondary_muscles: ["Triceps", "Deltoïde antérieur", "Core profond"],
    equipment: "Poids du corps",
    description: "En position planche, descendre le corps en pliant les coudes puis remonter",
  },
  {
    name: "Écarté aux haltères",
    primary_muscle: "Pectoraux moyens",
    secondary_muscles: ["Pectoraux supérieurs", "Deltoïde antérieur"],
    equipment: "Haltères",
    description: "Allongé sur un banc, écarter les bras avec haltères puis ramener en contractant",
  },
  {
    name: "Développé incliné",
    primary_muscle: "Pectoraux supérieurs",
    secondary_muscles: ["Pectoraux moyens", "Triceps", "Deltoïde antérieur"],
    equipment: "Barre",
    description: "Sur banc incliné à 30-45°, pousser la barre vers le haut depuis la poitrine haute",
  },
  {
    name: "Développé couché aux haltères",
    primary_muscle: "Pectoraux moyens",
    secondary_muscles: ["Pectoraux supérieurs", "Triceps", "Deltoïde antérieur"],
    equipment: "Haltères",
    description:
      "Allongé sur un banc plat, haltères en prise pronation, descendre les coudes à 90° puis pousser vers le haut. Variante aux haltères permettant une amplitude plus grande qu'à la barre.",
  },
  {
    name: "Développé décliné à la barre",
    primary_muscle: "Pectoraux inférieurs",
    secondary_muscles: ["Pectoraux moyens", "Triceps"],
    equipment: "Barre",
    description:
      "Sur banc décliné (tête en bas), pousser la barre depuis la poitrine basse. Cible principalement les faisceaux inférieurs des pectoraux.",
  },
  {
    name: "Pompes inclinées (pieds surélevés)",
    primary_muscle: "Pectoraux supérieurs",
    secondary_muscles: ["Pectoraux moyens", "Triceps", "Deltoïde antérieur"],
    equipment: "Poids du corps",
    description:
      "Pieds posés sur un banc ou une box, corps incliné vers le bas. Cible les faisceaux supérieurs des pectoraux. Variante aux pompes classiques.",
  },
  {
    name: "Écarté à la poulie basse",
    primary_muscle: "Pectoraux moyens",
    secondary_muscles: ["Pectoraux supérieurs", "Deltoïde antérieur"],
    equipment: "Machine",
    description:
      "Debout entre deux poulies basses, tirer les câbles vers le haut et l'intérieur en arc de cercle. Étire et contracte les pectoraux sur toute l'amplitude.",
  },
  {
    name: "Dips pectoraux (buste penché)",
    primary_muscle: "Pectoraux inférieurs",
    secondary_muscles: ["Pectoraux moyens", "Triceps"],
    equipment: "Poids du corps",
    description:
      "Aux barres parallèles, se pencher légèrement en avant pour cibler davantage les pectoraux. Descendre jusqu'à 90° de flexion du coude.",
  },
  {
    name: "Pompes diamant",
    primary_muscle: "Pectoraux moyens",
    secondary_muscles: ["Triceps", "Deltoïde antérieur"],
    equipment: "Poids du corps",
    description:
      "Pompes avec les mains rapprochées en forme de diamant sous la poitrine. Variante ciblant davantage les triceps et le faisceau sternal des pectoraux.",
  },

  // ========== DOS ==========
  {
    name: "Tractions",
    primary_muscle: "Grand dorsal",
    secondary_muscles: ["Biceps", "Rhomboïdes", "Trapèzes"],
    equipment: "Poids du corps",
    description: "Suspendu à une barre, se hisser jusqu'à ce que le menton dépasse la barre",
  },
  {
    name: "Rowing barre",
    primary_muscle: "Grand dorsal",
    secondary_muscles: ["Rhomboïdes", "Biceps", "Érecteurs du rachis"],
    equipment: "Barre",
    description: "Penché en avant, tirer la barre vers le bas du ventre en contractant le dos",
  },
  {
    name: "Tirage horizontal",
    primary_muscle: "Grand dorsal",
    secondary_muscles: ["Rhomboïdes", "Biceps", "Trapèzes"],
    equipment: "Machine",
    description: "Assis, tirer la poignée vers soi en gardant le dos droit",
  },
  {
    name: "Pull-over haltère",
    primary_muscle: "Grand dorsal",
    secondary_muscles: ["Pectoraux moyens", "Triceps"],
    equipment: "Haltères",
    description: "Allongé, bras tendus, descendre l'haltère derrière la tête puis remonter",
  },
  {
    name: "Tirage vertical prise serrée",
    primary_muscle: "Grand dorsal",
    secondary_muscles: ["Biceps", "Rhomboïdes"],
    equipment: "Machine",
    description:
      "À la poulie haute, tirer la barre avec une prise serrée en supination jusqu'au menton. Variante prise serrée ciblant davantage les biceps et le bas du grand dorsal.",
  },
  {
    name: "Rowing haltère unilatéral",
    primary_muscle: "Grand dorsal",
    secondary_muscles: ["Rhomboïdes", "Biceps", "Érecteurs du rachis"],
    equipment: "Haltères",
    description:
      "Un genou et une main posés sur un banc, tirer l'haltère vers la hanche en contractant le dos. Travail unilatéral pour corriger les déséquilibres.",
  },
  {
    name: "Rowing à la machine (chest supported)",
    primary_muscle: "Rhomboïdes",
    secondary_muscles: ["Grand dorsal", "Biceps", "Trapèzes"],
    equipment: "Machine",
    description:
      "Poitrine appuyée sur le pad incliné de la machine, tirer les poignées vers soi. Le support évite les compensations lombaires.",
  },
  {
    name: "Tractions prise neutre (supination)",
    primary_muscle: "Grand dorsal",
    secondary_muscles: ["Biceps", "Rhomboïdes"],
    equipment: "Poids du corps",
    description:
      "Suspendu à une barre avec prise neutre (paumes face à face ou en supination), se hisser jusqu'au menton. Sollicite davantage les biceps qu'en prise pronation.",
  },
  {
    name: "Tirage poitrine à la poulie haute",
    primary_muscle: "Grand dorsal",
    secondary_muscles: ["Biceps", "Rhomboïdes"],
    equipment: "Machine",
    description:
      "Assis à la poulie haute, tirer la barre jusqu'à la poitrine en arquant légèrement le dos. Cible le grand dorsal sur toute sa longueur.",
  },
  {
    name: "Good morning à la barre",
    primary_muscle: "Érecteurs du rachis",
    secondary_muscles: ["Ischio-jambiers", "Grand fessier"],
    equipment: "Barre",
    description:
      "Barre posée sur les épaules, fléchir le buste vers l'avant jusqu'à l'horizontale en gardant le dos droit. Renforce les érecteurs du rachis et les ischio-jambiers.",
  },
  {
    name: "Shrugs aux haltères",
    primary_muscle: "Trapèzes",
    secondary_muscles: ["Érecteurs du rachis"],
    equipment: "Haltères",
    description:
      "Haltères de chaque côté du corps, hausser les épaules verticalement en contractant les trapèzes. Variante aux haltères du shrug à la barre, plus libre en amplitude.",
  },
  {
    name: "Face pull à la poulie",
    primary_muscle: "Trapèzes",
    secondary_muscles: ["Rhomboïdes", "Deltoïde postérieur"],
    equipment: "Machine",
    description:
      "À la poulie haute avec corde, tirer vers le visage en écartant les mains, coudes hauts. Travaille les trapèzes inférieurs, les rhomboïdes et les rotateurs de coiffe.",
  },
  {
    name: "Tirage horizontal à l'élastique",
    primary_muscle: "Rhomboïdes",
    secondary_muscles: ["Grand dorsal", "Biceps", "Trapèzes"],
    equipment: "Élastique",
    description:
      "Assis ou debout, tirer l'élastique fixé devant soi vers le ventre en contractant les omoplates. Alternative au rowing machine, idéal en mobilité ou à domicile.",
  },

  // ========== ÉPAULES ==========
  {
    name: "Développé militaire",
    primary_muscle: "Deltoïde antérieur",
    secondary_muscles: ["Deltoïde médial", "Triceps", "Trapèzes"],
    equipment: "Barre",
    description: "Debout ou assis, pousser la barre au-dessus de la tête depuis les épaules",
  },
  {
    name: "Élévations latérales",
    primary_muscle: "Deltoïde médial",
    secondary_muscles: ["Deltoïde antérieur", "Trapèzes"],
    equipment: "Haltères",
    description: "Bras le long du corps, lever les haltères sur les côtés jusqu'à l'horizontale",
  },
  {
    name: "Oiseau",
    primary_muscle: "Deltoïde postérieur",
    secondary_muscles: ["Rhomboïdes", "Trapèzes"],
    equipment: "Haltères",
    description: "Penché en avant, écarter les bras sur les côtés avec haltères",
  },
  {
    name: "Face pull",
    primary_muscle: "Deltoïde postérieur",
    secondary_muscles: ["Rhomboïdes", "Trapèzes"],
    equipment: "Élastique",
    description: "Tirer l'élastique vers le visage en écartant les mains, coudes hauts",
  },
  {
    name: "Développé militaire aux haltères",
    primary_muscle: "Deltoïde antérieur",
    secondary_muscles: ["Deltoïde médial", "Triceps"],
    equipment: "Haltères",
    description:
      "Assis ou debout, pousser les haltères au-dessus de la tête en partant des épaules. Variante aux haltères offrant plus de liberté de mouvement et travail stabilisateur.",
  },
  {
    name: "Élévations frontales",
    primary_muscle: "Deltoïde antérieur",
    secondary_muscles: [],
    equipment: "Haltères",
    description:
      "Bras tendus, lever les haltères devant soi jusqu'à l'horizontale. Cible spécifiquement le faisceau antérieur du deltoïde.",
  },
  {
    name: "Élévations latérales à la poulie",
    primary_muscle: "Deltoïde médial",
    secondary_muscles: ["Deltoïde antérieur"],
    equipment: "Machine",
    description:
      "Poulie basse sur le côté, tirer le câble latéralement jusqu'à l'horizontale. Variante à la poulie maintenant une tension constante sur le deltoïde médial.",
  },
  {
    name: "Arnold press",
    primary_muscle: "Deltoïde antérieur",
    secondary_muscles: ["Deltoïde médial", "Deltoïde postérieur", "Triceps"],
    equipment: "Haltères",
    description:
      "Partir avec les paumes face à soi, tourner les haltères en montant pour finir prise pronation au-dessus de la tête. Travaille les trois faisceaux du deltoïde.",
  },
  {
    name: "Shrugs à la barre",
    primary_muscle: "Trapèzes",
    secondary_muscles: [],
    equipment: "Barre",
    description:
      "Barre tenue en avant, hausser les épaules verticalement en contractant les trapèzes. Exercice d'isolation pour les trapèzes supérieurs.",
  },
  {
    name: "Upright row à la barre",
    primary_muscle: "Deltoïde médial",
    secondary_muscles: ["Trapèzes", "Biceps"],
    equipment: "Barre",
    description:
      "Barre en prise pronation serrée, tirer vers le menton en écartant les coudes. Sollicite les deltoïdes et les trapèzes simultanément.",
  },
  {
    name: "Handstand push-up (contre mur)",
    primary_muscle: "Deltoïde antérieur",
    secondary_muscles: ["Triceps", "Trapèzes"],
    equipment: "Poids du corps",
    description:
      "En équilibre renversé contre un mur, fléchir les coudes pour descendre la tête vers le sol puis remonter. Exercice avancé ciblant massivement les deltoïdes.",
  },

  // ========== BRAS — BICEPS ==========
  {
    name: "Curl biceps",
    primary_muscle: "Biceps",
    secondary_muscles: ["Brachialis", "Avant-bras"],
    equipment: "Haltères",
    description: "Bras le long du corps, fléchir les coudes pour monter les haltères vers les épaules",
  },
  {
    name: "Curl marteau",
    primary_muscle: "Brachialis",
    secondary_muscles: ["Biceps", "Avant-bras"],
    equipment: "Haltères",
    description: "Curl avec prise neutre, pouces vers le haut",
  },
  {
    name: "Curl barre",
    primary_muscle: "Biceps",
    secondary_muscles: ["Brachialis", "Avant-bras"],
    equipment: "Barre",
    description: "Barre en prise supination, fléchir les coudes pour monter la barre",
  },
  {
    name: "Curl concentration",
    primary_muscle: "Biceps",
    secondary_muscles: ["Brachialis"],
    equipment: "Haltères",
    description:
      "Assis, coude posé sur l'intérieur de la cuisse, fléchir lentement l'haltère vers l'épaule. Isole le chef court du biceps avec contraction maximale.",
  },
  {
    name: "Curl incliné",
    primary_muscle: "Biceps",
    secondary_muscles: ["Brachialis"],
    equipment: "Haltères",
    description:
      "Allongé sur un banc incliné à 45°, laisser les bras pendre puis fléchir. Étire le biceps en bas du mouvement pour un travail sur amplitude totale.",
  },
  {
    name: "Curl à la poulie basse",
    primary_muscle: "Biceps",
    secondary_muscles: ["Brachialis", "Avant-bras"],
    equipment: "Machine",
    description:
      "Debout face à la poulie basse, fléchir les coudes pour amener la barre vers les épaules. Tension constante tout au long du mouvement contrairement aux haltères.",
  },
  {
    name: "Curl en prise large (barre EZ)",
    primary_muscle: "Biceps",
    secondary_muscles: ["Brachialis"],
    equipment: "Barre",
    description:
      "Barre EZ tenue en prise large, fléchir les coudes. Cible davantage le chef long du biceps. Variante avec barre EZ réduisant le stress sur les poignets.",
  },
  {
    name: "Curl à la barre EZ prise serrée",
    primary_muscle: "Biceps",
    secondary_muscles: ["Brachialis"],
    equipment: "Barre",
    description:
      "Barre EZ tenue en prise serrée, fléchir les coudes. Cible davantage le chef court du biceps et les brachialis. Variante prise serrée de la barre EZ classique.",
  },

  // ========== BRAS — TRICEPS ==========
  {
    name: "Dips",
    primary_muscle: "Triceps",
    secondary_muscles: ["Pectoraux inférieurs", "Deltoïde antérieur"],
    equipment: "Poids du corps",
    description: "Entre deux barres parallèles, descendre en pliant les coudes puis remonter",
  },
  {
    name: "Extension triceps poulie",
    primary_muscle: "Triceps",
    secondary_muscles: [],
    equipment: "Machine",
    description: "Debout face à la poulie, pousser la barre vers le bas en tendant les bras",
  },
  {
    name: "Barre au front (skull crusher)",
    primary_muscle: "Triceps",
    secondary_muscles: [],
    equipment: "Barre",
    description:
      "Allongé, barre ou barre EZ tenue à bout de bras, fléchir les coudes pour descendre la barre vers le front puis tendre. Isole efficacement les triceps.",
  },
  {
    name: "Extension triceps haltère unilatérale",
    primary_muscle: "Triceps",
    secondary_muscles: [],
    equipment: "Haltères",
    description:
      "Debout ou assis, un haltère tenu à deux mains derrière la tête, tendre les coudes vers le haut. Travaille les trois chefs du triceps avec amplitude maximale.",
  },
  {
    name: "Kickback triceps",
    primary_muscle: "Triceps",
    secondary_muscles: [],
    equipment: "Haltères",
    description:
      "Penché en avant, coude fléchi à 90°, tendre l'avant-bras vers l'arrière. Isole la longue portion du triceps en contraction courte.",
  },
  {
    name: "Dips à la chaise (bench dips)",
    primary_muscle: "Triceps",
    secondary_muscles: ["Pectoraux inférieurs", "Deltoïde antérieur"],
    equipment: "Poids du corps",
    description:
      "Mains posées sur un banc derrière soi, jambes tendues devant, descendre en fléchissant les coudes. Variante des dips au poids du corps ciblant les triceps.",
  },

  // ========== BRAS — AVANT-BRAS ==========
  {
    name: "Curl poignets (flexion)",
    primary_muscle: "Avant-bras",
    secondary_muscles: [],
    equipment: "Barre",
    description:
      "Avant-bras posés sur les cuisses, fléchir les poignets vers le haut avec la barre. Renforce les fléchisseurs des avant-bras.",
  },
  {
    name: "Reverse curl",
    primary_muscle: "Avant-bras",
    secondary_muscles: ["Biceps", "Brachialis"],
    equipment: "Barre",
    description:
      "Curl avec prise pronation (paumes vers le bas), fléchir les coudes. Travaille les brachio-radiaux et les extenseurs de l'avant-bras.",
  },

  // ========== JAMBES ==========
  {
    name: "Squat",
    primary_muscle: "Quadriceps",
    secondary_muscles: ["Grand fessier", "Ischio-jambiers", "Core profond"],
    equipment: "Barre",
    description: "Barre sur les épaules, descendre en fléchissant les genoux puis remonter",
  },
  {
    name: "Fentes",
    primary_muscle: "Quadriceps",
    secondary_muscles: ["Grand fessier", "Ischio-jambiers", "Adducteurs"],
    equipment: "Haltères",
    description: "Faire un grand pas en avant, descendre en pliant le genou avant puis remonter",
  },
  {
    name: "Leg press",
    primary_muscle: "Quadriceps",
    secondary_muscles: ["Grand fessier", "Ischio-jambiers"],
    equipment: "Machine",
    description: "Assis, pousser la plateforme avec les pieds en tendant les jambes",
  },
  {
    name: "Soulevé de terre",
    primary_muscle: "Grand dorsal",
    secondary_muscles: ["Ischio-jambiers", "Grand fessier", "Quadriceps", "Érecteurs du rachis"],
    equipment: "Barre",
    description: "Soulever la barre du sol en gardant le dos droit, extension complète",
  },
  {
    name: "Pistol squat",
    primary_muscle: "Quadriceps",
    secondary_muscles: ["Grand fessier", "Ischio-jambiers"],
    equipment: "Poids du corps",
    description: "Squat sur une jambe, l'autre tendue devant, descendre puis remonter",
  },
  {
    name: "Squat gobelet",
    primary_muscle: "Quadriceps",
    secondary_muscles: ["Grand fessier", "Core profond"],
    equipment: "Haltères",
    description:
      "Tenir un haltère verticalement devant la poitrine, descendre en squat profond. Variante favorisant une posture verticale du buste et un bon travail des quadriceps.",
  },
  {
    name: "Fentes arrière (split squat)",
    primary_muscle: "Quadriceps",
    secondary_muscles: ["Grand fessier", "Ischio-jambiers"],
    equipment: "Haltères",
    description:
      "Faire un pas en arrière, poser le genou au sol puis remonter. Variante des fentes avant, plus stable et moins stressante pour le genou avant.",
  },
  {
    name: "Bulgarian split squat",
    primary_muscle: "Quadriceps",
    secondary_muscles: ["Grand fessier", "Ischio-jambiers"],
    equipment: "Haltères",
    description:
      "Pied arrière posé sur un banc, descendre en squat sur la jambe avant. Excellente variante unilatérale ciblant fessiers et quadriceps avec forte demande d'équilibre.",
  },
  {
    name: "Leg curl allongé",
    primary_muscle: "Ischio-jambiers",
    secondary_muscles: ["Grand fessier", "Mollets"],
    equipment: "Machine",
    description:
      "Allongé sur la machine, fléchir les genoux pour ramener la barre vers les fessiers. Isole les ischio-jambiers en position allongée.",
  },
  {
    name: "Leg extension",
    primary_muscle: "Quadriceps",
    secondary_muscles: [],
    equipment: "Machine",
    description:
      "Assis sur la machine, tendre les jambes pour soulever le pad. Isole les quadriceps sans solliciter les muscles stabilisateurs.",
  },
  {
    name: "Soulevé de terre jambes tendues",
    primary_muscle: "Ischio-jambiers",
    secondary_muscles: ["Grand fessier", "Érecteurs du rachis"],
    equipment: "Barre",
    description:
      "Jambes quasi tendues, descendre la barre le long des cuisses en maintenant le dos plat. Cible les ischio-jambiers et les fessiers plutôt que les quadriceps.",
  },
  {
    name: "Mollets debout à la machine",
    primary_muscle: "Mollets",
    secondary_muscles: [],
    equipment: "Machine",
    description:
      "Debout sur la plateforme, monter sur la pointe des pieds contre résistance. Cible les gastrocnémiens avec charge guidée.",
  },
  {
    name: "Mollets assis à la machine",
    primary_muscle: "Mollets",
    secondary_muscles: [],
    equipment: "Machine",
    description:
      "Assis, genoux à 90°, monter sur la pointe des pieds avec le pad sur les cuisses. Cible le soléaire (muscle profond du mollet), actif uniquement genou fléchi.",
  },
  {
    name: "Nordic curl",
    primary_muscle: "Ischio-jambiers",
    secondary_muscles: ["Grand fessier"],
    equipment: "Poids du corps",
    description:
      "Genoux au sol, pieds fixés, s'incliner vers l'avant en résistant avec les ischios puis se laisser tomber. Exercice excentrique très intense pour les ischio-jambiers.",
  },
  {
    name: "Leg curl assis",
    primary_muscle: "Ischio-jambiers",
    secondary_muscles: [],
    equipment: "Machine",
    description:
      "Assis sur la machine, fléchir les genoux pour tirer le pad vers les fessiers. Variante assise du leg curl, genou fléchi à 90° en position de départ.",
  },
  {
    name: "Jump squat",
    primary_muscle: "Quadriceps",
    secondary_muscles: ["Grand fessier", "Mollets"],
    equipment: "Poids du corps",
    description:
      "Squat suivi d'une détente maximale, atterrir en douceur en amortissant. Variante plyométrique du squat développant la puissance explosive des membres inférieurs.",
  },
  {
    name: "Step-ups sur box",
    primary_muscle: "Quadriceps",
    secondary_muscles: ["Grand fessier", "Ischio-jambiers"],
    equipment: "Poids du corps",
    description:
      "Monter alternativement sur une box en poussant sur la jambe avant. Travaille les quadriceps, les fessiers et l'équilibre. Peut être lesté avec haltères.",
  },

  // ========== FESSIERS ==========
  {
    name: "Hip thrust à la barre",
    primary_muscle: "Grand fessier",
    secondary_muscles: ["Ischio-jambiers", "Moyen fessier"],
    equipment: "Barre",
    description:
      "Dos appuyé sur un banc, barre sur les hanches, pousser les hanches vers le haut en contractant les fessiers. Un des meilleurs exercices pour les fessiers.",
  },
  {
    name: "Hip thrust aux haltères",
    primary_muscle: "Grand fessier",
    secondary_muscles: ["Ischio-jambiers", "Moyen fessier"],
    equipment: "Haltères",
    description:
      "Dos appuyé sur un banc, haltères posés sur les hanches, pousser les hanches vers le haut. Variante du hip thrust à la barre, plus accessible pour débuter.",
  },
  {
    name: "Abduction hanche à la machine",
    primary_muscle: "Moyen fessier",
    secondary_muscles: ["Grand fessier"],
    equipment: "Machine",
    description:
      "Assis à la machine, écarter les genoux contre la résistance des pads. Cible le grand et le moyen fessier dans leur fonction d'abduction.",
  },
  {
    name: "Fentes latérales",
    primary_muscle: "Grand fessier",
    secondary_muscles: ["Adducteurs", "Quadriceps"],
    equipment: "Haltères",
    description:
      "Écarter une jambe sur le côté, s'asseoir sur cette jambe en gardant l'autre tendue, puis revenir. Travaille les adducteurs, les fessiers et les quadriceps.",
  },
  {
    name: "Kickback fessier à la poulie",
    primary_muscle: "Grand fessier",
    secondary_muscles: ["Ischio-jambiers"],
    equipment: "Machine",
    description:
      "Debout face à la poulie basse, cheville attachée au câble, pousser la jambe vers l'arrière en contractant le fessier. Isolation du grand fessier.",
  },

  // ========== CORE ==========
  {
    name: "Crunch",
    primary_muscle: "Abdominaux",
    secondary_muscles: [],
    equipment: "Poids du corps",
    description: "Allongé, genoux pliés, relever le buste en contractant les abdos",
  },
  {
    name: "Planche",
    primary_muscle: "Core profond",
    secondary_muscles: ["Abdominaux", "Érecteurs du rachis"],
    equipment: "Poids du corps",
    description: "En appui sur les avant-bras et pieds, maintenir le corps aligné et gainé",
  },
  {
    name: "Russian twist",
    primary_muscle: "Obliques",
    secondary_muscles: ["Abdominaux"],
    equipment: "Haltères",
    description: "Assis, pieds décollés, tourner le buste de gauche à droite avec haltère",
  },
  {
    name: "Mountain climbers",
    primary_muscle: "Core profond",
    secondary_muscles: ["Abdominaux", "Quadriceps", "Deltoïde antérieur"],
    equipment: "Poids du corps",
    description: "En position pompe, ramener alternativement les genoux vers la poitrine",
  },
  {
    name: "Relevé de jambes suspendu",
    primary_muscle: "Abdominaux",
    secondary_muscles: ["Core profond", "Avant-bras"],
    equipment: "Poids du corps",
    description:
      "Suspendu à une barre, lever les jambes tendues jusqu'à l'horizontale (ou genoux vers la poitrine). Travaille intensément les abdominaux inférieurs et les fléchisseurs de hanche.",
  },
  {
    name: "Wheel rollout (roue abdominale)",
    primary_muscle: "Core profond",
    secondary_muscles: ["Abdominaux", "Grand dorsal"],
    equipment: "Haltères",
    description:
      "À genoux, tenir la roue abdominale et se dérouler vers l'avant en gardant les abdos gainés, puis revenir. Sollicite l'ensemble de la sangle abdominale et les dorsaux.",
  },
  {
    name: "Planche latérale",
    primary_muscle: "Obliques",
    secondary_muscles: ["Core profond"],
    equipment: "Poids du corps",
    description:
      "En appui sur un avant-bras et le côté du pied, maintenir le corps aligné. Travaille les obliques et le carré des lombes. Variante latérale de la planche classique.",
  },
  {
    name: "Crunch à la poulie",
    primary_muscle: "Abdominaux",
    secondary_muscles: ["Core profond"],
    equipment: "Machine",
    description:
      "À genoux face à une poulie haute, tirer la corde en fléchissant le buste. Permet d'ajouter de la charge aux crunchs classiques pour progresser.",
  },
  {
    name: "Dead bug",
    primary_muscle: "Core profond",
    secondary_muscles: ["Abdominaux"],
    equipment: "Poids du corps",
    description:
      "Allongé sur le dos, bras et jambes en l'air à 90°, descendre alternativement un bras et la jambe opposée en gardant le bas du dos plaqué au sol.",
  },
  {
    name: "Dragon flag",
    primary_muscle: "Core profond",
    secondary_muscles: ["Abdominaux", "Grand dorsal"],
    equipment: "Poids du corps",
    description:
      "Allongé sur un banc, s'accrocher derrière la tête, soulever le corps rigide en gardant seulement les épaules en appui. Exercice avancé pour l'ensemble du core.",
  },
  {
    name: "Hollow hold",
    primary_muscle: "Core profond",
    secondary_muscles: ["Abdominaux"],
    equipment: "Poids du corps",
    description:
      "Allongé, lombaires plaquées au sol, bras et jambes tendus légèrement décollés, maintenir la position. Gainage isométrique profond de toute la sangle abdominale.",
  },
  {
    name: "Ab wheel debout",
    primary_muscle: "Core profond",
    secondary_muscles: ["Abdominaux", "Grand dorsal"],
    equipment: "Haltères",
    description:
      "Variante avancée de la roue abdominale effectuée debout : se pencher en avant en laissant la roue rouler au sol jusqu'à quasi l'allongement, puis revenir.",
  },
  {
    name: "Pallof press",
    primary_muscle: "Core profond",
    secondary_muscles: ["Obliques"],
    equipment: "Machine",
    description:
      "Debout de profil face à une poulie, tenir la poignée devant la poitrine et tendre les bras puis revenir. Résistance à la rotation : travaille le core en anti-rotation.",
  },
  {
    name: "Sit-up complet",
    primary_muscle: "Abdominaux",
    secondary_muscles: ["Core profond"],
    equipment: "Poids du corps",
    description:
      "Allongé, pieds fixés au sol, remonter le buste jusqu'à la position assise. Amplitude plus grande que le crunch, sollicite également les fléchisseurs de hanche.",
  },
  {
    name: "Bicycle crunch",
    primary_muscle: "Abdominaux",
    secondary_muscles: ["Obliques"],
    equipment: "Poids du corps",
    description:
      "Allongé, mains derrière la tête, amener coude droit vers genou gauche en alternance. Travaille simultanément les abdos droits et les obliques.",
  },

  // ========== CORPS ENTIER ==========
  {
    name: "Burpees",
    primary_muscle: "Corps entier",
    secondary_muscles: ["Quadriceps", "Pectoraux moyens", "Abdominaux"],
    equipment: "Poids du corps",
    description:
      "Descendre en squat, planche, pompe, sauter debout avec les mains en l'air",
  },
  {
    name: "Kettlebell swing",
    primary_muscle: "Corps entier",
    secondary_muscles: ["Grand fessier", "Ischio-jambiers", "Core profond"],
    equipment: "Haltères",
    description:
      "Balancer le kettlebell entre les jambes puis propulser à hauteur des épaules",
  },
  {
    name: "Thruster",
    primary_muscle: "Corps entier",
    secondary_muscles: ["Quadriceps", "Deltoïde antérieur", "Triceps"],
    equipment: "Haltères",
    description: "Squat avec haltères sur les épaules puis développé en remontant",
  },
  {
    name: "Box jump",
    primary_muscle: "Quadriceps",
    secondary_muscles: ["Grand fessier", "Mollets"],
    equipment: "Poids du corps",
    description: "Sauter sur une plateforme en hauteur puis redescendre",
  },
  {
    name: "Clean and press à la barre",
    primary_muscle: "Corps entier",
    secondary_muscles: ["Quadriceps", "Grand dorsal", "Deltoïde antérieur"],
    equipment: "Barre",
    description:
      "Arracher la barre du sol jusqu'aux épaules (clean), puis pousser au-dessus de la tête (press). Exercice olympique complet sollicitant jambes, dos, épaules et bras.",
  },
  {
    name: "Snatch à la kettlebell",
    primary_muscle: "Corps entier",
    secondary_muscles: ["Grand fessier", "Deltoïde antérieur", "Core profond"],
    equipment: "Haltères",
    description:
      "D'un seul mouvement fluide, arracher la kettlebell du sol jusqu'au bras tendu au-dessus de la tête. Développe puissance, coordination et endurance.",
  },
  {
    name: "Farmer's walk",
    primary_muscle: "Corps entier",
    secondary_muscles: ["Trapèzes", "Core profond", "Avant-bras"],
    equipment: "Haltères",
    description:
      "Porter des haltères lourds de chaque côté et marcher sur une distance définie. Renforce la prise, les trapèzes, le core et les jambes simultanément.",
  },
  {
    name: "Sled push",
    primary_muscle: "Corps entier",
    secondary_muscles: ["Quadriceps", "Grand fessier", "Core profond"],
    equipment: "Machine",
    description:
      "Pousser un traîneau lesté sur une distance définie en position inclinée, jambes en pleine puissance. Travaille les quadriceps, les fessiers et le gainage.",
  },
  {
    name: "Battle ropes",
    primary_muscle: "Corps entier",
    secondary_muscles: ["Deltoïde antérieur", "Core profond"],
    equipment: "Machine",
    description:
      "Tenir les extrémités de cordes épaisses et effectuer des ondulations alternées ou simultanées. Cardio-training intense sollicitant épaules, bras et core.",
  },
  {
    name: "Med ball slam",
    primary_muscle: "Corps entier",
    secondary_muscles: ["Core profond", "Grand dorsal"],
    equipment: "Haltères",
    description:
      "Lever un ballon lesté au-dessus de la tête puis le projeter violemment au sol. Exercice explosif travaillant le core, les dorsaux et les bras.",
  },
  {
    name: "Turkish get-up",
    primary_muscle: "Corps entier",
    secondary_muscles: ["Core profond", "Deltoïde antérieur"],
    equipment: "Haltères",
    description:
      "Allongé au sol, un kettlebell bras tendu, se lever debout en maintenant le bras vertical tout du long. Exercice complet de mobilité, force et stabilité.",
  },
  {
    name: "Jumping jacks",
    primary_muscle: "Corps entier",
    secondary_muscles: [],
    equipment: "Poids du corps",
    description:
      "Sauter en écartant simultanément les jambes et en levant les bras, puis revenir en position initiale. Exercice d'échauffement et cardio léger.",
  },
  {
    name: "Sprints (30 m)",
    primary_muscle: "Corps entier",
    secondary_muscles: ["Quadriceps", "Grand fessier", "Ischio-jambiers"],
    equipment: "Poids du corps",
    description:
      "Sprint à vitesse maximale sur 30 mètres. Développe la puissance musculaire, la vitesse et l'explosivité cardiovasculaire.",
  },
];

export default function SeedExercises() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      <h1>Seed la base de données</h1>
      <p>Ajouter {exercises.length} nouveaux exercices</p>

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
        {loading ? "⏳ Ajout en cours..." : `🚀 Ajouter ${exercises.length} exercices`}
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
