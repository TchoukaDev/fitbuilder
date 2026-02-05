import { useCallback } from "react";

/**
 * Regroupe les effets liés au timer (sons, vibration, notification).
 */
export function useTimerEffects() {


  /**
   * Joue un bip synthétique via l'API Web Audio.
   */
  const playBeep = useCallback(() => {
    try {
      // Créer un contexte audio
      const audioContext = new (window.AudioContext ||
        window.AudioContext)();

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


  /**
 * Joue un son de fin de timer (fichier audio ou bip de fallback).
 */
  const playSound = useCallback(() => {
    try {
      const audio = new Audio("/sounds/timer.mp3");
      audio.volume = 0.5; // Volume à 50%
      audio.play().catch(() => {
        // Fallback : synthétiser un bip si le fichier n'existe pas
        playBeep();
      });
    } catch {
      playBeep(); // Fallback
    }
  }, [playBeep]);

  /**
   * Déclenche une courte vibration sur mobile (si supportée).
   */
  const vibrate = useCallback(() => {

    try {
      // Vérifier si l'API Vibration est disponible
      if (typeof navigator.vibrate === "function") {
        // Pattern de vibration : [durée vibration, pause, durée, pause, ...]
        // Ici : 3 petites vibrations
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    } catch {

    }
  }, [playBeep]);

  /**
   * Affiche une notification navigateur (si supportée / autorisée).
   *
   * @param {string} title - Titre de la notification.
   * @param {string} body - Message de la notification.
   */
  const showNotification = useCallback((title, body) => {


    try { // Vérifier si les notifications sont supportées
      if (!("Notification" in window)) {
        console.warn("Notifications non supportées");
        return;
      }

      // //Méthode mobile
      // if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      //   navigator.serviceWorker.ready.then((registration) => {
      //     registration.showNotification(title, {
      //       body: body,
      //       icon: "/app/favicon.ico",
      //     });
      //   });
      //   return;
      // }

      //Méthode desktop
      // Demander la permission si pas encore accordée
      if (Notification.permission === "granted") {
        new Notification(title, {
          body: body,
          icon: "/app/favicon.ico", // Optionnel : icône de l'app
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            try {
              new Notification(title, { body });
            } catch {
              //Si erreur -> On ne fait rien
            }
          }
        });
      }
    } catch {
      //Si erreur -> On ne fait rien
    }
  }, []);

  /**
   * Déclenche tous les effets de fin de timer (son, vibration, notification).
   */
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
