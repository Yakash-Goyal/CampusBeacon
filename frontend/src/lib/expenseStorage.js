const STORAGE_KEY = 'student-expenses';

export const expenseStorage = {
  getExpenses() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  },

  addExpense(expense) {
    const expenses = this.getExpenses();
    const newExpense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    expenses.push(newExpense);
    this.saveExpenses(expenses);
    return newExpense;
  },

  updateExpense(id, updates) {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updates };
      this.saveExpenses(expenses);
    }
  },

  deleteExpense(id) {
    const expenses = this.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    this.saveExpenses(filtered);
  },

  getCategories() {
    const expenses = this.getExpenses();
    const categories = new Set(expenses.map(e => e.category));
    return Array.from(categories).sort();
  },

  getExpensesByDate(date) {
    return this.getExpenses().filter(e => e.date === date);
  },

  getDaySummary(date) {
    const expenses = this.getExpensesByDate(date);
    const categoryMap = new Map();
    
    expenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    const categories = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      date,
      categories,
      total,
    };
  },

  getMonthlySummary(month, year) {
    const allExpenses = this.getExpenses();
    const monthExpenses = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
    });

    const categoryMap = new Map();
    
    monthExpenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    const categories = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));

    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const uniqueDates = new Set(monthExpenses.map(expense => expense.date));
    const daysSpent = uniqueDates.size;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];

    return {
      month: monthNames[month],
      year,
      categories,
      total,
      expenses: monthExpenses,
      daysSpent,
    };
  },
};