import AsyncStorage from "@react-native-async-storage/async-storage";
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
import * as Haptics from "expo-haptics";

const STORAGE_KEY = "goosez.kept.v1";

type KeptContextValue = {
  ready: boolean;
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
};

const KeptContext = createContext<KeptContextValue | null>(null);

function isIdList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function KeptProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive || !raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (isIdList(parsed)) setIds(parsed);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const toggle = useCallback((id: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    setIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<KeptContextValue>(
    () => ({
      ready,
      ids,
      has: (id) => ids.includes(id),
      toggle,
    }),
    [ids, ready, toggle],
  );

  return <KeptContext.Provider value={value}>{children}</KeptContext.Provider>;
}

export function useKept(): KeptContextValue {
  const value = useContext(KeptContext);
  if (!value) {
    throw new Error("useKept must be used within KeptProvider");
  }
  return value;
}
