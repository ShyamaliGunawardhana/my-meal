import { useCallback, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

interface UseSpeechToTextOptions {
  // Called on every interim/final chunk while recognizing - used both
  // for live-updating the chat draft and for hands-free looping.
  onResult?: (transcript: string, isFinal: boolean) => void;
  // Called once with the final, settled transcript for an utterance.
  onFinalResult?: (transcript: string) => void;
}

// Wraps expo-speech-recognition - on-device STT (Android
// SpeechRecognizer / iOS SFSpeechRecognizer / web SpeechRecognition).
// Only the recognized text ever leaves this hook; no audio is sent
// anywhere, per the "voice stays on-device" decision in decisions.md.
export function useSpeechToText({
  onResult,
  onFinalResult,
}: UseSpeechToTextOptions = {}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useSpeechRecognitionEvent("start", () => setListening(true));
  useSpeechRecognitionEvent("end", () => setListening(false));
  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    setTranscript(text);
    onResult?.(text, event.isFinal);
    if (event.isFinal && text.trim()) {
      onFinalResult?.(text.trim());
    }
  });
  useSpeechRecognitionEvent("error", (event) => {
    setError(event.message || event.error);
    setListening(false);
  });

  const start = useCallback(async () => {
    setError(null);
    setTranscript("");
    const permission =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setError("Microphone/speech recognition permission was not granted.");
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: false,
    });
  }, []);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return { listening, transcript, error, start, stop };
}
