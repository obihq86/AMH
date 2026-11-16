import { useState, useCallback, useRef } from 'react';

const SPEAK_API_URL = 'https://chdqbdnrqdrxbazbbhqp.supabase.co/functions/v1/speak-name';

export const usePatientVoiceCall = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioQueue = useRef(Promise.resolve());

  const playAudioSafe = useCallback((url, maxWaitMs = 8000) => {
    return new Promise((resolve) => {
      let settled = false;
      const audio = new Audio();
      audio.src = url;
      audio.preload = 'auto';

      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        audio.removeEventListener('ended', done);
        audio.removeEventListener('error', done);
        resolve();
      };

      // পুরনো টিভি ব্রাউজারে ended ইভেন্ট মিস হলে যেন কিউ আটকে না থাকে
      const timer = setTimeout(done, maxWaitMs);

      audio.addEventListener('ended', done);
      audio.addEventListener('error', done);

      try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch((err) => {
            console.warn('Audio play blocked/failed:', url, err);
            done();
          });
        }
      } catch (err) {
        console.warn('Audio exception:', url, err);
        done();
      }
    });
  }, []);

  const callPatientByName = useCallback((patientName) => {
    if (!patientName) return;

    audioQueue.current = audioQueue.current.then(async () => {
      setIsSpeaking(true);
      try {
        // ১. চাইম বাজবে (যদি কোনো কারণে ফেইল বা ব্লক হয় তবুও ভয়েস কল চলবে)
        await playAudioSafe('/sounds/chime.mp3', 3500);

        // ২. এরপর Supabase থেকে রোগীর নামের বাংলা ঘোষণা বাজবে
        const voiceUrl = `${SPEAK_API_URL}?name=${encodeURIComponent(patientName.trim())}`;
        await playAudioSafe(voiceUrl, 9000);
      } finally {
        setIsSpeaking(false);
      }
    });
  }, [playAudioSafe]);

  return { callPatientByName, isSpeaking };
};