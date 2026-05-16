import { useState } from 'react';
import { Plus } from 'lucide-react';
import { expenseStorage } from '@/lib/expenseStorage';

export function ExpenseForm({ onExpenseAdded, defaultDate }) {
  const [formData, setFormData] = useState({
    date: defaultDate || new Date().toISOString().split('T')[0],
    reason: '',
    category: '',
    amount: '',
  });
  const [message, setMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount) {
      setMessage({ type: 'error', text: 'Please fill in category and amount' });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    expenseStorage.addExpense({
      date: formData.date,
      reason: formData.reason,
      category: formData.category,
      amount,
    });

    setMessage({ type: 'success', text: `₹${amount} added to ${formData.category}` });

    // Reset form
    setFormData({
      date: formData.date, // Keep the same date
      reason: '',
      category: '',
      amount: '',
    });

    onExpenseAdded();

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  // Get existing categories for datalist
  const existingCategories = expenseStorage.getCategories();

  return (
    <div className="bg-card text-card-foreground rounded-xl border-2 p-6 w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Expense
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Track your spending with custom categories
        </p>
      </div>
      
      {message && (
        <div className={`p-3 rounded-md mb-4 text-sm ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium leading-none">Date</label>
          <input
            id="date"
            type="date"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="reason" className="text-sm font-medium leading-none">Description (Optional)</label>
          <input
            id="reason"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g., Lunch, Coffee, Books..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium leading-none">Category</label>
          <input
            id="category"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g., Food, Transport, Entertainment..."
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            list="categories"
            required
          />
          <datalist id="categories">
            {existingCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
          <p className="text-xs text-muted-foreground">
            Type a new category or select from existing ones
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium leading-none">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>

        <button 
          type="submit" 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-4"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}
