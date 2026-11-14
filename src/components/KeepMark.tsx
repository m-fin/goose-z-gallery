import { Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useKept } from "@/lib/kept";
import { colors } from "@/theme";

type KeepMarkProps = {
  plateId: string;
};

export function KeepMark({ plateId }: KeepMarkProps) {
  const kept = useKept();
  const on = kept.has(plateId);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={on ? "Kept" : "Keep this plate"}
      accessibilityState={{ selected: on }}
      hitSlop={12}
      onPress={() => kept.toggle(plateId)}
      testID={`keep-${plateId}`}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path
          d="M12 19.2C7.2 16 4.2 13.3 4.2 9.8 4.2 7.5 5.9 5.8 8.2 5.8c1.3 0 2.5.7 3.8 2 1.3-1.3 2.5-2 3.8-2 2.3 0 4 1.7 4 4 0 3.5-3 6.2-7.8 9.4Z"
          fill={on ? colors.gold : "transparent"}
          stroke={colors.goldDeep}
          strokeWidth={1.15}
        />
      </Svg>
    </Pressable>
  );
}
