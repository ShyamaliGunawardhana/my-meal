import { Image, StyleSheet, useWindowDimensions, View } from "react-native";

const PORTRAIT_BG = require("@/assets/images/chat-background-portrait.png");
const LANDSCAPE_BG = require("@/assets/images/chat-background-landscape.png");

// Two purpose-made, high-resolution pieces of artwork - a tall one
// composed for portrait phones and a wide one composed for
// landscape/tablet - picked at runtime from the actual screen
// dimensions, so the corner decorations never get cropped away on
// either orientation.
// The Image must live inside a fill wrapper with explicit 100%
// width/height - `absoluteFill` on the Image itself does not size it
// correctly on web (it renders at intrinsic pixel size instead).
export function ChatBackground() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}>
      <Image
        source={isLandscape ? LANDSCAPE_BG : PORTRAIT_BG}
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}
