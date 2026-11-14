import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { colors } from "@/theme";

const WIDTH = 160;
const HEIGHT = 70;

type GooseMarkProps = {
  scale?: number;
  phase?: number;
  still?: boolean;
};

export function GooseMark({ scale = 1, phase = 0, still = false }: GooseMarkProps) {
  const flap = useSharedValue(0.4);

  useEffect(() => {
    if (still) {
      flap.value = 0.4;
      return;
    }
    flap.value = 0;
    flap.value = withRepeat(
      withTiming(1, {
        duration: 1200 + phase * 160,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [flap, phase, still]);

  const wingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(flap.value, [0, 1], [-14, 10])}deg` }],
  }));

  const frame = { width: WIDTH * scale, height: HEIGHT * scale };

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={frame}>
      <Animated.View style={[frame, { position: "absolute", left: 0, top: 0, transformOrigin: "49% 46%" }, wingStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 160 70">
          <Path d="M78 32C60 16 36 8 18 16 30 20 52 28 80 36Z" fill="#8C6840" />
        </Svg>
      </Animated.View>
      <Svg width="100%" height="100%" viewBox="0 0 160 70">
        <Path
          d="M6 38C12 32 20 34 26 40 24 32 44 28 68 30 82 31 96 28 106 26 120 16 138 10 150 14 156 16 154 22 148 24 134 26 120 30 110 34 102 46 80 54 54 50 34 46 18 48 12 44 8 42 4 40 6 38Z"
          fill={colors.ink}
        />
        <Path d="M148 15 160 17 148 23Z" fill={colors.gold} />
      </Svg>
    </View>
  );
}
