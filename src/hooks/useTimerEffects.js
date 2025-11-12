import { useCallback } from "react";

export function useTimerEffects() {
  // ═══════════════════════════════════════════════════════
  // 🔊 JOUER UN SON
  // ═══════════════════════════════════════════════════════
  const playSound = useCallback(() => {
    try {
      // ─────────────────────────────────────────────────────
      // Option A : Utiliser un fichier audio
      // ─────────────────────────────────────────────────────
      const audio = new Audio("/sounds/timer.mp3");
      audio.volume = 0.5; // Volume à 50%
      audio.play().catch((err) => {
        console.warn("Impossible de jouer le son:", err);
        // Fallback : synthétiser un bip si le fichier n'existe pas
        playBeep();
      });
    } catch (error) {
      console.warn("Erreur audio:", error);
      playBeep(); // Fallback
    }
  }, []);

  // ─────────────────────────────────────────────────────
  // Option B : Synthétiser un bip avec Web Audio API
  // ─────────────────────────────────────────────────────
  const playBeep = useCallback(() => {
    try {
      // Créer un contexte audio
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Créer un oscillateur (générateur de fréquence)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connecter oscillateur → gain → sortie
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // ⚙️ Configuration du son
      oscillator.type = "sine"; // Type de son (sine, square, sawtooth, triangle)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Fréquence en Hz (800 Hz = ton aigu)

      // Volume (fade out pour éviter le "clic")
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volume initial
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3,
      ); // Fade out sur 0.3s

      // ▶️ Démarrer et arrêter
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3); // Durée : 300ms
    } catch (error) {
      console.warn("Web Audio API non supportée:", error);
    }
  }, []);

  // ═══════════════════════════════════════════════════════
  // 📳 VIBRATION (mobile uniquement)
  // ═══════════════════════════════════════════════════════
  const vibrate = useCallback(() => {
    // Vérifier si l'API Vibration est disponible
    if ("vibrate" in navigator) {
      // Pattern de vibration : [durée vibration, pause, durée, pause, ...]
      // Ici : 3 petites vibrations
      navigator.vibrate([200, 100, 200, 100, 200]);
    } else {
      console.warn("Vibration API non supportée sur ce navigateur");
    }
  }, []);

  // ═══════════════════════════════════════════════════════
  // 🔔 NOTIFICATION NAVIGATEUR (optionnel)
  // ═══════════════════════════════════════════════════════
  const showNotification = useCallback((title, body) => {
    // Vérifier si les notifications sont supportées
    if (!("Notification" in window)) {
      console.warn("Notifications non supportées");
      return;
    }

    // Demander la permission si pas encore accordée
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: "/icon.png", // Optionnel : icône de l'app
        badge: "/badge.png", // Optionnel : badge
        vibrate: [200, 100, 200], // Vibration sur mobile
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  }, []);

  // ═══════════════════════════════════════════════════════
  // 🎯 FONCTION PRINCIPALE : Tout déclencher en une fois
  // ═══════════════════════════════════════════════════════
  const triggerTimerComplete = useCallback(() => {
    playSound(); // 🔊 Son
    vibrate(); // 📳 Vibration
    showNotification("⏱️ Repos terminé !", "Prêt pour la série suivante ?"); // 🔔 Notification (optionnel)
  }, [playSound, vibrate, showNotification]);

  return {
    playSound,
    playBeep,
    vibrate,
    showNotification,
    triggerTimerComplete, // ✅ Fonction all-in-one
  };
}
