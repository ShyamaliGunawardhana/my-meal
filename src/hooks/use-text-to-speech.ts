import { useCallback, useState } from "react";
import * as Speech from "expo-speech";

// Wraps expo-speech - on-device TTS. Like STT, nothing here is sent to
// any API; this only reads text that already exists in the app out
// loud.
export function useTextToSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const speak = useCallback(
    (id: string, text: string, onDone?: () => void) => {
      if (!text.trim()) return;
      Speech.stop();
      setSpeakingId(id);
      Speech.speak(text, {
        onDone: () => {
          setSpeakingId((current) => (current === id ? null : current));
          onDone?.();
        },
        onStopped: () =>
          setSpeakingId((current) => (current === id ? null : current)),
        onError: () =>
          setSpeakingId((current) => (current === id ? null : current)),
      });
    },
    []
  );

  const stop = useCallback(() => {
    Speech.stop();
    setSpeakingId(null);
  }, []);

  return { speakingId, speak, stop };
}
