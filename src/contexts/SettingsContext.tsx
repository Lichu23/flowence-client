"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useStore } from "./StoreContext";
import type { Store } from "@/types";

interface SettingsContextValue {
  store: Store | null;
  currency: string;
  timezone: string;
  date_format: string;
  time_format: "12h" | "24h";
  formatCurrency: (value: number) => string;
  formatDate: (date: Date) => string;
  formatDateTime: (date: Date) => string;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentStore, getStoreDetails } = useStore();
  const [fullStore, setFullStore] = React.useState<Store | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (currentStore) {
          const { store } = await getStoreDetails(currentStore.id);
          if (mounted) setFullStore(store);
        } else {
          setFullStore(null);
        }
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStore?.id]); // Only depend on currentStore.id to avoid infinite loop

  const value = useMemo<SettingsContextValue>(() => {
    const s = fullStore;
    const currency = s?.currency || "USD";
    const timezone = s?.timezone || "UTC";
    const date_format = s?.date_format || "MM/DD/YYYY";
    const time_format = (s?.time_format as "12h" | "24h") || "12h";

    const formatCurrency = (value: number) => {
      try {
        // Special formatting for Argentine Pesos
        if (currency === "ARS") {
          return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
          }).format(value);
        }
        
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
        }).format(value);
      } catch {
        // Fallback formatting
        if (currency === "ARS") {
          return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
        }
        return `${currency} ${value.toFixed(2)}`;
      }
    };

    const formatParts = (date: Date) => {
      const parts = new Intl.DateTimeFormat(undefined, {
        hour12: time_format === "12h",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: timezone,
      }).formatToParts(date);
      const get = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((p) => p.type === type)?.value || "";
      return {
        yyyy: get("year"),
        MM: get("month"),
        DD: get("day"),
        hh: get("hour"),
        mm: get("minute"),
        ss: get("second"),
        ampm: get("dayPeriod"),
      };
    };

    const formatDate = (date: Date) => {
      const { yyyy, MM, DD } = formatParts(date);
      return date_format.replace("YYYY", yyyy).replace("MM", MM).replace("DD", DD);
    };

    const formatDateTime = (date: Date) => {
      const { yyyy, MM, DD, hh, mm, ss, ampm } = formatParts(date);
      const dateStr = date_format
        .replace("YYYY", yyyy)
        .replace("MM", MM)
        .replace("DD", DD);
      const timeStr = time_format === "12h" ? `${hh}:${mm}:${ss} ${ampm || ""}`.trim() : `${hh}:${mm}:${ss}`;
      return `${timeStr}, ${dateStr}`;
    };

    return {
      store: s || null,
      currency,
      timezone,
      date_format,
      time_format,
      formatCurrency,
      formatDate,
      formatDateTime,
    };
  }, [fullStore]);

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
