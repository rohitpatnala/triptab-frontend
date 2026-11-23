
import {
  createLightTheme,
  createDarkTheme,
  type Theme,
} from "@fluentui/react-components";

const triptabBrand = {
  10: "#061B42",
  20: "#0B2F70",
  30: "#12439B",
  40: "#1857C5",
  50: "#2469E8",
  60: "#3B7AF0",
  70: "#6193F5",
  80: "#8BB2FA",
  90: "#B7D0FC",
  100: "#D9E6FE",
  110: "#EAF1FF",
  120: "#F3F7FF",
  130: "#FFFFFF",
  140: "#FFFFFF",
  150: "#FFFFFF",
  160: "#FFFFFF",
} as const;

export const lightTheme: Theme = {
  ...createLightTheme(triptabBrand),
};

export const darkTheme: Theme = {
  ...createDarkTheme(triptabBrand),
};

export const categoryColors = {
  travel: "#2563EB",
  food: "#16A34A",
  shopping: "#8B5CF6",
  alcohol: "#DC2626",
  bike: "#F59E0B",
  tips: "#0891B2",
  accommodation: "#6366F1",
  activities: "#DB2777",
  miscellaneous: "#64748B",
};
