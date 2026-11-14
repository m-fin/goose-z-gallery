import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AMAZON_LISTING_URL } from "@/data/listing";
import { plateById } from "@/data/plates";
import { colors, fonts } from "@/theme";

const BLURB =
  "The premier goose book for keeping a flock of geese visually on your coffee table, or anywhere around the house. Here is the V-launch formation, and the gooseneck curve we borrowed.";

export default function BookScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const jacket = plateById("jacket");

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const openListing = () => {
    // TODO: Open the Amazon hardcover listing once AMAZON_LISTING_URL is set.
    if (AMAZON_LISTING_URL === null) return;
    Linking.openURL(AMAZON_LISTING_URL).catch(() => {});
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 },
      ]}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    >
      <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={close} testID="close-book">
        <Text style={styles.close}>Close</Text>
      </Pressable>
      {jacket ? (
        <Image
          accessibilityLabel="Goose Z jacket"
          contentFit="contain"
          source={jacket.source}
          style={styles.jacket}
        />
      ) : null}
      <Text accessibilityRole="header" style={styles.title}>
        Goose Z
      </Text>
      <Text style={styles.subtitle}>
        An Illustrated Natural History of the Bird, the Flock, and the Curve We Borrowed
      </Text>
      <Text style={styles.blurb}>{BLURB}</Text>
      <Text style={styles.author}>Matthew Finley</Text>
      <Text style={styles.spec}>8.25 × 11 inches · premium color · case-laminate hardcover</Text>
      <View style={styles.listingBlock}>
        <Pressable
          accessibilityHint="The Amazon listing is not live yet."
          accessibilityRole="link"
          onPress={openListing}
          style={styles.listing}
          testID="listing-button"
        >
          <Text style={styles.listingLabel}>The listing</Text>
        </Pressable>
        <Text style={styles.pending}>Not yet live.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    paddingHorizontal: 28,
  },
  close: {
    fontFamily: fonts.regular,
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: colors.goldDeep,
    textAlign: "right",
  },
  jacket: {
    width: "100%",
    height: 220,
    marginTop: 12,
  },
  title: {
    marginTop: 18,
    textAlign: "center",
    fontFamily: fonts.regular,
    fontSize: 28,
    letterSpacing: 6,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: fonts.italic,
    fontSize: 18,
    lineHeight: 26,
    color: colors.ink,
  },
  blurb: {
    marginTop: 22,
    textAlign: "center",
    fontFamily: fonts.italic,
    fontSize: 18,
    lineHeight: 28,
    color: colors.ink,
  },
  author: {
    marginTop: 28,
    textAlign: "center",
    fontFamily: fonts.regular,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.inkSoft,
  },
  spec: {
    marginTop: 8,
    textAlign: "center",
    fontFamily: fonts.italic,
    fontSize: 15,
    color: colors.inkSoft,
  },
  listingBlock: {
    marginTop: 28,
    alignItems: "center",
    gap: 10,
  },
  listing: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gold,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  listingLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: colors.goldDeep,
  },
  pending: {
    fontFamily: fonts.italic,
    fontSize: 16,
    color: colors.inkSoft,
  },
});
