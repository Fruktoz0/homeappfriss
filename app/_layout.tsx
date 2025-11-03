import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { appTheme } from "../constants/theme";
import { BudgetProvider } from "../contexts/BudgetContext";
import { getToken } from "../services/authService";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const inAuthGroup = segments[0] === "(auth)";

      if (!token && !inAuthGroup) router.replace("/(auth)/login");
      if (token && inAuthGroup) router.replace("/(tabs)");

      setReady(true);
      SplashScreen.hideAsync();
    })();
  }, [segments]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={appTheme}>
        <BudgetProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: appTheme.colors.background },
            }}
          />
        </BudgetProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
