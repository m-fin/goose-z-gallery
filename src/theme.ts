import { StyleSheet } from "react-native";

export const colors = {
  ivory: "#F4EFE3",
  ivoryRaised: "#F7F3EA",
  ink: "#2C261F",
  inkSoft: "#6B6258",
  gold: "#B8924A",
  goldDeep: "#7A5C28",
  line: "#E3D6C2",
};

export const fonts = {
  regular: "EBGaramond_400Regular",
  italic: "EBGaramond_400Regular_Italic",
  medium: "EBGaramond_500Medium",
  mediumItalic: "EBGaramond_500Medium_Italic",
};

export const type = StyleSheet.create({
  kicker: {
    fontFamily: fonts.regular,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: colors.goldDeep,
  },
  caption: {
    fontFamily: fonts.italic,
    fontSize: 20,
    lineHeight: 28,
    color: colors.ink,
  },
  quiet: {
    fontFamily: fonts.italic,
    fontSize: 16,
    lineHeight: 22,
    color: colors.inkSoft,
  },
});
