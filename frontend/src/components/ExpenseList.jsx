import { useState, useMemo } from 'react';
import { Edit2, Trash2, Calendar, Filter } from 'lucide-react';
import { expenseStorage } from '@/lib/expenseStorage';
import { cn } from '@/lib/utils';

const getCategoryColor = (category) => {
  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    'bg-blue-500/10 text-blue-500 border-blue-500/30',
    'bg-green-500/10 text-green-500 border-green-500/30',
    'bg-purple-500/10 text-purple-500 border-purple-500/30',
    'bg-orange-500/10 text-orange-500 border-orange-500/30',
    'bg-pink-500/10 text-pink-500 border-pink-500/30',
    'bg-teal-500/10 text-teal-500 border-teal-500/30',
  ];
  return colors[hash % colors.length];
};

export function ExpenseList({ expenses, onExpenseUpdated }) {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category));
    return Array.from(cats).sort();
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;
    if (categoryFilter !== 'all') {
      filtered = expenses.filter(e => e.category === categoryFilter);
    }
    return [...filtered].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime() || 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [expenses, categoryFilter]);

  const handleDelete = (expense) => {
    if (window.confirm(`Are you sure you want to delete "${expense.reason || expense.category}" - ₹${expense.amount}?`)) {
      expenseStorage.deleteExpense(expense.id);
      onExpenseUpdated();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-card text-card-foreground rounded-xl border-2 p-6 w-full">
        <h3 className="text-lg font-semibold">Recent Expenses</h3>
        <p className="text-sm text-muted-foreground mb-4">No expenses recorded yet</p>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-6xl mb-4 opacity-50">💸</div>
          <p className="text-muted-foreground text-center">
            Start tracking your expenses by adding your first entry above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl border-2 p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-semibold">Recent Expenses</h3>
          <p className="text-sm text-muted-foreground">
            {filteredExpenses.length} of {expenses.length} expense{expenses.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        {categories.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex h-10 w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filteredExpenses.map((expense) => (
          <div
            key={expense.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-lg sm:text-xl">
                💰
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                  <p className="font-medium truncate">{expense.reason || 'Expense'}</p>
                  <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent', getCategoryColor(expense.category))}>
                    {expense.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(expense.date)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="text-left sm:text-right">
                <p className="font-semibold text-lg sm:text-base">₹{expense.amount.toFixed(2)}</p>
              </div>
              
              <div className="flex gap-1">
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent h-8 w-8 p-0">
                  <Edit2 className="h-3 w-3" />
                </button>
                <button 
                  onClick={() => handleDelete(expense)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
