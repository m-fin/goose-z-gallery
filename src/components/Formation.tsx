import { useEffect } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { GooseMark } from "@/components/GooseMark";
import { useReduceMotion } from "@/lib/motion";

const BIRDS = [
  { x: 0.44, y: 0.32, scale: 0.56, phase: 0 },
  { x: 0.28, y: 0.14, scale: 0.46, phase: 0.4 },
  { x: 0.12, y: 0.0, scale: 0.38, phase: 0.85 },
  { x: 0.0, y: 0.0, scale: 0.32, phase: 1.2 },
  { x: 0.28, y: 0.48, scale: 0.46, phase: 0.2 },
  { x: 0.12, y: 0.62, scale: 0.38, phase: 0.7 },
  { x: 0.0, y: 0.72, scale: 0.32, phase: 1.1 },
];

const MINI = [
  { x: 0.42, y: 0.3, scale: 0.32, phase: 0 },
  { x: 0.04, y: 0.0, scale: 0.24, phase: 0.5 },
  { x: 0.02, y: 0.5, scale: 0.24, phase: 0.2 },
];

type FormationProps = {
  style?: StyleProp<ViewStyle>;
  still?: boolean;
  variant?: "full" | "mini";
};

export function Formation({ style, still = false, variant = "full" }: FormationProps) {
  const reduce = useReduceMotion();
  const hold = still || reduce;
  const drift = useSharedValue(0);

  useEffect(() => {
    if (hold) {
      drift.value = 0.5;
      return;
    }
    drift.value = 0;
    drift.value = withRepeat(
      withTiming(1, { duration: 16000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, hold]);

  const driftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(drift.value, [0, 1], [-8, 10]) }],
  }));

  return (
    <View pointerEvents="none" style={[{ flex: 1 }, style]}>
      <Animated.View style={[{ flex: 1 }, driftStyle]}>
        {(variant === "mini" ? MINI : BIRDS).map((bird) => (
          <View
            key={`${bird.x}-${bird.y}`}
            style={{
              position: "absolute",
              left: `${bird.x * 100}%`,
              top: `${bird.y * 100}%`,
            }}
          >
            <GooseMark phase={bird.phase} scale={bird.scale} still={hold} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
