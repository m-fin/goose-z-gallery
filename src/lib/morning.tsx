import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";

import { morningCopy, plateForDate } from "@/lib/day";

const STORAGE_KEY = "goosez.morning.v1";
const CHANNEL_ID = "goose-of-the-day";
const HORIZON_DAYS = 14;
const MORNING_HOUR = 7;
const MORNING_MINUTE = 30;

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

type MorningContextValue = {
  ready: boolean;
  enabled: boolean;
  denied: boolean;
  phoneOnly: boolean;
  setEnabled: (next: boolean) => Promise<void>;
};

const MorningContext = createContext<MorningContextValue | null>(null);

async function clearMorningNotices(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith("goosez-morning-"))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
}

async function scheduleMorningNotices(): Promise<"ok" | "denied"> {
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }
  if (status !== "granted") return "denied";

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Goose of the day",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
    });
  }

  await clearMorningNotices();

  const now = new Date();
  for (let offset = 0; offset < HORIZON_DAYS; offset += 1) {
    const when = new Date(now);
    when.setDate(now.getDate() + offset);
    when.setHours(MORNING_HOUR, MORNING_MINUTE, 0, 0);
    if (when.getTime() <= now.getTime() + 30_000) continue;

    const plate = plateForDate(when);
    const copy = morningCopy(plate);
    const key = `${when.getFullYear()}-${when.getMonth() + 1}-${when.getDate()}`;
    await Notifications.scheduleNotificationAsync({
      identifier: `goosez-morning-${key}`,
      content: {
        title: copy.title,
        subtitle: plate.title,
        body: copy.body,
        sound: false,
        data: { plateId: plate.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
      },
    });
  }

  return "ok";
}

export function MorningProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [enabled, setEnabledState] = useState(false);
  const [denied, setDenied] = useState(false);
  const phoneOnly = Platform.OS === "web";

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (raw) => {
        const on = raw === "1";
        if (!alive) return;
        setEnabledState(on);
        if (on && Platform.OS !== "web") {
          const result = await scheduleMorningNotices().catch(() => "denied" as const);
          if (!alive) return;
          if (result === "denied") {
            setDenied(true);
            setEnabledState(false);
            await AsyncStorage.setItem(STORAGE_KEY, "0");
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const setEnabled = useCallback(async (next: boolean) => {
    setEnabledState(next);
    setDenied(false);
    await AsyncStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    if (Platform.OS === "web") return;
    if (!next) {
      await clearMorningNotices().catch(() => {});
      return;
    }
    const result = await scheduleMorningNotices().catch(() => "denied" as const);
    if (result === "denied") {
      setDenied(true);
      setEnabledState(false);
      await AsyncStorage.setItem(STORAGE_KEY, "0");
    }
  }, []);

  const value = useMemo<MorningContextValue>(
    () => ({ ready, enabled, denied, phoneOnly, setEnabled }),
    [denied, enabled, phoneOnly, ready, setEnabled],
  );

  return <MorningContext.Provider value={value}>{children}</MorningContext.Provider>;
}

export function useMorning(): MorningContextValue {
  const value = useContext(MorningContext);
  if (!value) {
    throw new Error("useMorning must be used within MorningProvider");
  }
  return value;
}

export function readPlateId(data: Record<string, unknown> | undefined): string | undefined {
  const plateId = data?.plateId;
  return typeof plateId === "string" ? plateId : undefined;
}
