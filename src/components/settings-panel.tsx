import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
}

const DUMMY_DIET_OPTIONS = ["None", "Vegetarian", "Vegan"];
const DUMMY_SELECTED_DIET = "Vegetarian";

// Hardcoded starting list for the UI design only - not read from or
// saved to expo-secure-store yet. Free text, not a fixed checklist:
// the user must be able to add any allergy, not just pick from a
// predefined set (same reasoning as pantry input).
const DUMMY_ALLERGIES = ["Peanuts", "Gluten"];

function AllergiesScreen({ onClose }: { onClose: () => void }) {
  const [allergies, setAllergies] = useState(DUMMY_ALLERGIES);
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed || allergies.includes(trimmed)) return;
    setAllergies((current) => [...current, trimmed]);
    setDraft("");
  };

  const handleRemove = (allergy: string) => {
    setAllergies((current) => current.filter((item) => item !== allergy));
  };

  return (
    <Modal
      visible
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center px-4 pt-2 pb-3">
          <Pressable onPress={onClose} hitSlop={12} className="pr-2">
            <Ionicons name="chevron-back" size={24} color="#24332B" />
          </Pressable>
          <Text className="text-lg font-semibold text-text-main">
            Allergies
          </Text>
        </View>

        <ScrollView className="flex-1 px-4">
          {allergies.length === 0 && (
            <Text className="text-text-main/60 text-center mt-8">
              No allergies added yet.
            </Text>
          )}
          {allergies.map((allergy) => (
            <View
              key={allergy}
              className="flex-row items-center justify-between bg-surface rounded-xl px-4 py-3 mb-2 border border-black/5"
            >
              <Text className="text-text-main text-base">{allergy}</Text>
              <Pressable onPress={() => handleRemove(allergy)} hitSlop={12}>
                <Ionicons name="close" size={20} color="#B42318" />
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <View className="flex-row gap-2 px-4 pb-4 pt-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={handleAdd}
            placeholder="Type any allergy (e.g. shellfish)"
            className="flex-1 bg-surface rounded-xl px-4 py-3 text-base text-text-main border border-black/5"
            returnKeyType="done"
          />
          <Pressable
            onPress={handleAdd}
            className="bg-primary rounded-xl px-5 items-center justify-center active:opacity-80"
          >
            <Text className="text-white font-semibold">Add</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// Half-width overlay sliding in from the right, on top of the current
// chat (not a full screen navigation).
export function SettingsPanel({ visible, onClose }: SettingsPanelProps) {
  const [diet, setDiet] = useState(DUMMY_SELECTED_DIET);
  const [allergiesOpen, setAllergiesOpen] = useState(false);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 flex-row">
          {/* Tapping the dimmed remainder of the screen closes the panel. */}
          <Pressable className="flex-1 bg-black/40" onPress={onClose} />

          <SafeAreaView className="w-1/2 bg-background border-l border-black/5">
            <Text className="text-lg font-semibold text-text-main px-5 pt-4 pb-3">
              Settings
            </Text>

            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 24,
              }}
            >
              <Pressable
                onPress={() => setAllergiesOpen(true)}
                className="flex-row items-center justify-between bg-surface rounded-xl px-4 py-3 mb-6 active:opacity-80"
              >
                <Text className="text-text-main text-base">Allergies</Text>
                <Ionicons name="chevron-forward" size={18} color="#24332B" />
              </Pressable>

              <Text className="text-xs font-semibold uppercase text-text-main/50 mb-2">
                Dietary preference
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {DUMMY_DIET_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setDiet(option)}
                    className={`px-4 py-2 rounded-full border ${
                      diet === option
                        ? "bg-primary border-primary"
                        : "bg-surface border-black/10"
                    }`}
                  >
                    <Text
                      className={
                        diet === option ? "text-white" : "text-text-main"
                      }
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="text-xs font-semibold uppercase text-text-main/50 mb-2">
                About
              </Text>
              <View className="bg-surface rounded-xl px-4 py-3">
                <Text className="text-text-main text-base">MyMeal</Text>
                <Text className="text-text-main/50 text-sm mt-1">
                  Version 1.0.0
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {allergiesOpen && (
        <AllergiesScreen onClose={() => setAllergiesOpen(false)} />
      )}
    </>
  );
}
