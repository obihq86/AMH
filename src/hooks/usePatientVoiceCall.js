import { useState, useCallback, useRef } from 'react';

export const usePatientVoiceCall = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioQueue = useRef(Promise.resolve());

  const playAudio = useCallback((url) => {
    return new Promise((resolve, reject) => {
      console.log("usePatientVoiceCall: Loading audio from", url);
      // CSP-এর কারণে সরাসরি ইনলাইন স্ক্রিপ্ট বা ডাইনামিক কোড সমস্যা হতে পারে,
      // তাই এখানে সরাসরি Audio() কনস্ট্রাক্টর ব্যবহার করছি।
      const audio = new Audio();
      audio.src = url;
      audio.preload = "auto";
      
      const handleEnded = () => {
        console.log("usePatientVoiceCall: Audio ended", url);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        resolve();
      };
      
      const handleError = (e) => {
        console.error("usePatientVoiceCall: Audio error", url, e);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        reject(e);
      };
      
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      audio.play().catch(err => {
        console.error("usePatientVoiceCall: Play promise rejected", url, err);
        // রিজেক্ট না করে হয়তো অডিওটি মিউট বা বাফার হতে সময় লাগছে
        reject(err);
      });
    });
  }, []);

  const callPatientByName = useCallback((patientName) => {
    if (!patientName) return;

    setIsSpeaking(true);

    audioQueue.current = audioQueue.current.then(async () => {
      try {
        // ১. চিম প্লে করা
        await playAudio('/sounds/chime.mp3');
        // ২. বাংলা ভয়েস কল করা
        const voiceUrl = `https://chdqbdnrqdrxbazbbhqp.supabase.co/functions/v1/speak-name?name=${encodeURIComponent(patientName)}`;
        await playAudio(voiceUrl);
      } catch (error) {
        console.error("Audio sequence error:", error);
      } finally {
        setIsSpeaking(false);
      }
    });
  }, [playAudio]);

  return { callPatientByName, isSpeaking };
};
