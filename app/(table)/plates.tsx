import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeepMark } from "@/components/KeepMark";
import { ZoomablePlate } from "@/components/ZoomablePlate";
import { plates, type Plate } from "@/data/plates";
import { colors, fonts } from "@/theme";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function PlatesScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const plateId = firstParam(params.id);
  const listRef = useRef<FlatList<Plate>>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(() => {
    const found = plates.findIndex((plate) => plate.id === plateId);
    return found >= 0 ? found : 0;
  });
  const [zoomed, setZoomed] = useState(false);
  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    if (!plateId) return;
    const next = plates.findIndex((plate) => plate.id === plateId);
    if (next < 0) return;
    indexRef.current = next;
    setIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: false });
  }, [plateId]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next < 0 || next >= plates.length || next === indexRef.current) return;
    indexRef.current = next;
    setIndex(next);
    setZoomed(false);
  };

  const plate = plates[index];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View
        style={styles.list}
        onLayout={(event) => setListHeight(event.nativeEvent.layout.height)}
      >
      <FlatList
        ref={listRef}
        data={plates}
        extraData={`${index}:${zoomed}:${listHeight}`}
        getItemLayout={(_, itemIndex) => ({
          length: width,
          offset: width * itemIndex,
          index: itemIndex,
        })}
        horizontal
        initialNumToRender={2}
        initialScrollIndex={index}
        key={width}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index: info.index, animated: false });
          }, 50);
        }}
        pagingEnabled
        renderItem={({ item, index: itemIndex }) => (
          <View style={{ width, height: listHeight }}>
            <ZoomablePlate
              active={itemIndex === index}
              label={`${item.title}. ${item.caption}`}
              onZoomChange={(next) => {
                if (itemIndex === indexRef.current) setZoomed(next);
              }}
              source={item.source}
              testID={`plate-${item.id}`}
            />
          </View>
        )}
        scrollEnabled={!zoomed}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      />
      </View>
      {plate ? (
        <View style={styles.caption}>
          <View style={styles.captionHead}>
            <Text style={styles.kicker}>{plate.kicker}</Text>
            <View style={styles.captionTools}>
              <Text style={styles.count}>
                {index + 1} / {plates.length}
              </Text>
              <KeepMark plateId={plate.id} />
            </View>
          </View>
          <Text style={styles.line}>{plate.caption}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  list: {
    flex: 1,
  },
  caption: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 6,
    backgroundColor: colors.ivory,
  },
  captionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  captionTools: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  kicker: {
    fontFamily: fonts.regular,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: colors.goldDeep,
  },
  count: {
    fontFamily: fonts.regular,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.inkSoft,
  },
  line: {
    fontFamily: fonts.italic,
    fontSize: 20,
    lineHeight: 27,
    color: colors.ink,
  },
});
