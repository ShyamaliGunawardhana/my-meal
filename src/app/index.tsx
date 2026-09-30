import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HistoryPanel } from "@/components/history-panel";
import { SettingsPanel } from "@/components/settings-panel";
import type { DummyChat } from "@/data/dummy-chats";
import { getNextDummyReply } from "@/data/dummy-recipes";
import type { ChatMessage } from "@/types/chat";

// Dark yellow (not plain bright yellow) so icons stay readable against
// the cream background - see decisions.md.
const darkYellow = "#A16207";

// Always a fresh session - no persisted state is read here, so closing
// and reopening the app starts a new recipe chat, same as opening
// "New chat" would.
export default function NewRecipeChatScreen() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { id: Date.now().toString(), role: "user", text: trimmed },
    ]);
    setDraft("");

    // Dummy reply for now - stands in for the real matching/AI pipeline
    // so the two-sided chat UI can be reviewed before that's built.
    setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-agent`, role: "agent", text: getNextDummyReply() },
      ]);
    }, 500);
  };

  const handleSelectHistory = (chat: DummyChat) => {
    setMessages(chat.messages);
    setHistoryOpen(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setDraft("");
    setHistoryOpen(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={() => setHistoryOpen(true)}
              hitSlop={12}
              className="pl-1"
            >
              <Ionicons name="menu-outline" size={26} color={darkYellow} />
            </Pressable>
          ),
          headerRight: () => (
            <View className="flex-row items-center gap-4 pr-1">
              <Pressable onPress={handleNewChat} hitSlop={12}>
                <Ionicons name="create-outline" size={24} color={darkYellow} />
              </Pressable>
              <Pressable onPress={() => setSettingsOpen(true)} hitSlop={12}>
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color={darkYellow}
                />
              </Pressable>
            </View>
          ),
        }}
      />

      <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-lg font-semibold text-text-main mb-2 text-center">
                New recipe chat
              </Text>
              <Text className="text-text-main/60 text-center">
                Tell me what ingredients you have, or use the camera or mic
                below.
              </Text>
            </View>
          }
          renderItem={({ item }) =>
            item.role === "user" ? (
              <View className="self-end bg-secondary rounded-2xl px-4 py-3 mb-3 max-w-[85%]">
                <Text className="text-white text-base">{item.text}</Text>
              </View>
            ) : (
              <View className="self-start bg-surface border border-black/5 rounded-2xl px-4 py-3 mb-3 max-w-[85%]">
                <Text className="text-text-main text-base">{item.text}</Text>
              </View>
            )
          }
        />

        <View className="flex-row items-end gap-2 px-4 pb-4">
          <View className="flex-1 relative justify-center">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={handleSend}
              placeholder="What do you have in your kitchen?"
              multiline
              className="bg-surface rounded-2xl pl-4 pr-20 py-3 text-base text-text-main border border-black/5 max-h-32"
              returnKeyType="send"
            />
            <View className="absolute right-1 bottom-1 flex-row gap-1">
              <Pressable
                hitSlop={8}
                className="w-9 h-9 items-center justify-center rounded-full active:opacity-70"
              >
                <Ionicons name="camera-outline" size={20} color={darkYellow} />
              </Pressable>
              <Pressable
                hitSlop={8}
                className="w-9 h-9 items-center justify-center rounded-full active:opacity-70"
              >
                <Ionicons name="mic-outline" size={20} color={darkYellow} />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleSend}
            className="bg-secondary rounded-full w-11 h-11 items-center justify-center active:opacity-80"
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </SafeAreaView>

      <HistoryPanel
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleSelectHistory}
        onNewChat={handleNewChat}
      />
      <SettingsPanel
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
