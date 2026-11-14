import { noticeLine, plates, type Plate } from "@/data/plates";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_MS = 86_400_000;

export function plateForDate(date: Date): Plate {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / DAY_MS);
  const index = ((day % plates.length) + plates.length) % plates.length;
  const plate = plates[index];
  if (!plate) throw new Error("Goose Z has no plates.");
  return plate;
}

export function formatDay(date: Date): string {
  const month = MONTHS[date.getMonth()] ?? "";
  return `${date.getDate()} ${month}`;
}

export function morningCopy(plate: Plate): { title: string; body: string } {
  return {
    title: "Goose of the day",
    body: noticeLine(plate),
  };
}
