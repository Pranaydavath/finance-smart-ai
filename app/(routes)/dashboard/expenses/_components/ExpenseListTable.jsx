import React from 'react';
import { db } from '@/utils/dbConfig';
import { Expenses } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { toast } from 'sonner';

function ExpenseListTable({ expensesList, refreshData }) {
  
  const deleteExpense = async (expense) => {
    try {
      const result = await db.delete(Expenses)
        .where(eq(Expenses.id, expense.id))
        .returning();

      if (result) {
        toast('Expense Deleted!');
        refreshData();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  return (
    <div className="mt-3">
      <h2 className="font-bold text-lg">Latest Expenses</h2>
      <div className="grid grid-cols-4 bg-slate-200 p-2 font-bold mt-2 rounded-t-lg">
        <h2>Name</h2>
        <h2>Amount</h2>
        <h2>Date</h2>
        <h2>Action</h2>
      </div>
      {expensesList?.map((expense, index) => (
        // 🛠️ FIXED: Added unique key prop to the parent loop element
        <div key={expense.id || index} className="grid grid-cols-4 bg-slate-50 p-2 border-b items-center">
          <h2>{expense.name}</h2>
          <h2>${expense.amount}</h2>
          <h2>{expense.createdAt || 'N/A'}</h2>
          <h2>
            <span 
              className="text-red-600 cursor-pointer hover:underline text-sm font-medium"
              onClick={() => deleteExpense(expense)}
            >
              Delete
            </span>
          </h2>
        </div>
      ))}
    </div>
  );
}

export default ExpenseListTable;