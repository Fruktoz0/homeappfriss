export interface BudgetMonth{
    id: number;
    userId: string;
    month: string;
    total_budget: number;
    remaining_budget: number;
    expenses?: Expense[];
}

export interface BudgetWeek {
  id: number;
  budgetMonthId: number;
  week_number: number;
  start_date: string;
  end_date: string;
  weekly_budget: number;
  remaining_weekly_budget: number;
}

export interface BudgetExpense {
  id: number;
  budgetMonthId: number;
  userId: string;
  description: string;
  amount: number;
  category?: string;
  currency: 'HUF' | 'EUR' | 'USD';
  createdAt?: string;
}

export interface BudgetFixedExpense {
  id: number;
  userId: string;
  name: string;
  expected_amount: number;
  type: 'FIX' | 'ESTIMATED';
  auto_apply: boolean;
  frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  due_day?: number;
  next_due_date?: string;
  active: boolean;
  paid?: boolean;
}

export interface BudgetSaving {
  id: number;
  userId: string;
  name: string;
  target_amount?: number;
  active: boolean;
}

export interface BudgetSavingLog {
  id: number;
  savingId: number;
  amount: number;
  note?: string;
  createdByUserId: string;
  active: boolean;
}


export interface BudgetMonthsResponse {
  allMonths: BudgetMonth[];
  currentMonth: BudgetMonth | null;
}


export interface Expense {
  id: number;
  userId: number;
  budgetMonthId: number;

  title: string;
  amount: number;

  // kategória lehet ID vagy név attól függően, mit ad a backend
  categoryId?: number | null;
  category?: string | null;

  note?: string | null;

  createdAt: string;  // ISO dátum string
  updatedAt?: string; // ISO dátum string
}