import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

// Returns the on-screen keyboard's height in px (0 when hidden).
// Needed because edge-to-edge (default on Android in Expo SDK 54)
// means the window never resizes for the keyboard, so screens have to
// pad their own content by this amount instead of relying on
// adjustResize or KeyboardAvoidingView.
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) =>
      setHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setHeight(0)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
