import { Image, type ImageSource } from "expo-image";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import {
  GestureDetector,
  GestureStateManager,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type ZoomablePlateProps = {
  source: ImageSource;
  label: string;
  active: boolean;
  testID?: string;
  onZoomChange?: (zoomed: boolean) => void;
};

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(max, Math.max(min, value));
}

export function ZoomablePlate({
  source,
  label,
  active,
  testID,
  onZoomChange,
}: ZoomablePlateProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const layoutW = useSharedValue(0);
  const layoutH = useSharedValue(0);

  const report = (zoomed: boolean) => {
    onZoomChange?.(zoomed);
  };

  const contain = () => {
    "worklet";
    const maxX = Math.max(0, ((scale.value - 1) * layoutW.value) / 2);
    const maxY = Math.max(0, ((scale.value - 1) * layoutH.value) / 2);
    translateX.value = clamp(translateX.value, -maxX, maxX);
    translateY.value = clamp(translateY.value, -maxY, maxY);
  };

  const reset = () => {
    "worklet";
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedScale.value = 1;
    if (onZoomChange) runOnJS(report)(false);
  };

  useEffect(() => {
    if (active) return;
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    onZoomChange?.(false);
  }, [active, onZoomChange, savedScale, scale, translateX, translateY]);

  const pinch = usePinchGesture({
    onUpdate: (event) => {
      "worklet";
      scale.value = clamp(savedScale.value * event.scale, 1, 4);
      contain();
    },
    onFinalize: (event) => {
      "worklet";
      if (event.canceled) return;
      if (scale.value <= 1.04) {
        reset();
        return;
      }
      savedScale.value = scale.value;
      contain();
      if (onZoomChange) runOnJS(report)(true);
    },
  });

  const pan = usePanGesture({
    manualActivation: true,
    onTouchesMove: (event) => {
      "worklet";
      if (scale.value > 1.04) GestureStateManager.activate(event.handlerTag);
      else GestureStateManager.fail(event.handlerTag);
    },
    onBegin: () => {
      "worklet";
      originX.value = translateX.value;
      originY.value = translateY.value;
    },
    onUpdate: (event) => {
      "worklet";
      translateX.value = originX.value + event.translationX;
      translateY.value = originY.value + event.translationY;
      contain();
    },
  });

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onFinalize: (event) => {
      "worklet";
      if (event.canceled) return;
      if (scale.value > 1.04) {
        reset();
        return;
      }
      scale.value = withTiming(2.4);
      savedScale.value = 2.4;
      if (onZoomChange) runOnJS(report)(true);
    },
  });

  const gesture = useSimultaneousGestures(pinch, pan, doubleTap);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        onLayout={(event) => {
          layoutW.value = event.nativeEvent.layout.width;
          layoutH.value = event.nativeEvent.layout.height;
        }}
        style={[styles.frame, animatedStyle]}
      >
        <Image
          accessibilityLabel={label}
          contentFit="contain"
          source={source}
          style={styles.image}
          testID={testID}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
