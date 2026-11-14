import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Formation } from "@/components/Formation";
import { KeepMark } from "@/components/KeepMark";
import { plateForDate, formatDay } from "@/lib/day";
import { useMorning } from "@/lib/morning";
import { colors, fonts, type } from "@/theme";

export default function TableScreen() {
  const insets = useSafeAreaInsets();
  const plate = plateForDate(new Date());
  const morning = useMorning();

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: 28 }]}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    >
      <Text style={styles.kicker}>A book for the eyes</Text>
      <Text accessibilityRole="header" style={styles.mark}>
        Z
      </Text>

      <View style={styles.card} testID="goose-of-the-day">
        <Link href={{ pathname: "/plates", params: { id: plate.id } }} asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Open the goose of the day">
            <Image
              accessibilityLabel={plate.caption}
              contentFit="cover"
              source={plate.source}
              style={[styles.cardImage, { aspectRatio: plate.wide ? 1.52 : 0.92 }]}
            />
          </Pressable>
        </Link>
        <View style={styles.cardBody}>
          <View style={styles.cardHead}>
            <Link href={{ pathname: "/plates", params: { id: plate.id } }} asChild>
              <Pressable accessibilityRole="button" style={styles.cardTitles}>
                <Text style={type.kicker}>Goose of the day</Text>
                <Text style={styles.date}>{formatDay(new Date())}</Text>
              </Pressable>
            </Link>
            <KeepMark plateId={plate.id} />
          </View>
          <Text style={styles.cardCaption}>{plate.caption}</Text>
        </View>
      </View>

      <Link href="/launch" asChild>
        <Pressable accessibilityRole="button" style={styles.row} testID="open-launch">
          <View style={styles.flock}>
            <Formation variant="mini" />
          </View>
          <View style={styles.rowCopy}>
            <Text style={type.kicker}>The V</Text>
            <Text style={styles.rowCaption}>Here is the V-launch formation.</Text>
          </View>
        </Pressable>
      </Link>

      <View style={styles.rule} />

      <View style={styles.morning}>
        <View style={styles.rowCopy}>
          <Text style={type.kicker}>Each morning</Text>
          <Text style={styles.rowCaption}>A goose, at half past seven.</Text>
          {morning.phoneOnly ? (
            <Text style={styles.note}>On the iPhone, if you allow it.</Text>
          ) : null}
          {morning.denied ? (
            <Text style={styles.note}>Notices are off in Settings.</Text>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel="A goose each morning"
          accessibilityRole="switch"
          accessibilityState={{ checked: morning.enabled, disabled: !morning.ready }}
          disabled={!morning.ready}
          onPress={() => {
            morning.setEnabled(!morning.enabled).catch(() => {});
          }}
          style={[styles.track, morning.enabled && styles.trackOn]}
          testID="morning-switch"
        >
          <View style={[styles.thumb, morning.enabled && styles.thumbOn]} />
        </Pressable>
      </View>

      <View style={styles.rule} />

      <Link href="/book" asChild>
        <Pressable accessibilityRole="button" style={styles.colophon} testID="open-book">
          <Text style={styles.author}>Matthew Finley</Text>
          <Text style={styles.listing}>The listing</Text>
        </Pressable>
      </Link>
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
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
    color: colors.goldDeep,
  },
  mark: {
    fontFamily: fonts.mediumItalic,
    fontSize: 72,
    lineHeight: 78,
    textAlign: "center",
    color: colors.gold,
    marginTop: 2,
    marginBottom: 8,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.ivoryRaised,
  },
  cardImage: {
    width: "100%",
    backgroundColor: colors.ivory,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 8,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitles: {
    gap: 3,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
  },
  cardCaption: {
    fontFamily: fonts.italic,
    fontSize: 22,
    lineHeight: 30,
    color: colors.ink,
  },
  row: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 92,
  },
  flock: {
    width: 148,
    height: 86,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowCaption: {
    fontFamily: fonts.italic,
    fontSize: 18,
    lineHeight: 24,
    color: colors.ink,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginVertical: 16,
  },
  morning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  note: {
    fontFamily: fonts.italic,
    fontSize: 14,
    lineHeight: 18,
    color: colors.inkSoft,
  },
  track: {
    width: 46,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.line,
    padding: 3,
    justifyContent: "center",
  },
  trackOn: {
    backgroundColor: colors.gold,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ivoryRaised,
  },
  thumbOn: {
    transform: [{ translateX: 18 }],
  },
  colophon: {
    alignItems: "center",
    gap: 4,
    paddingTop: 6,
    paddingBottom: 8,
  },
  author: {
    fontFamily: fonts.regular,
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.inkSoft,
  },
  listing: {
    fontFamily: fonts.italic,
    fontSize: 16,
    color: colors.goldDeep,
  },
});
