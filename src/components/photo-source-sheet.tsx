import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { CAMERA_SVG } from "@/theme/svg-icons";

interface PhotoSourceSheetProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromLibrary: () => void;
}

// No custom asset provided for a "gallery/library" glyph - this one
// stays an Ionicon, recolored to match (see tailwind.config.js `primary`
// / decisions.md).
const iconColor = "#2E7D5B";

// Custom bottom sheet instead of Alert.alert - gives exact control over
// option order on both platforms. Android's native Alert reassigns
// button positions (positive/negative/neutral) regardless of array
// order, which produced a confusing, unintended button order.
export function PhotoSourceSheet({
  visible,
  onClose,
  onTakePhoto,
  onChooseFromLibrary,
}: PhotoSourceSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable onPress={(event) => event.stopPropagation()}>
          <SafeAreaView
            edges={["bottom"]}
            className="bg-background rounded-t-3xl px-4 pt-5"
          >
            <Text className="text-lg font-semibold text-text-main text-center">
              Add a photo
            </Text>
            <Text className="text-text-main/60 text-center mb-4">
              Show your ingredients to MyMeal
            </Text>

            <Pressable
              onPress={onTakePhoto}
              className="flex-row items-center gap-3 bg-surface rounded-xl px-4 py-4 mb-2 active:opacity-80"
            >
              <Icon xml={CAMERA_SVG} size={22} />
              <Text className="text-text-main text-base">Take Photo</Text>
            </Pressable>

            <Pressable
              onPress={onChooseFromLibrary}
              className="flex-row items-center gap-3 bg-surface rounded-xl px-4 py-4 mb-4 active:opacity-80"
            >
              <Ionicons name="images-outline" size={22} color={iconColor} />
              <Text className="text-text-main text-base">
                Choose from Library
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              className="items-center justify-center bg-surface rounded-xl px-4 py-4 mb-2 active:opacity-80"
            >
              {/* Neutral, not `danger` red - cancelling isn't an error. */}
              <Text className="text-text-main font-semibold text-base">
                Cancel
              </Text>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
