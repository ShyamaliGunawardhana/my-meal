import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { isAllergen } from "@/lib/allergy";
import { useProfileStore } from "@/state/profile";
import type { IngredientEntry } from "@/types/chat";

interface IngredientReviewCardProps {
  ingredients: IngredientEntry[];
  confirmed: boolean;
  // The user sent more ingredients while this card was open - it
  // freezes and its items moved back into the pending list.
  superseded?: boolean;
  onRemove: (id: string) => void;
  onConfirm: () => void;
  // Focuses the input so the user can start another batch of
  // ingredients after this card is confirmed.
  onAddMore?: () => void;
  // Disabled once a recipe has been selected - the flow is done.
  addMoreDisabled?: boolean;
}

// Ingredient confirmation card shown in the chat after the user taps
// "Proceed". Every item is individually removable until confirmed.
// Items matching the allergy profile are highlighted and excluded
// automatically - the user does not have to remove them manually.
export function IngredientReviewCard({
  ingredients,
  confirmed,
  superseded = false,
  onRemove,
  onConfirm,
  onAddMore,
  addMoreDisabled = false,
}: IngredientReviewCardProps) {
  const allergies = useProfileStore((state) => state.allergies);
  const flaggedIds = new Set(
    ingredients
      .filter((item) => isAllergen(item.name, allergies))
      .map((item) => item.id)
  );
  const usableCount = ingredients.length - flaggedIds.size;

  return (
    <View className="flex-1 bg-agent-bubble border border-black/5 rounded-2xl px-4 py-3">
      <Text className="text-text-main font-semibold text-base mb-1">
        Confirm your ingredients
      </Text>
      {flaggedIds.size > 0 && (
        <Text className="text-danger text-xs mb-2">
          {flaggedIds.size}{" "}
          {flaggedIds.size === 1 ? "item matches" : "items match"} your allergy
          profile and will be excluded.
        </Text>
      )}

      <View className="flex-row flex-wrap gap-2">
        {ingredients.map((ingredient) => {
          const flagged = flaggedIds.has(ingredient.id);
          return (
            <View
              key={ingredient.id}
              className={`flex-row items-center gap-1.5 rounded-full px-3 py-2 ${
                flagged
                  ? "bg-danger/10 border border-danger/40"
                  : "bg-background border border-black/5"
              }`}
            >
              {flagged && <Ionicons name="warning" size={14} color="#B42318" />}
              <Text
                className={`text-base ${
                  flagged ? "text-danger" : "text-text-main"
                }`}
              >
                {ingredient.name}
              </Text>
              {!confirmed && !superseded && (
                <Pressable onPress={() => onRemove(ingredient.id)} hitSlop={8}>
                  <Ionicons
                    name="close"
                    size={16}
                    color={flagged ? "#B42318" : "#24332B"}
                  />
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      {superseded ? (
        <Text className="text-text-main/50 text-xs mt-1">
          New ingredients added - see the latest list below.
        </Text>
      ) : confirmed ? (
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-text-main/50 text-xs">
            Confirmed - {usableCount} usable{" "}
            {usableCount === 1 ? "ingredient" : "ingredients"}.
          </Text>
          {onAddMore && (
            <Pressable
              onPress={addMoreDisabled ? undefined : onAddMore}
              className={`flex-row items-center gap-1 ${
                addMoreDisabled ? "opacity-40" : "active:opacity-70"
              }`}
            >
              <Ionicons name="add" size={16} color="#2E7D5B" />
              <Text className="text-primary text-sm font-semibold">
                Add ingredients
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable
          onPress={onConfirm}
          className="bg-primary rounded-xl py-3 items-center mt-1 active:opacity-80"
        >
          <Text className="text-white font-semibold">
            Confirm {usableCount}{" "}
            {usableCount === 1 ? "ingredient" : "ingredients"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
