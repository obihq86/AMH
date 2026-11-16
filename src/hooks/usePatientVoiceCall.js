import { useState, useCallback, useRef, useEffect } from 'react';

const SPEAK_API_URL = 'https://chdqbdnrqdrxbazbbhqp.supabase.co/functions/v1/speak-name';

export const usePatientVoiceCall = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioQueue = useRef(Promise.resolve());
  const sharedAudioRef = useRef(null);

  // ১. একটি মাত্র অডিও এলিমেন্ট তৈরি ও ইউজারের প্রথম ক্লিকে সেটি স্থায়ীভাবে আনলক করা
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const audio = new Audio();
    audio.preload = 'auto';
    sharedAudioRef.current = audio;

    const unlock = () => {
      try {
        audio.src = '/sounds/chime.mp3';
        audio.volume = 0.01;
        const p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1;
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
          }).catch(() => {});
        }
      } catch {}
    };

    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

  const playOnSharedAudio = useCallback((url, maxWaitMs = 9000) => {
    return new Promise((resolve) => {
      const audio = sharedAudioRef.current || new Audio();
      sharedAudioRef.current = audio;
      audio.volume = 1;

      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        audio.removeEventListener('ended', done);
        audio.removeEventListener('error', done);
        resolve();
      };

      const timer = setTimeout(done, maxWaitMs);
      audio.addEventListener('ended', done);
      audio.addEventListener('error', done);

      try {
        audio.pause();
        audio.src = url;
        audio.load();
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(() => done());
        }
      } catch {
        done();
      }
    });
  }, []);

  const callPatientByName = useCallback((patientName) => {
    if (!patientName) return;

    audioQueue.current = audioQueue.current.then(async () => {
      setIsSpeaking(true);
      try {
        // ১. আগে চাইম বাজবে
        await playOnSharedAudio('/sounds/chime.mp3', 4000);
        // ২. এরপর Supabase থেকে রোগীর নামের বাংলা ঘোষণা বাজবে
        const voiceUrl = `${SPEAK_API_URL}?name=${encodeURIComponent(patientName.trim())}`;
        await playOnSharedAudio(voiceUrl, 10000);
      } finally {
        setIsSpeaking(false);
      }
    });
  }, [playOnSharedAudio]);

  return { callPatientByName, isSpeaking };
};