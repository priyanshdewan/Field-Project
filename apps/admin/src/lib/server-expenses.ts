// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getExpensesServer, addExpenseServer, editExpenseServer, archiveExpenseServer } from './api-expenses';

// Type definitions preserved from original server module
export interface ExpenseListItem {
  id: string;
  expenseNumber: string;
  date: string;
  category: string;
  description: string;
  vendor: string;
  amount: number;
  departmentId: string | null;
  status: string;
  paymentMethod: string;
}

