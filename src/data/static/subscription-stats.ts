import type { Category, SubscriptionStats } from "@/types";
import { staticSubscriptions } from "./subscriptions";

const emptyByCategory: Record<Category, { count: number; monthlyTotal: number }> = {
  STREAMING: { count: 0, monthlyTotal: 0 },
  MUSIC: { count: 0, monthlyTotal: 0 },
  GAMING: { count: 0, monthlyTotal: 0 },
  PRODUCTIVITY: { count: 0, monthlyTotal: 0 },
  CLOUD_STORAGE: { count: 0, monthlyTotal: 0 },
  NEWS: { count: 0, monthlyTotal: 0 },
  FITNESS: { count: 0, monthlyTotal: 0 },
  EDUCATION: { count: 0, monthlyTotal: 0 },
  FINANCE: { count: 0, monthlyTotal: 0 },
  UTILITIES: { count: 0, monthlyTotal: 0 },
  OTHER: { count: 0, monthlyTotal: 0 },
};

/**
 * Static subscription stats (dashboard, stats screen, upcoming) for UI-first / course development.
 * Sourced from API GET /subscriptions/stats/summary. Upcoming reuses staticSubscriptions.
 */
export const staticSubscriptionStats: SubscriptionStats = {
  totalActive: 10,
  monthlyTotal: 80,
  yearlyTotal: 960,
  upcoming: staticSubscriptions,
  byCategory: {
    ...emptyByCategory,
    MUSIC: { count: 1, monthlyTotal: 5 },
    STREAMING: { count: 2, monthlyTotal: 10 },
    PRODUCTIVITY: { count: 2, monthlyTotal: 25 },
    CLOUD_STORAGE: { count: 2, monthlyTotal: 20 },
    NEWS: { count: 1, monthlyTotal: 5 },
    EDUCATION: { count: 1, monthlyTotal: 10 },
    FITNESS: { count: 1, monthlyTotal: 5 },
  },
};
