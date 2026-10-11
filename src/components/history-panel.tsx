import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { DUMMY_CHATS, type DummyChat } from "@/data/dummy-chats";
import { EDIT_SVG } from "@/theme/svg-icons";

interface HistoryPanelProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (chat: DummyChat) => void;
  onNewChat: () => void;
}

// Half-width overlay sliding in from the left, on top of the current
// chat (not a full screen navigation) - equivalent to ChatGPT's chat
// history sidebar.
export function HistoryPanel({
  visible,
  onClose,
  onSelect,
  onNewChat,
}: HistoryPanelProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        <SafeAreaView className="w-1/2 bg-background border-r border-black/5">
          <Text className="text-lg font-semibold text-text-main px-5 pt-4 pb-3">
            Previous Recipes
          </Text>

          <Pressable
            onPress={onNewChat}
            className="flex-row items-center gap-2 mx-3 mb-2 px-3 py-3 rounded-xl active:bg-black/5"
          >
            <Icon xml={EDIT_SVG} size={20} />
            <Text className="text-text-main text-base font-medium">
              New chat
            </Text>
          </Pressable>

          <FlatList
            data={DUMMY_CHATS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                className="px-3 py-3 rounded-xl active:bg-black/5"
              >
                <Text className="text-text-main text-base">{item.title}</Text>
              </Pressable>
            )}
          />
        </SafeAreaView>

        {/* Tapping the dimmed remainder of the screen closes the panel. */}
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      </View>
    </Modal>
  );
}
