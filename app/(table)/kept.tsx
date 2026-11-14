import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeepMark } from "@/components/KeepMark";
import { plateById } from "@/data/plates";
import { useKept } from "@/lib/kept";
import { colors, fonts } from "@/theme";

export default function KeptScreen() {
  const insets = useSafeAreaInsets();
  const kept = useKept();
  const saved = kept.ids
    .map((id) => plateById(id))
    .filter((plate): plate is NonNullable<typeof plate> => plate !== undefined);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 22, paddingBottom: 28 },
      ]}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    >
      <Text style={styles.kicker}>Kept</Text>
      {saved.length === 0 ? (
        <Text style={styles.empty}>Nothing kept. The book will wait.</Text>
      ) : (
        <View style={styles.list}>
          {saved.map((plate) => (
            <View key={plate.id} style={styles.item}>
              <Link href={{ pathname: "/plates", params: { id: plate.id } }} asChild>
                <Pressable accessibilityRole="button" style={styles.open}>
                  <Image
                    accessibilityLabel={plate.caption}
                    contentFit="cover"
                    source={plate.source}
                    style={styles.thumb}
                  />
                  <View style={styles.copy}>
                    <Text style={styles.itemKicker}>{plate.kicker}</Text>
                    <Text style={styles.caption}>{plate.caption}</Text>
                  </View>
                </Pressable>
              </Link>
              <KeepMark plateId={plate.id} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    paddingHorizontal: 22,
  },
  kicker: {
    fontFamily: fonts.regular,
    fontSize: 11,
    letterSpacing: 2.8,
    textTransform: "uppercase",
    textAlign: "center",
    color: colors.goldDeep,
    marginBottom: 22,
  },
  empty: {
    fontFamily: fonts.italic,
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
    color: colors.ink,
    marginTop: 48,
    paddingHorizontal: 24,
  },
  list: {
    gap: 22,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  open: {
    flex: 1,
    flexDirection: "row",
    gap: 14,
  },
  thumb: {
    width: 92,
    height: 72,
    backgroundColor: colors.ivoryRaised,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  itemKicker: {
    fontFamily: fonts.regular,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: colors.goldDeep,
  },
  caption: {
    fontFamily: fonts.italic,
    fontSize: 17,
    lineHeight: 23,
    color: colors.ink,
  },
});
