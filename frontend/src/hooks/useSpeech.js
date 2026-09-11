import { useEffect, useRef, useState } from 'react';

// Ported unchanged from frontend/react-export/src/hooks/useSpeech.js.
// Browser SpeechRecognition is not guaranteed to run on-device (Chrome
// typically round-trips through a cloud STT service) — `supported` already
// gates the mic button, and text input always works regardless.
export function useSpeech(onResult) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => { onResult(e.results[0][0].transcript); setListening(false); };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setSupported(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) { recognition.stop(); setListening(false); }
    else { try { recognition.start(); setListening(true); } catch (e) { /* already started */ } }
  };

  return { supported, listening, toggle };
}
