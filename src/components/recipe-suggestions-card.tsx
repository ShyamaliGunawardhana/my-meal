import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { RecipeSuggestion } from "@/types/chat";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/(e)?s$/, "");

interface RecipeSuggestionsCardProps {
  recipes: RecipeSuggestion[];
  // Confirmed ingredient names this card was built from - used to flag
  // optional extras the user doesn't have yet.
  basedOn?: string[];
  // Once a recipe is picked, that tile shows a check and all tiles
  // become non-interactive.
  selectedId?: string;
  // Only the newest card is interactive - older cards are frozen
  // history.
  interactive?: boolean;
  // Show the "Change recipe" button - only on the card holding the
  // current selection.
  showChange?: boolean;
  onChange?: () => void;
  onSelect?: (recipe: RecipeSuggestion) => void;
}

// Ordered recipe tiles posted in the chat after the ingredient list is
// confirmed. Numbered badges give the ranking; tiles are tappable and
// show it (chevron + press feedback). Missing optional extras are
// indicated per tile - they are never presented as blockers.
export function RecipeSuggestionsCard({
  recipes,
  basedOn = [],
  selectedId,
  interactive = false,
  showChange = false,
  onChange,
  onSelect,
}: RecipeSuggestionsCardProps) {
  const have = basedOn.map(normalize);
  const locked = !interactive;

  if (recipes.length === 0) {
    return (
      <View className="flex-1 bg-agent-bubble border border-black/5 rounded-2xl px-4 py-3">
        <Text className="text-text-main text-base">
          No usable ingredients left - add some more and try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-agent-bubble border border-black/5 rounded-2xl px-4 py-3">
      <Text className="text-text-main font-semibold text-base mb-2">
        Suggested recipes
      </Text>
      {recipes.map((recipe, index) => {
        const missingOptional = recipe.optionalExtras.filter(
          (extra) =>
            !have.some((name) => name && extra.toLowerCase().includes(name))
        );
        const selected = recipe.id === selectedId;
        return (
          <Pressable
            key={recipe.id}
            onPress={!locked && onSelect ? () => onSelect(recipe) : undefined}
            className={`flex-row items-start gap-3 border rounded-xl px-3 py-3 mb-2 ${
              selected
                ? "bg-background border-primary"
                : "bg-background border-black/5"
            } ${locked && !selected ? "opacity-50" : "active:bg-black/5"}`}
          >
            <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
              <Text className="text-white text-xs font-bold">{index + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-main font-semibold">
                {recipe.title}
              </Text>
              <Text className="text-text-main/70 text-sm mt-0.5">
                {recipe.description}
              </Text>
              {missingOptional.length > 0 && (
                <View className="flex-row items-center gap-1 mt-1.5">
                  <Ionicons
                    name="add-circle-outline"
                    size={14}
                    color="#24332B"
                  />
                  <Text className="text-text-main/60 text-xs">
                    Nice to have: {missingOptional.join(", ")}
                  </Text>
                </View>
              )}
            </View>
            {selected ? (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#2E7D5B"
                style={{ marginTop: 2 }}
              />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#24332B"
                style={{ marginTop: 2 }}
              />
            )}
          </Pressable>
        );
      })}

      {showChange && onChange && (
        <Pressable
          onPress={onChange}
          className="flex-row items-center justify-center gap-1.5 py-2 active:opacity-70"
        >
          <Ionicons name="swap-horizontal" size={16} color="#2E7D5B" />
          <Text className="text-primary font-semibold text-sm">
            Change recipe
          </Text>
        </Pressable>
      )}
    </View>
  );
}
