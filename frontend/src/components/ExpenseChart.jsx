import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
  'hsl(210, 100%, 50%)',
  'hsl(142, 71%, 45%)',
  'hsl(262, 83%, 58%)',
  'hsl(27, 96%, 61%)',
  'hsl(340, 82%, 52%)',
  'hsl(173, 80%, 40%)',
  'hsl(45, 93%, 47%)',
  'hsl(0, 84%, 60%)',
];

const ExpenseChart = ({ 
  categories,
  title = "Expense Breakdown",
  description = "Distribution of expenses by category"
}) => {
  const data = categories
    .filter(cat => cat.amount > 0)
    .map((cat, index) => ({
      name: cat.category,
      value: cat.amount,
      color: COLORS[index % COLORS.length],
    }));

  if (data.length === 0) {
    return (
      <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No expenses to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => `${value}: ₹${entry.payload?.value.toFixed(2) || 0}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;