import { Tabs } from "expo-router";

import { BookTabBar } from "@/components/BookTabBar";

export default function TableLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BookTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Table" }} />
      <Tabs.Screen name="plates" options={{ title: "Plates" }} />
      <Tabs.Screen name="launch" options={{ title: "The V" }} />
      <Tabs.Screen name="kept" options={{ title: "Kept" }} />
    </Tabs>
  );
}
