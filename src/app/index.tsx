import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatBackground } from "@/components/chat-background";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  CookingModeScreen,
  type CookingExchange,
} from "@/components/cooking-mode-screen";
import { HistoryPanel } from "@/components/history-panel";
import { Icon } from "@/components/icon";
import { IngredientReviewCard } from "@/components/ingredient-review-card";
import { PhotoSourceSheet } from "@/components/photo-source-sheet";
import { RecipeSuggestionsCard } from "@/components/recipe-suggestions-card";
import { SettingsPanel } from "@/components/settings-panel";
import { DUMMY_CHATS, type DummyChat } from "@/data/dummy-chats";
import { suggestRecipes } from "@/data/dummy-recipes";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { isAllergen } from "@/lib/allergy";
import { useProfileStore } from "@/state/profile";
import {
  CAMERA_SVG,
  CHEF_SVG,
  EDIT_SVG,
  MENU_SVG,
  MIC_SVG,
  SEND_SVG,
  SETTINGS_SVG,
} from "@/theme/svg-icons";
import type {
  ChatMessage,
  IngredientEntry,
  RecipeSuggestion,
} from "@/types/chat";

// Picks a short title for a saved chat: the recipe name from the first
// agent reply when it leads with one ("Garlic Butter Rice: ..."), else a
// truncated first user message, else a generic label.
function deriveChatTitle(messages: ChatMessage[]): string {
  const firstRecipe = messages.find(
    (m) => m.kind === "recipes" && m.recipes && m.recipes.length > 0
  )?.recipes?.[0];
  if (firstRecipe) return firstRecipe.title;
  const firstText = messages.find((m) => m.text)?.text.trim();
  if (!firstText) return "Saved chat";
  return firstText.length > 40 ? `${firstText.slice(0, 40)}…` : firstText;
}

// Opening message every new chat starts with - introduces the flow so
// the first screen is never empty.
const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "agent",
  text: "Welcome to MyMeal! Tell me what ingredients you have - text, camera, or mic - then tap Proceed to confirm the list and get recipe ideas.",
};

// Always a fresh session - no persisted state is read here, so closing
// and reopening the app starts a new recipe chat, same as opening
// "New chat" would.
export default function NewRecipeChatScreen() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { ...WELCOME_MESSAGE },
  ]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const keyboardHeight = useKeyboardHeight();
  const [chats, setChats] = useState<DummyChat[]>(DUMMY_CHATS);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatDirty, setChatDirty] = useState(false);
  const [pendingIngredients, setPendingIngredients] = useState<
    IngredientEntry[]
  >([]);
  const inputRef = useRef<TextInput>(null);
  // Set once a recipe tile is tapped - locks recipe selection, the
  // add-ingredients affordances, and the input row for the rest of the
  // chat.
  const [recipeSelectedId, setRecipeSelectedId] = useState<string | null>(null);
  // Title of the selected recipe, shown in the hands-free cooking
  // screen header.
  const [recipeSelectedTitle, setRecipeSelectedTitle] = useState<string | null>(
    null
  );
  // The recipes message that is "live" - its tiles accept taps, and
  // once it holds a selection it carries the Change recipe button.
  // Older recipes messages stay frozen in history.
  const [activeRecipesMessageId, setActiveRecipesMessageId] = useState<
    string | null
  >(null);
  // Recipes message id pending a change-confirmation dialog.
  const [changeSourceId, setChangeSourceId] = useState<string | null>(null);
  const [cookingModeOpen, setCookingModeOpen] = useState(false);

  const listRef = useRef<FlatList<ChatMessage>>(null);

  // On-device text-to-speech for reading agent messages aloud.
  const {
    speakingId,
    speak: speakMessage,
    stop: stopMessageSpeech,
  } = useTextToSpeech();

  // On-device speech-to-text for the mic button - live-updates the
  // chat draft as the user talks, same as typing.
  const {
    listening: micListening,
    start: startMic,
    stop: stopMic,
  } = useSpeechToText({
    onResult: (text) => setDraft(text),
  });

  const handleMicPress = () => {
    if (micListening) {
      stopMic();
    } else {
      setDraft("");
      startMic();
    }
  };

  // Always keep the latest content in view - onContentSizeChange alone
  // proved unreliable, so any messages change defers a scrollToEnd
  // until after the new items have laid out.
  useEffect(() => {
    const timer = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      100
    );
    return () => clearTimeout(timer);
  }, [messages]);

  // If an ingredient review card is still open (unconfirmed), freeze it
  // and hand its items back so they merge into the next pending batch.
  const supersedeOpenReview = (): IngredientEntry[] => {
    const openReview = messages.find(
      (m) => m.kind === "ingredients" && !m.confirmed && !m.superseded
    );
    if (!openReview) return [];
    setMessages((current) =>
      current.map((m) =>
        m.id === openReview.id ? { ...m, superseded: true } : m
      )
    );
    return openReview.ingredients ?? [];
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      { id: Date.now().toString(), role: "user", text: trimmed },
    ]);
    setDraft("");
    setChatDirty(true);

    // After a recipe is picked the input stays live for normal chat
    // (questions, follow-ups) - it just no longer feeds the
    // ingredient-collection flow.
    if (recipeSelectedId) return;

    // Each comma-separated piece of the message becomes one ingredient.
    // Nothing is replied to here - messages accumulate until the user
    // taps Proceed and confirms the collected list.
    const carried = supersedeOpenReview();
    const now = Date.now();
    const names = trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    setPendingIngredients((current) => [
      ...current,
      ...carried,
      ...names.map((name, index) => ({
        id: `${now}-ing-${index}`,
        name,
      })),
    ]);
  };

  const addPhotoMessage = (uri: string) => {
    setMessages((current) => [
      ...current,
      { id: Date.now().toString(), role: "user", text: "", imageUri: uri },
    ]);
    setChatDirty(true);

    // After a recipe is picked, photos are ordinary chat attachments,
    // not ingredient input.
    if (recipeSelectedId) return;

    // Real ingredient recognition from the photo comes with the Gemini
    // vision milestone - for now each photo contributes one labelled
    // placeholder item.
    const carried = supersedeOpenReview();
    setPendingIngredients((current) => [
      ...current,
      ...carried,
      {
        id: `${Date.now()}-photo`,
        name: `Photo item ${
          current.filter((item) => item.name.startsWith("Photo item")).length +
          1
        }`,
      },
    ]);
  };

  // Posts the collected ingredients as a confirmation card. Only one
  // unconfirmed card can exist at a time.
  const handleProceed = () => {
    if (pendingIngredients.length === 0) return;
    if (
      messages.some(
        (m) => m.kind === "ingredients" && !m.confirmed && !m.superseded
      )
    ) {
      return;
    }
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-review`,
        role: "agent",
        text: "",
        kind: "ingredients",
        ingredients: pendingIngredients,
        confirmed: false,
      },
    ]);
    setPendingIngredients([]);
    setChatDirty(true);
  };

  const handleRemoveIngredient = (messageId: string, ingredientId: string) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId
          ? {
              ...message,
              ingredients: (message.ingredients ?? []).filter(
                (item) => item.id !== ingredientId
              ),
            }
          : message
      )
    );
  };

  // Locks the review card and posts the recipe tiles built only from
  // the ingredients that survived - allergy-flagged items never reach
  // the suggestion step.
  const handleConfirmIngredients = (messageId: string) => {
    const review = messages.find((m) => m.id === messageId);
    if (!review || review.confirmed) return;

    const { allergies } = useProfileStore.getState();
    const usable = (review.ingredients ?? []).filter(
      (item) => !isAllergen(item.name, allergies)
    );
    const usableNames = usable.map((item) => item.name);
    const recipes = suggestRecipes(usableNames).map((recipe, index) => ({
      ...recipe,
      id: `${messageId}-r${index}`,
    }));

    const recipesMessageId = `${messageId}-recipes`;
    setMessages((current) => [
      ...current.map((message) =>
        message.id === messageId ? { ...message, confirmed: true } : message
      ),
      {
        id: recipesMessageId,
        role: "agent",
        text: "",
        kind: "recipes",
        recipes,
        basedOn: usableNames,
      },
    ]);
    setActiveRecipesMessageId(recipesMessageId);
    setChatDirty(true);
  };

  // Tapping a recipe tile posts the recipe as a regular agent message
  // and locks the whole ingredient/recipe flow - the choice is final
  // for this chat. A full recipe detail screen comes with the real
  // recipe model.
  const handleSelectRecipe = (recipe: RecipeSuggestion) => {
    if (recipeSelectedId) return;
    setRecipeSelectedId(recipe.id);
    setRecipeSelectedTitle(recipe.title);
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-recipe`,
        role: "agent",
        text: `You picked ${recipe.title}: ${recipe.description}`,
      },
    ]);
    setChatDirty(true);
  };

  // "Change recipe" confirmed - posts a fresh suggestions card with the
  // same list at the end of the chat and moves control to it. History
  // is untouched: the old card stays visible but frozen.
  const handleConfirmChangeRecipe = () => {
    const source = messages.find((m) => m.id === changeSourceId);
    setChangeSourceId(null);
    if (!source || !source.recipes) return;

    const newMessageId = `${Date.now()}-recipes`;
    setMessages((current) => [
      ...current,
      {
        id: newMessageId,
        role: "agent",
        text: "",
        kind: "recipes",
        recipes: source.recipes!.map((recipe, index) => ({
          ...recipe,
          id: `${newMessageId}-r${index}`,
        })),
        basedOn: source.basedOn,
      },
    ]);
    setActiveRecipesMessageId(newMessageId);
    setRecipeSelectedId(null);
    setRecipeSelectedTitle(null);
    setChatDirty(true);
  };

  // Hands-free cooking Q&A turns are appended to the main chat so the
  // conversation stays complete even though the mode is an overlay.
  const handleCookingExchange = ({ question, answer }: CookingExchange) => {
    const now = Date.now();
    setMessages((current) => [
      ...current,
      { id: `${now}-cook-q`, role: "user", text: question },
      { id: `${now}-cook-a`, role: "agent", text: answer },
    ]);
    setChatDirty(true);
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
    setPendingIngredients([]);
    setCurrentChatId(chat.id);
    setRecipeSelectedId(null);
    setRecipeSelectedTitle(null);
    setActiveRecipesMessageId(null);
    setChangeSourceId(null);
    setChatDirty(false);
    setHistoryOpen(false);
  };

  const handleNewChat = () => {
    setMessages([{ ...WELCOME_MESSAGE }]);
    setPendingIngredients([]);
    setDraft("");
    setCurrentChatId(null);
    setRecipeSelectedId(null);
    setRecipeSelectedTitle(null);
    setActiveRecipesMessageId(null);
    setChangeSourceId(null);
    setChatDirty(false);
    setHistoryOpen(false);
  };

  // Saves the current conversation into the History list. A chat that was
  // loaded from history (or already saved) is updated in place; a fresh
  // chat gets a new entry, so pressing save repeatedly never duplicates.
  const hasUserMessages = messages.some((m) => m.role === "user");

  const handleSaveChat = () => {
    if (!hasUserMessages) return;

    if (currentChatId) {
      setChats((current) =>
        current.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages } : chat
        )
      );
    } else {
      const id = Date.now().toString();
      setChats((current) => [
        { id, title: deriveChatTitle(messages), messages },
        ...current,
      ]);
      setCurrentChatId(id);
    }
    setChatDirty(false);
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
              {/* No save/bookmark icon exists in the provided asset set -
                Ionicons bookmark recolored to primary, same precedent as
                the gallery glyph in the photo sheet. Filled = saved. */}
              <Pressable
                onPress={handleSaveChat}
                hitSlop={12}
                className={!hasUserMessages ? "opacity-40" : undefined}
              >
                <Ionicons
                  name={
                    !chatDirty && currentChatId
                      ? "bookmark"
                      : "bookmark-outline"
                  }
                  size={22}
                  color="#2E7D5B"
                />
              </Pressable>
              <Pressable onPress={() => setSettingsOpen(true)} hitSlop={12}>
                <Icon xml={SETTINGS_SVG} size={22} />
              </Pressable>
            </View>
          ),
        }}
      />

      <SafeAreaView className="flex-1 bg-surface" edges={["bottom"]}>
        {/* Background artwork temporarily disabled - plain surface canvas
          for now while the bubble/button color hierarchy is settled. */}
        {false && <ChatBackground />}
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={
            Platform.OS === "android" ? { paddingBottom: keyboardHeight } : null
          }
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ flexGrow: 1, padding: 20 }}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: true })
            }
            renderItem={({ item }) =>
              item.role === "agent" && item.kind === "ingredients" ? (
                <View className="flex-row items-start gap-2 mb-3 max-w-[85%] self-start">
                  <Icon xml={CHEF_SVG} size={28} />
                  <IngredientReviewCard
                    ingredients={item.ingredients ?? []}
                    confirmed={item.confirmed ?? false}
                    superseded={item.superseded ?? false}
                    onRemove={(ingredientId) =>
                      handleRemoveIngredient(item.id, ingredientId)
                    }
                    onConfirm={() => handleConfirmIngredients(item.id)}
                    onAddMore={() => inputRef.current?.focus()}
                    addMoreDisabled={recipeSelectedId !== null}
                  />
                </View>
              ) : item.role === "agent" && item.kind === "recipes" ? (
                <View className="flex-row items-start gap-2 mb-3 max-w-[85%] self-start">
                  <Icon xml={CHEF_SVG} size={28} />
                  <RecipeSuggestionsCard
                    recipes={item.recipes ?? []}
                    basedOn={item.basedOn}
                    selectedId={recipeSelectedId ?? undefined}
                    interactive={
                      item.id === activeRecipesMessageId &&
                      recipeSelectedId === null
                    }
                    showChange={
                      item.id === activeRecipesMessageId &&
                      recipeSelectedId !== null
                    }
                    onChange={() => setChangeSourceId(item.id)}
                    onSelect={handleSelectRecipe}
                  />
                </View>
              ) : item.role === "user" ? (
                <View className="self-end bg-user-bubble border border-black/5 rounded-2xl px-4 py-3 mb-3 max-w-[85%]">
                  {item.imageUri ? (
                    <Image
                      source={{ uri: item.imageUri }}
                      className="w-48 h-48 rounded-xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-text-main text-base">
                      {item.text}
                    </Text>
                  )}
                </View>
              ) : (
                <View className="flex-row items-start gap-2 mb-3 max-w-[85%] self-start">
                  <Icon xml={CHEF_SVG} size={28} />
                  <View className="flex-1 bg-agent-bubble border border-black/5 rounded-2xl px-4 py-3">
                    <View className="flex-row items-start gap-2">
                      <Text className="text-text-main text-base flex-1">
                        {item.text}
                      </Text>
                      {item.text.length > 0 && recipeSelectedId !== null && (
                        <Pressable
                          onPress={() =>
                            speakingId === item.id
                              ? stopMessageSpeech()
                              : speakMessage(item.id, item.text)
                          }
                          hitSlop={8}
                        >
                          <Ionicons
                            name={
                              speakingId === item.id
                                ? "volume-high"
                                : "volume-medium-outline"
                            }
                            size={18}
                            color="#2E7D5B"
                          />
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              )
            }
          />

          {pendingIngredients.length > 0 &&
            recipeSelectedId === null &&
            !messages.some(
              (m) => m.kind === "ingredients" && !m.confirmed && !m.superseded
            ) && (
              <View className="flex-row items-center justify-between mx-4 mb-2 bg-surface border border-black/10 rounded-2xl px-4 py-2">
                <Text className="text-text-main/70 text-sm">
                  {pendingIngredients.length}{" "}
                  {pendingIngredients.length === 1
                    ? "ingredient"
                    : "ingredients"}{" "}
                  collected
                </Text>
                <Pressable
                  onPress={handleProceed}
                  className="bg-primary rounded-xl px-4 py-2 active:opacity-80"
                >
                  <Text className="text-white font-semibold">Proceed</Text>
                </Pressable>
              </View>
            )}

          {recipeSelectedId !== null && (
            <View className="flex-row items-center justify-between mx-4 mb-2 bg-surface border border-black/10 rounded-2xl px-4 py-2">
              <Text className="text-text-main/70 text-sm">Ready to cook?</Text>
              <Pressable
                onPress={() => setCookingModeOpen(true)}
                className="flex-row items-center gap-1.5 bg-primary rounded-xl px-4 py-2 active:opacity-80"
              >
                <Ionicons name="headset" size={16} color="#FFFFFF" />
                <Text className="text-white font-semibold">
                  Hands-free cooking
                </Text>
              </Pressable>
            </View>
          )}

          <View className="flex-row items-end gap-2 px-4 pb-4">
            <View className="flex-1 relative justify-center">
              <TextInput
                ref={inputRef}
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={handleSend}
                placeholder="What do you have in your kitchen?"
                multiline
                editable
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
                  onPress={handleMicPress}
                  hitSlop={8}
                  className={`w-9 h-9 items-center justify-center rounded-full active:opacity-70 ${
                    micListening ? "bg-danger/15" : ""
                  }`}
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
        chats={chats}
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
      <ConfirmDialog
        visible={changeSourceId !== null}
        title="Change recipe?"
        message="Your current recipe selection will be discontinued."
        confirmLabel="Change recipe"
        onConfirm={handleConfirmChangeRecipe}
        onCancel={() => setChangeSourceId(null)}
      />
      <CookingModeScreen
        visible={cookingModeOpen}
        recipeTitle={recipeSelectedTitle ?? "your recipe"}
        onClose={() => setCookingModeOpen(false)}
        onExchange={handleCookingExchange}
      />
    </>
  );
}
