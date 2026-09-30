import { Stack } from "expo-router";

import "@/global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFF8F0" },
        headerTintColor: "#2B2320",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "MyMeal",
          headerTitleStyle: { fontWeight: "700", color: "#2B2320" },
        }}
      />
    </Stack>
  );
}
