import { useState, useEffect } from 'react';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import ExpenseChart from '@/components/ExpenseChart';
import { Layout } from '@/components/Layout';
import { Calendar, TrendingUp } from 'lucide-react';
import { expenseStorage } from '@/lib/expenseStorage';
import { cn } from '@/lib/utils';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('daily');

  // Load expenses
  useEffect(() => {
    setExpenses(expenseStorage.getExpenses());
  }, [refreshKey]);

  const handleExpenseUpdate = () => {
    setRefreshKey(key => key + 1);
  };

  // Get daily summary
  const daySummary = expenseStorage.getDaySummary(selectedDate);
  
  // Get monthly summary
  const monthlySummary = expenseStorage.getMonthlySummary(selectedMonth, selectedYear);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Expense Tracker
          </h1>
          <p className="text-muted-foreground">
            Track and manage your daily expenses with custom categories
          </p>
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            <div className="w-full">
              <div className="flex p-1 bg-secondary rounded-lg mb-6">
                <button
                  onClick={() => setActiveTab('daily')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                    activeTab === 'daily' ? "bg-background shadow-sm" : "hover:bg-background/50"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  Daily View
                </button>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                    activeTab === 'monthly' ? "bg-background shadow-sm" : "hover:bg-background/50"
                  )}
                >
                  <TrendingUp className="h-4 w-4" />
                  Monthly View
                </button>
              </div>

              {activeTab === 'daily' ? (
                <div className="space-y-6">
                  {/* Date Selector */}
                  <div className="bg-card text-card-foreground rounded-xl border-2 glass p-6">
                    <h3 className="text-lg font-semibold mb-1">Daily Summary</h3>
                    <p className="text-sm text-muted-foreground mb-4">View your expenses for a specific date</p>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Select Date</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Daily Summary Card */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-primary/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold">Total Spent Today</h3>
                    <p className="text-sm text-muted-foreground mb-4">{new Date(selectedDate).toLocaleDateString()}</p>
                    <div className="text-3xl font-bold text-primary">₹{daySummary.total.toFixed(2)}</div>
                    {daySummary.categories.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {daySummary.categories.map((cat) => (
                          <div key={cat.category} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{cat.category}</span>
                            <span className="font-medium">₹{cat.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Daily Expense Chart */}
                  {daySummary.categories.length > 0 && (
                    <ExpenseChart
                      categories={daySummary.categories}
                      title="Daily Expense Breakdown"
                      description={`Expense distribution for ${new Date(selectedDate).toLocaleDateString()}`}
                    />
                  )}

                  {/* Day's Expenses */}
                  <ExpenseList 
                    expenses={expenseStorage.getExpensesByDate(selectedDate)} 
                    onExpenseUpdated={handleExpenseUpdate}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Month/Year Selector */}
                  <div className="bg-card text-card-foreground rounded-xl border-2 glass p-6">
                    <h3 className="text-lg font-semibold mb-1">Monthly Summary</h3>
                    <p className="text-sm text-muted-foreground mb-4">View your expenses for a specific month</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Month</label>
                        <select 
                          value={selectedMonth} 
                          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {months.map((month, index) => (
                            <option key={index} value={index}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Year</label>
                        <select 
                          value={selectedYear} 
                          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Summary Card */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-primary/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold">Total Spent This Month</h3>
                    <p className="text-sm text-muted-foreground mb-4">{months[selectedMonth]} {selectedYear}</p>
                    <div className="text-3xl font-bold text-primary">₹{monthlySummary.total.toFixed(2)}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Spent money on {monthlySummary.daysSpent} {monthlySummary.daysSpent === 1 ? 'day' : 'days'}
                    </div>
                    {monthlySummary.categories.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {monthlySummary.categories.map((cat) => (
                          <div key={cat.category} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{cat.category}</span>
                            <span className="font-medium">₹{cat.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Monthly Expense Chart */}
                  {monthlySummary.categories.length > 0 && (
                    <ExpenseChart
                      categories={monthlySummary.categories}
                      title="Monthly Expense Breakdown"
                      description={`Expense distribution for ${months[selectedMonth]} ${selectedYear}`}
                    />
                  )}

                  {/* Monthly Expenses */}
                  <ExpenseList 
                    expenses={monthlySummary.expenses} 
                    onExpenseUpdated={handleExpenseUpdate}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Add Expense Form */}
            <div className="lg:sticky lg:top-6">
              <ExpenseForm 
                onExpenseAdded={handleExpenseUpdate}
                defaultDate={selectedDate}
              />

              {/* Quick Stats */}
              <div className="bg-card text-card-foreground rounded-xl border-2 p-6 mt-6">
                <h3 className="text-lg font-semibold mb-1">Quick Stats</h3>
                <p className="text-sm text-muted-foreground mb-4">Your expense overview</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Entries</span>
                    <span className="font-semibold">{expenses.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-semibold">₹{monthlySummary.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Today</span>
                    <span className="font-semibold">₹{daySummary.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Categories</span>
                    <span className="font-semibold">{expenseStorage.getCategories().length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Days Spent This Month</span>
                    <span className="font-semibold">{monthlySummary.daysSpent}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExpenseTracker;
