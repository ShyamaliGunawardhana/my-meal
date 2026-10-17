import { Modal, Pressable, Text, View } from "react-native";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Small centered confirmation modal. Custom rather than Alert.alert -
// on Android Alert reassigns buttons to fixed roles by array position,
// which produced a wrong visual order once already in this project.
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-8">
        <View className="bg-surface rounded-2xl px-5 py-4 w-full max-w-sm">
          <Text className="text-text-main font-semibold text-lg">
            {title}
          </Text>
          <Text className="text-text-main/70 text-base mt-2">
            {message}
          </Text>
          <View className="flex-row justify-end gap-3 mt-5">
            <Pressable
              onPress={onCancel}
              className="px-4 py-2 rounded-xl active:bg-black/5"
            >
              <Text className="text-text-main font-semibold">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className="bg-primary rounded-xl px-4 py-2 active:opacity-80"
            >
              <Text className="text-white font-semibold">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
