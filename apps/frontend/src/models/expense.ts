export type ExpenseType = 'INGREDIENT' | 'PACKAGING' | 'UTILITY' | 'OTHER';

export const ExpenseType = {
  INGREDIENT: 'INGREDIENT' as const,
  PACKAGING: 'PACKAGING' as const,
  UTILITY: 'UTILITY' as const,
  OTHER: 'OTHER' as const,
};

export interface Expense {
  id: number;
  description: string;
  amount: number;
  type: ExpenseType;
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
  type?: ExpenseType;
  itemId?: number | null;
  userId?: number | null;
}

export interface UpdateExpenseDto {
  description?: string;
  amount?: number;
  type?: ExpenseType;
  itemId?: number | null;
  userId?: number | null;
}

