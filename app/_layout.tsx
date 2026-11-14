import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
  EBGaramond_500Medium_Italic,
} from "@expo-google-fonts/eb-garamond";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { KeptProvider } from "@/lib/kept";
import { MorningProvider, readPlateId } from "@/lib/morning";
import { colors } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 700, fade: true });
SystemUI.setBackgroundColorAsync(colors.ivory).catch(() => {});

export default function RootLayout() {
  const router = useRouter();
  const [loaded, fontError] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium,
    EBGaramond_500Medium_Italic,
  });

  useEffect(() => {
    if (loaded || fontError) SplashScreen.hide();
  }, [fontError, loaded]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const plateId = readPlateId(response.notification.request.content.data);
      if (!plateId) return;
      router.push({ pathname: "/plates", params: { id: plateId } });
    });
    return () => subscription.remove();
  }, [router]);

  if (!loaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <KeptProvider>
        <MorningProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.ivory },
            }}
          >
            <Stack.Screen name="(table)" />
            <Stack.Screen name="book" options={{ presentation: "modal" }} />
          </Stack>
        </MorningProvider>
      </KeptProvider>
    </GestureHandlerRootView>
  );
}
