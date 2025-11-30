export const PRAYER_OPTIONS = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
  { key: "jumua", label: "Jumu'ah" },
] as const;

export type PrayerKey = (typeof PRAYER_OPTIONS)[number]["key"];
