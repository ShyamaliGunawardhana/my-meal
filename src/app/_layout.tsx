import { Stack } from "expo-router";

import "@/global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFF4E5" },
        headerTintColor: "#24332B",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "MyMeal",
          headerTitleStyle: { fontWeight: "700", color: "#24332B" },
        }}
      />
    </Stack>
  );
}
