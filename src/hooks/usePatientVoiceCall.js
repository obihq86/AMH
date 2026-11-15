import { useRef, useState, useCallback } from 'react';

const SPEAK_API_URL = 'https://chdqbdnrqdrxbazbbhqp.supabase.co/functions/v1/speak-name';

export const usePatientVoiceCall = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  const playAudioSrc = (src) => {
    return new Promise((resolve) => {
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.crossOrigin = "anonymous";

      audio.onended = () => resolve();
      audio.onerror = (e) => {
        console.warn("Audio playback skipped:", src, e);
        resolve();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay blocked:", err);
          resolve();
        });
      }
    });
  };

  const callPatientByName = useCallback(async (patientName, soundMode = 'voice') => {
    if (soundMode === 'mute' || !patientName || isSpeaking) return;

    setIsSpeaking(true);
    try {
      // ১. প্রথমে আপনার পছন্দের chime.mp3 বাজবে
      await playAudioSrc('/sounds/chime.mp3');

      // ২. এরপর Supabase থেকে রোগীর নামের বাংলা ঘোষণা বাজবে
      if (soundMode === 'voice') {
        const encodedName = encodeURIComponent(patientName.trim());
        const voiceUrl = `${SPEAK_API_URL}?name=${encodedName}`;
        await playAudioSrc(voiceUrl);
      }
    } finally {
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  return { callPatientByName, isSpeaking };
};