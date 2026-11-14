import type { ImageSource } from "expo-image";

export type Plate = {
  id: string;
  title: string;
  kicker: string;
  caption: string;
  /** Shorter line for the morning notice, when the plate caption is two sentences. */
  notice?: string;
  wide: boolean;
  source: ImageSource;
};

export const plates: Plate[] = [
  {
    id: "jacket",
    title: "Goose Z",
    kicker: "The jacket",
    caption:
      "The premier goose book for keeping a flock of geese visually on your coffee table.",
    wide: true,
    source: require("../../assets/cover-wrap-v2.jpg"),
  },
  {
    id: "cheek",
    title: "The white of the cheek",
    kicker: "The bird",
    caption: "A Canada goose, close enough to see the lay of each feather.",
    wide: true,
    source: require("../../assets/spread-01-pp8-9.jpg"),
  },
  {
    id: "cruise",
    title: "In cruise",
    kicker: "The bird",
    caption:
      "In cruise the neck is held straight out, and the feet are tucked against the body.",
    notice: "First light on a marsh. Three Canada geese stand in the shallows.",
    wide: true,
    source: require("../../assets/spread-02-pp14-15.jpg"),
  },
  {
    id: "family",
    title: "The first year",
    kicker: "The flock",
    caption:
      "An adult and one gosling. The family often remains together through the first year.",
    wide: true,
    source: require("../../assets/spread-03-pp66-67.jpg"),
  },
  {
    id: "launch",
    title: "The lake lets them go",
    kicker: "The V",
    caption: "Wings high, feet still trailing. The lake lets them go.",
    wide: true,
    source: require("../../assets/spread-04-pp104-105.jpg"),
  },
  {
    id: "pages-1",
    title: "The famous curve",
    kicker: "Pages 1–30",
    caption: "The famous curve, and a road in the air.",
    wide: false,
    source: require("../../assets/contact-01.jpg"),
  },
  {
    id: "pages-31",
    title: "The bill, named",
    kicker: "Pages 31–60",
    caption: "The bill, named. A column of small bones.",
    wide: false,
    source: require("../../assets/contact-02.jpg"),
  },
  {
    id: "pages-61",
    title: "Usually for life",
    kicker: "Pages 61–90",
    caption: "Gaggle, skein, wedge, plump.",
    wide: false,
    source: require("../../assets/contact-03.jpg"),
  },
  {
    id: "pages-91",
    title: "A shape on the sky",
    kicker: "Pages 91–120",
    caption: "First, and a call. A shape written on the sky.",
    wide: false,
    source: require("../../assets/contact-04.jpg"),
  },
  {
    id: "pages-121",
    title: "Goosenecks",
    kicker: "Pages 121–150",
    caption: "A V over a marsh at dusk.",
    wide: false,
    source: require("../../assets/contact-05.jpg"),
  },
  {
    id: "close",
    title: "The close",
    kicker: "Pages 151–158",
    caption: "A little true thing, still said.",
    wide: false,
    source: require("../../assets/contact-06.jpg"),
  },
  {
    id: "earlier-jacket",
    title: "A book for the eyes",
    kicker: "An earlier jacket",
    caption: "The last light in the book is a V over a marsh at dusk.",
    wide: true,
    source: require("../../assets/cover-wrap.jpg"),
  },
];

export type LaunchBeat = {
  plateId: string;
  kicker: string;
  caption: string;
};

export const launchBeats: LaunchBeat[] = [
  {
    plateId: "cruise",
    kicker: "First light",
    caption: "Three Canada geese stand in the shallows.",
  },
  {
    plateId: "launch",
    kicker: "The lake",
    caption: "Wings high, feet still trailing. The lake lets them go.",
  },
  {
    plateId: "pages-91",
    kicker: "Upwash",
    caption: "Upwash, and a saving of work.",
  },
  {
    plateId: "pages-91",
    kicker: "The shape",
    caption: "A shape written on the sky.",
  },
  {
    plateId: "pages-121",
    kicker: "Dusk",
    caption: "The last light in the book is a V over a marsh at dusk.",
  },
];

export function plateById(id: string): Plate | undefined {
  return plates.find((plate) => plate.id === id);
}

export function noticeLine(plate: Plate): string {
  return plate.notice ?? plate.caption;
}
