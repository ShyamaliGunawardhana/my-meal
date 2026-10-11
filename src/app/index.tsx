import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatBackground } from "@/components/chat-background";
import { HistoryPanel } from "@/components/history-panel";
import { Icon } from "@/components/icon";
import { PhotoSourceSheet } from "@/components/photo-source-sheet";
import { SettingsPanel } from "@/components/settings-panel";
import type { DummyChat } from "@/data/dummy-chats";
import { getNextDummyReply } from "@/data/dummy-recipes";
import {
  CAMERA_SVG,
  CHEF_SVG,
  EDIT_SVG,
  MENU_SVG,
  MIC_SVG,
  SEND_SVG,
  SETTINGS_SVG,
} from "@/theme/svg-icons";
import type { ChatMessage } from "@/types/chat";

// Always a fresh session - no persisted state is read here, so closing
// and reopening the app starts a new recipe chat, same as opening
// "New chat" would.
export default function NewRecipeChatScreen() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Edge-to-edge is the default on Android in SDK 54, so the window does
  // not resize for the keyboard (adjustResize is ignored) and
  // KeyboardAvoidingView cannot be relied on there. Track the keyboard
  // height directly and pad the container by that amount instead.
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

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

  const addPhotoMessage = (uri: string) => {
    setMessages((current) => [
      ...current,
      { id: Date.now().toString(), role: "user", text: "", imageUri: uri },
    ]);

    // Dummy reply for now - real ingredient recognition from the photo
    // comes with the Gemini integration milestone.
    setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-agent`, role: "agent", text: getNextDummyReply() },
      ]);
    }, 500);
  };

  const handleTakePhoto = async () => {
    setPhotoSheetOpen(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Camera permission needed",
        "Allow camera access to take a photo."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled) {
      addPhotoMessage(result.assets[0].uri);
    }
  };

  const handleChooseFromLibrary = async () => {
    setPhotoSheetOpen(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo library permission needed",
        "Allow photo access to choose an image."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled) {
      addPhotoMessage(result.assets[0].uri);
    }
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
              <Icon xml={MENU_SVG} size={26} />
            </Pressable>
          ),
          headerTitle: () => (
            <View className="flex-row items-center gap-2">
              <Icon xml={CHEF_SVG} size={30} />
              <Text className="text-lg font-bold text-text-main">MyMeal</Text>
            </View>
          ),
          headerRight: () => (
            <View className="flex-row items-center gap-4 pr-1">
              <Pressable onPress={handleNewChat} hitSlop={12}>
                <Icon xml={EDIT_SVG} size={22} />
              </Pressable>
              <Pressable onPress={() => setSettingsOpen(true)} hitSlop={12}>
                <Icon xml={SETTINGS_SVG} size={22} />
              </Pressable>
            </View>
          ),
        }}
      />

      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <ChatBackground />
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={
            Platform.OS === "android" ? { paddingBottom: keyboardHeight } : null
          }
        >
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
                <View className="self-end bg-primary rounded-2xl px-4 py-3 mb-3 max-w-[85%]">
                  {item.imageUri ? (
                    <Image
                      source={{ uri: item.imageUri }}
                      className="w-48 h-48 rounded-xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-white text-base">{item.text}</Text>
                  )}
                </View>
              ) : (
                <View className="flex-row items-start gap-2 mb-3 max-w-[85%] self-start">
                  <Icon xml={CHEF_SVG} size={28} />
                  <View className="flex-1 bg-surface border border-black/5 rounded-2xl px-4 py-3">
                    <Text className="text-text-main text-base">
                      {item.text}
                    </Text>
                  </View>
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
                disableFullscreenUI
              />
              <View className="absolute right-1 bottom-1 flex-row gap-1">
                <Pressable
                  onPress={() => setPhotoSheetOpen(true)}
                  hitSlop={8}
                  className="w-9 h-9 items-center justify-center rounded-full active:opacity-70"
                >
                  <Icon xml={CAMERA_SVG} size={20} />
                </Pressable>
                <Pressable
                  hitSlop={8}
                  className="w-9 h-9 items-center justify-center rounded-full active:opacity-70"
                >
                  <Icon xml={MIC_SVG} size={20} />
                </Pressable>
              </View>
            </View>

            {/* send.svg already includes the filled circle + arrow, so no
              extra background styling is applied here. */}
            <Pressable onPress={handleSend} className="active:opacity-80">
              <Icon xml={SEND_SVG} size={44} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
      <PhotoSourceSheet
        visible={photoSheetOpen}
        onClose={() => setPhotoSheetOpen(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromLibrary={handleChooseFromLibrary}
      />
    </>
  );
}
