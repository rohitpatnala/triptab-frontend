
export type ExpenseCategory =
  | "travel"
  | "food"
  | "shopping"
  | "alcohol"
  | "bike"
  | "accommodation"
  | "tips"
  | "activities"
  | "miscellaneous";

export type SplitMode = "equal" | "shares" | "percentages";

export interface TripMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  paidPaise: number;
  sharePaise: number;
  netPaise: number;
}

export interface TripExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amountPaise: number;
  paidBy: string;
  date: string;
  participants: string[];
  splitMode?: SplitMode;
  splitValues?: Record<string, number>;
}

export interface TripDetails {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: TripMember[];
  expenses: TripExpense[];
}
