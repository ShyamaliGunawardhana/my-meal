import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { getNextCookingReply } from "@/data/dummy-cooking-qa";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { CHEF_SVG } from "@/theme/svg-icons";

export interface CookingExchange {
  question: string;
  answer: string;
}

interface CookingModeScreenProps {
  visible: boolean;
  recipeTitle: string;
  onClose: () => void;
  // Called after each question/answer turn so the main chat keeps a
  // full record - hands-free mode is an overlay, not a separate chat.
  onExchange: (exchange: CookingExchange) => void;
}

type Phase = "listening" | "speaking";

// Hands-free cooking Q&A: on-device STT -> dummy reasoning -> on-device
// TTS reply, looping automatically while the screen is open.
//
// Per decisions.md, true "barge-in" (interrupting the AI mid-sentence
// just by talking over it) needs an echo-cancelled audio session so the
// mic doesn't hear the AI's own voice as input - that native audio
// session work isn't wired up yet. Until then the mic stays off while
// the AI is speaking, and the big button doubles as a manual interrupt
// (documented fallback: manual interrupt now, automatic volume-based
// barge-in is a future upgrade).
export function CookingModeScreen({
  visible,
  recipeTitle,
  onClose,
  onExchange,
}: CookingModeScreenProps) {
  const [phase, setPhase] = useState<Phase>("listening");
  const [lastAnswer, setLastAnswer] = useState("");
  const isOpen = useRef(visible);
  isOpen.current = visible;

  const { speak, stop: stopSpeaking } = useTextToSpeech();

  const handleFinalResult = (question: string) => {
    if (!isOpen.current) return;
    setPhase("speaking");
    const answer = getNextCookingReply();
    setLastAnswer(answer);
    onExchange({ question, answer });
    speak("cooking-mode", answer, () => {
      if (isOpen.current) {
        setPhase("listening");
        start();
      }
    });
  };

  const { listening, transcript, error, start, stop } = useSpeechToText({
    onFinalResult: handleFinalResult,
  });

  useEffect(() => {
    if (visible) {
      setPhase("listening");
      setLastAnswer("");
      start();
    } else {
      stop();
      stopSpeaking();
    }
    // Only react to the screen opening/closing, not to start/stop/
    // stopSpeaking identity (stable useCallback refs from the hooks).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleMainButtonPress = () => {
    if (phase === "speaking") {
      // Manual barge-in: cut the AI off and listen immediately.
      stopSpeaking();
      setPhase("listening");
      start();
    }
  };

  const handleClose = () => {
    stop();
    stopSpeaking();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
          <Text
            className="text-lg font-semibold text-text-main flex-1 pr-2"
            numberOfLines={1}
          >
            Cooking: {recipeTitle}
          </Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={26} color="#24332B" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          <View className="items-center">
            <Icon xml={CHEF_SVG} size={56} />
            <Text className="text-text-main/60 text-sm mt-4 text-center">
              {phase === "speaking" ? "Speaking..." : "Listening..."}
            </Text>

            {phase === "listening" && transcript.length > 0 && (
              <Text className="text-text-main text-lg font-medium text-center mt-3">
                &quot;{transcript}&quot;
              </Text>
            )}

            {lastAnswer.length > 0 && (
              <View className="bg-agent-bubble border border-black/5 rounded-2xl px-4 py-3 mt-6 w-full">
                <Text className="text-text-main text-base">{lastAnswer}</Text>
              </View>
            )}

            {error && (
              <Text className="text-danger text-sm mt-4 text-center">
                {error}
              </Text>
            )}
          </View>
        </ScrollView>

        <View className="items-center pb-10 pt-4">
          <Pressable
            onPress={handleMainButtonPress}
            disabled={phase === "listening"}
            className={`w-20 h-20 rounded-full items-center justify-center ${
              phase === "listening" ? "bg-danger/15" : "bg-primary"
            }`}
          >
            <Ionicons
              name="mic"
              size={32}
              color={phase === "listening" ? "#B42318" : "#FFFFFF"}
            />
          </Pressable>
          <Text className="text-text-main/50 text-xs mt-3">
            {phase === "speaking"
              ? "Tap to interrupt"
              : listening
              ? "Listening for your question"
              : "Starting up..."}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
