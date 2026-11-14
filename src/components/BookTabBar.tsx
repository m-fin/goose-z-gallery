import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/theme";

const LABELS: Record<string, string> = {
  index: "Table",
  plates: "Plates",
  launch: "The V",
  kept: "Kept",
};

export function BookTabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = LABELS[route.name] ?? route.name;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const event = emitter.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigateToTab(route.key);
              }
            }}
            style={styles.tab}
            testID={`tab-${route.name}`}
          >
            <Text style={[styles.label, focused && styles.labelOn]}>{label}</Text>
            <View style={[styles.mark, focused && styles.markOn]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.ivory,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 13,
    letterSpacing: 1.1,
    color: colors.inkSoft,
  },
  labelOn: {
    color: colors.goldDeep,
  },
  mark: {
    width: 14,
    height: 1,
    backgroundColor: "transparent",
  },
  markOn: {
    backgroundColor: colors.gold,
  },
});
