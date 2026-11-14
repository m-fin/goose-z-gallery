import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { Formation } from "@/components/Formation";
import { launchBeats, plateById, plates } from "@/data/plates";
import { useReduceMotion } from "@/lib/motion";
import { colors, fonts } from "@/theme";

export default function LaunchScreen() {
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const [beat, setBeat] = useState(0);
  const opening = launchBeats[0]?.plateId ?? "launch";
  const [underId, setUnderId] = useState(opening);
  const [currentId, setCurrentId] = useState(opening);
  const fade = useSharedValue(1);
  const currentBeat = launchBeats[beat] ?? launchBeats[0];

  useEffect(() => {
    if (reduce) return;
    const timer = setTimeout(() => {
      setBeat((value) => (value + 1) % launchBeats.length);
    }, 7000);
    return () => clearTimeout(timer);
  }, [beat, reduce]);

  useEffect(() => {
    const nextId = launchBeats[beat]?.plateId;
    if (!nextId || nextId === currentId) return;
    setUnderId(currentId);
    setCurrentId(nextId);
    fade.value = 0;
    fade.value = withTiming(1, { duration: 800 });
  }, [beat, currentId, fade]);

  const topStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const under = plateById(underId) ?? plates[0];
  const current = plateById(currentId) ?? plates[0];

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.kicker}>V-launch</Text>
      <View style={styles.sky}>
        <LinearGradient
          colors={["#F7F3EA", "#F4EFE3", "#E8D5B0"]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Formation />
      </View>
      <View style={styles.plate}>
        <Image
          accessibilityLabel={under.caption}
          contentFit="contain"
          source={under.source}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[StyleSheet.absoluteFill, topStyle]}>
          <Image
            accessibilityLabel={current.caption}
            contentFit="contain"
            source={current.source}
            style={styles.fill}
            testID="launch-plate"
          />
        </Animated.View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.beatKicker}>{currentBeat?.kicker}</Text>
        <Text accessibilityLiveRegion="polite" style={styles.caption} testID="launch-caption">
          {currentBeat?.caption}
        </Text>
        <View style={styles.dots}>
          {launchBeats.map((item, dot) => {
            const on = dot === beat;
            return (
              <Pressable
                key={item.kicker}
                accessibilityLabel={item.kicker}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                hitSlop={8}
                onPress={() => setBeat(dot)}
                testID={`beat-${dot}`}
              >
                <View style={[styles.dot, on && styles.dotOn]} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
    paddingHorizontal: 22,
  },
  kicker: {
    fontFamily: fonts.regular,
    fontSize: 11,
    letterSpacing: 2.8,
    textTransform: "uppercase",
    textAlign: "center",
    color: colors.goldDeep,
  },
  sky: {
    height: 220,
    marginTop: 6,
    overflow: "hidden",
  },
  plate: {
    width: "100%",
    aspectRatio: 1.49,
    marginTop: 8,
  },
  fill: {
    width: "100%",
    height: "100%",
  },
  copy: {
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    alignItems: "center",
  },
  beatKicker: {
    fontFamily: fonts.regular,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: colors.goldDeep,
  },
  caption: {
    fontFamily: fonts.italic,
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
    color: colors.ink,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  dotOn: {
    width: 18,
    backgroundColor: colors.gold,
  },
});
