export interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  currency: string;
}

export interface TokenType {
  access: string;
}

export type BillingCycle = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export type Category =
  | "STREAMING" |
  "MUSIC" |
  "GAMING" |
  "PRODUCTIVITY" |
  "CLOUD_STORAGE" |
  "NEWS" |
  "FITNESS" |
  "EDUCATION" |
  "FINANCE" |
  "UTILITIES" |
  "OTHER";

export interface ColorPalette {
  vibrant: string | null;
  muted: string | null;
  darkVibrant: string | null;
  darkMuted: string | null;
  lightVibrant: string | null;
  lightMuted: string | null;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  colors?: ColorPalette;
  category: Category;
  website?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  serviceId?: string;
  customName?: string;
  customIcon?: string;
  customColor?: string;
  customColors?: ColorPalette;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate: string;
  nextBilling: string;
  notes?: string;
  reminder: boolean;
  reminderDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  service?: Service;
}

export interface PaymentHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  paidAt: string;
  createdAt: string;
}

export interface SubscriptionStats {
  totalActive: number;
  monthlyTotal: number;
  yearlyTotal: number;
  upcoming: Subscription[];
  byCategory: Record<Category, { count: number; monthlyTotal: number }>;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageInfo: PageInfo;
  totalCount: number;
}
