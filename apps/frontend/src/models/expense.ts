export type ExpenseType =
  | 'INGREDIENT'
  | 'PACKAGING'
  | 'UTILITY'
  | 'TRANSPORT'
  | 'MAINTENANCE'
  | 'RENT'
  | 'SALARY'
  | 'OTHER';

export const ExpenseType = {
  INGREDIENT: 'INGREDIENT' as const,
  PACKAGING: 'PACKAGING' as const,
  UTILITY: 'UTILITY' as const,
  TRANSPORT: 'TRANSPORT' as const,
  MAINTENANCE: 'MAINTENANCE' as const,
  RENT: 'RENT' as const,
  SALARY: 'SALARY' as const,
  OTHER: 'OTHER' as const,
};

export type ExpenseNature = 'DIRECT' | 'INDIRECT';

export const ExpenseNature = {
  DIRECT: 'DIRECT' as const,
  INDIRECT: 'INDIRECT' as const,
};

export interface Expense {
  id: number;
  description: string;
  amount: number;
  type: ExpenseType | null;
  expenseNature: ExpenseNature;
  itemId: number | null;
  userId: number | null;
  organizationId: number;
  createdAt: string;
  item?: {
    id: number;
    name: string;
    sellingPrice: number;
  } | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  expenseNature?: ExpenseNature;
  type?: ExpenseType;
  itemId?: number | null;
}

export interface UpdateExpenseDto {
  description?: string;
  amount?: number;
  expenseNature?: ExpenseNature;
  type?: ExpenseType;
  itemId?: number | null;
}

