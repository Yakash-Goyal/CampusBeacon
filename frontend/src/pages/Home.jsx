import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { expenseStorage } from '@/lib/expenseStorage';
import { cgpaStorage } from '@/lib/cgpaStorage';
import { attendanceStorage } from '@/lib/attendanceStorage';
import { todoStorage } from '@/lib/todoStorage';
import { dailyTargetStorage } from '@/lib/dailyTargetStorage';
import { TrendingUp, Wallet, Calendar as CalendarIcon, BookOpen, Award, ListTodo, GraduationCap, Target, Plus, Clock, CheckCircle2, Trash2, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Home = () => {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [cgpa, setCgpa] = useState(0);
  const [attendance, setAttendance] = useState(0);
  const [todoStats, setTodoStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [dailyTargets, setDailyTargets] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [progressInputs, setProgressInputs] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [greeting, setGreeting] = useState('Welcome back!');
  const [greetingEmoji, setGreetingEmoji] = useState('👋');
  const [quote, setQuote] = useState('');
  const [newTarget, setNewTarget] = useState({
    task: '',
    trackingType: 'time',
    timeTarget: 0,
    amountTarget: 0,
    unit: 'pages',
    date: new Date().toISOString().split('T')[0],
  });
  
  useEffect(() => {
    // Dynamic greeting
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning, Scholar!');
      setGreetingEmoji('🌅');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Good afternoon, Achiever!');
      setGreetingEmoji('☀️');
    } else {
      setGreeting('Good evening, Night Owl!');
      setGreetingEmoji('🌙');
    }

    // Daily quote
    const quotes = [
      "The secret of getting ahead is getting started.",
      "It always seems impossible until it's done.",
      "Don't watch the clock; do what it does. Keep going.",
      "Success is the sum of small efforts, repeated day-in and day-out.",
      "The future depends on what you do today.",
      "Believe you can and you're halfway there."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Expenses
    const expenses = expenseStorage.getExpenses();
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const now = new Date();
    const monthlySummary = expenseStorage.getMonthlySummary(now.getMonth(), now.getFullYear());
    setTotalExpenses(total);
    setMonthlyExpenses(monthlySummary.total);

    // CGPA
    const cgpaData = cgpaStorage.getData();
    setCgpa(cgpaData.currentCGPA);

    // Attendance
    const attendanceData = attendanceStorage.getData();
    if (attendanceData.subjects.length > 0) {
      const percentages = attendanceData.subjects.map(s => 
        attendanceStorage.getAttendancePercentage(s.id)
      );
      const avg = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
      setAttendance(avg);
    }

    // Todo
    const todos = todoStorage.getStats();
    setTodoStats(todos);

    // Daily Targets
    loadDailyTargets();
  }, []);

  const loadDailyTargets = () => {
    const targets = dailyTargetStorage.getTargetsByDate(selectedDate);
    setDailyTargets(targets);
  };

  useEffect(() => {
    loadDailyTargets();
  }, [selectedDate]);

  const handleAddTarget = () => {
    if (!newTarget.task.trim()) return;
    
    const target = {
      id: Date.now().toString(),
      task: newTarget.task,
      trackingType: newTarget.trackingType,
      timeTarget: newTarget.trackingType === 'time' ? newTarget.timeTarget : undefined,
      timeSpent: newTarget.trackingType === 'time' ? 0 : undefined,
      amountTarget: newTarget.trackingType === 'amount' ? newTarget.amountTarget : undefined,
      amountCompleted: newTarget.trackingType === 'amount' ? 0 : undefined,
      unit: newTarget.trackingType === 'amount' ? newTarget.unit : undefined,
      isCompleted: newTarget.trackingType === 'completion' ? false : undefined,
      date: newTarget.date,
      createdAt: new Date().toISOString(),
    };
    
    dailyTargetStorage.addTarget(target);
    loadDailyTargets();
    setIsDialogOpen(false);
    setNewTarget({ 
      task: '', 
      trackingType: 'time', 
      timeTarget: 0, 
      amountTarget: 0, 
      unit: 'pages',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddProgress = (id, trackingType) => {
    const inputValue = parseInt(progressInputs[id] || '0') || 0;
    if (inputValue <= 0) return;

    const target = dailyTargets.find(t => t.id === id);
    if (!target) return;

    if (trackingType === 'time') {
      const newValue = (target.timeSpent || 0) + inputValue;
      dailyTargetStorage.updateTarget(id, { timeSpent: newValue });
    } else if (trackingType === 'amount') {
      const newValue = (target.amountCompleted || 0) + inputValue;
      dailyTargetStorage.updateTarget(id, { amountCompleted: newValue });
    }
    
    setProgressInputs(prev => ({ ...prev, [id]: '' }));
    loadDailyTargets();
  };

  const handleMarkCompleted = (id, trackingType) => {
    const target = dailyTargets.find(t => t.id === id);
    if (!target) return;

    if (trackingType === 'time') {
      dailyTargetStorage.updateTarget(id, { timeSpent: target.timeTarget });
    } else if (trackingType === 'amount') {
      dailyTargetStorage.updateTarget(id, { amountCompleted: target.amountTarget });
    } else {
      dailyTargetStorage.updateTarget(id, { isCompleted: true });
    }
    loadDailyTargets();
  };

  const handleToggleCompletion = (id) => {
    const target = dailyTargets.find(t => t.id === id);
    if (!target) return;
    dailyTargetStorage.updateTarget(id, { isCompleted: !target.isCompleted });
    loadDailyTargets();
  };

  // Sort targets: incomplete first, completed last
  const sortedTargets = [...dailyTargets].sort((a, b) => {
    const aCompleted = a.trackingType === 'time' 
      ? (a.timeSpent || 0) >= (a.timeTarget || 0)
      : a.trackingType === 'amount'
        ? (a.amountCompleted || 0) >= (a.amountTarget || 0)
        : a.isCompleted;
    const bCompleted = b.trackingType === 'time'
      ? (b.timeSpent || 0) >= (b.timeTarget || 0)
      : b.trackingType === 'amount'
        ? (b.amountCompleted || 0) >= (b.amountTarget || 0)
        : b.isCompleted;
    
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    return 0;
  });

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleDeleteTarget = (id) => {
    dailyTargetStorage.deleteTarget(id);
    loadDailyTargets();
  };

  const stats = [
    {
      title: 'CGPA',
      value: cgpa > 0 ? cgpa.toFixed(2) : 'N/A',
      icon: Award,
      description: 'Overall performance',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 border-green-500/30',
      path: '/cgpa',
    },
    {
      title: 'Total Expenses',
      value: `₹${totalExpenses.toFixed(2)}`,
      icon: Wallet,
      description: 'All time',
      color: 'text-primary',
      bgColor: 'bg-primary/10 border-primary/30',
      path: '/expenses',
    },
    {
      title: 'This Month',
      value: `₹${monthlyExpenses.toFixed(2)}`,
      icon: TrendingUp,
      description: 'Monthly spending',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/30',
      path: '/expenses',
    },
    {
      title: 'Attendance',
      value: attendance > 0 ? `${attendance.toFixed(1)}%` : 'N/A',
      icon: CalendarIcon,
      description: 'Average across subjects',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 border-purple-500/30',
      path: '/attendance',
    },
    {
      title: 'Todo Tasks',
      value: `${todoStats.pending}/${todoStats.total}`,
      icon: ListTodo,
      description: 'Pending tasks',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10 border-orange-500/30',
      path: '/todo',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center animate-fade-in">
          <div className="inline-block p-4 rounded-2xl bg-gradient-primary shadow-glow mb-4 animate-float">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 flex flex-wrap justify-center items-center gap-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent pb-2 leading-tight">
              {greeting}
            </span>
            <span className="text-4xl sm:text-5xl inline-block leading-none">{greetingEmoji}</span>
          </h1>
          <p className="text-lg text-foreground max-w-2xl mx-auto font-medium italic mb-2">
            "{quote}"
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Track your academic journey and manage your finances with ease
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link 
                to={stat.path}
                key={index} 
                className="block bg-card text-card-foreground rounded-xl border-2 glass transition-all duration-300 hover:shadow-glow hover:scale-105 hover:border-primary/30 cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="tracking-tight text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.title}
                  </h3>
                  <div className="p-2 rounded-lg bg-gradient-primary/10 group-hover:bg-gradient-primary group-hover:shadow-glow transition-all">
                    <Icon className={`h-5 w-5 ${stat.color} group-hover:text-white transition-colors`} />
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className={`text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Daily Work Targets */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Work Targets</h2>
            <div className="flex items-center gap-2">
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10" 
                onClick={() => changeDate(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="px-4 py-2 rounded-lg glass border-2 font-semibold min-w-[150px] text-center">
                {selectedDate === new Date().toISOString().split('T')[0] 
                  ? 'Today' 
                  : format(new Date(selectedDate), 'MMM dd, yyyy')}
              </div>
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10" 
                onClick={() => changeDate(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Target
            </button>
          </div>

          {isDialogOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-background border rounded-lg shadow-lg w-full max-w-lg overflow-hidden glass border-2">
                <div className="flex justify-between items-center p-6 border-b">
                  <div>
                    <h2 className="text-lg font-semibold leading-none tracking-tight">Add Daily Target</h2>
                    <p className="text-sm text-muted-foreground mt-1">Set a work target for today</p>
                  </div>
                  <button onClick={() => setIsDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="task" className="text-sm font-medium leading-none">Task</label>
                    <input
                      id="task"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Enter your task..."
                      value={newTarget.task}
                      onChange={(e) => setNewTarget({ ...newTarget, task: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium leading-none">Date</label>
                    <input
                      id="date"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={newTarget.date}
                      onChange={(e) => setNewTarget({ ...newTarget, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Tracking Type</label>
                    <div className="flex flex-col gap-2 mt-2">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="radio" 
                          name="trackingType" 
                          value="time" 
                          checked={newTarget.trackingType === 'time'}
                          onChange={(e) => setNewTarget({ ...newTarget, trackingType: e.target.value })}
                          className="accent-primary"
                        />
                        Track by time spent
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="radio" 
                          name="trackingType" 
                          value="amount" 
                          checked={newTarget.trackingType === 'amount'}
                          onChange={(e) => setNewTarget({ ...newTarget, trackingType: e.target.value })}
                          className="accent-primary"
                        />
                        Track by amount completed
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="radio" 
                          name="trackingType" 
                          value="completion" 
                          checked={newTarget.trackingType === 'completion'}
                          onChange={(e) => setNewTarget({ ...newTarget, trackingType: e.target.value })}
                          className="accent-primary"
                        />
                        Simple yes/no completion
                      </label>
                    </div>
                  </div>

                  {newTarget.trackingType === 'time' && (
                    <div className="space-y-2">
                      <label htmlFor="timeTarget" className="text-sm font-medium leading-none">Target Time (minutes)</label>
                      <input
                        id="timeTarget"
                        type="number"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="60"
                        value={newTarget.timeTarget || ''}
                        onChange={(e) => setNewTarget({ ...newTarget, timeTarget: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}

                  {newTarget.trackingType === 'amount' && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="unit" className="text-sm font-medium leading-none">Unit (e.g., pages, questions, chapters)</label>
                        <input
                          id="unit"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="pages"
                          value={newTarget.unit}
                          onChange={(e) => setNewTarget({ ...newTarget, unit: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="amountTarget" className="text-sm font-medium leading-none">Target Amount</label>
                        <input
                          id="amountTarget"
                          type="number"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="50"
                          value={newTarget.amountTarget || ''}
                          onChange={(e) => setNewTarget({ ...newTarget, amountTarget: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </>
                  )}

                  <button 
                    onClick={handleAddTarget} 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-4"
                  >
                    Add Target
                  </button>
                </div>
              </div>
            </div>
          )}

          {dailyTargets.length === 0 ? (
            <div className="bg-card text-card-foreground rounded-xl border-2 glass">
              <div className="p-6 flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No targets set for this date</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedTargets.map((target) => {
                const isTimeCompleted = target.trackingType === 'time' && (target.timeSpent || 0) >= (target.timeTarget || 0);
                const isAmountCompleted = target.trackingType === 'amount' && (target.amountCompleted || 0) >= (target.amountTarget || 0);
                const isFullyCompleted = isTimeCompleted || isAmountCompleted || target.isCompleted;

                return (
                  <div 
                    key={target.id} 
                    className={cn(
                      "bg-card text-card-foreground rounded-xl glass border-2 hover:border-primary/30 transition-all",
                      isFullyCompleted && "opacity-70 border-success/30"
                    )}
                  >
                    <div className="p-6 pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={cn(
                              "font-semibold text-lg",
                              isFullyCompleted && "line-through text-muted-foreground"
                            )}>{target.task}</h3>
                            {isFullyCompleted && (
                              <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">Completed</span>
                            )}
                          </div>
                          
                          {target.trackingType === 'time' && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Target: {target.timeTarget} min</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">{target.timeSpent || 0} min</span>
                                  <span className="text-muted-foreground">
                                    {Math.min(100, Math.round(((target.timeSpent || 0) / (target.timeTarget || 1)) * 100))}% completed
                                  </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                  <div 
                                    className="h-full bg-primary transition-all" 
                                    style={{ width: `${Math.min(100, ((target.timeSpent || 0) / (target.timeTarget || 1)) * 100)}%`}}
                                  />
                                </div>
                              </div>
                              {!isTimeCompleted && (
                                <div className="flex items-center gap-2 mt-2">
                                  <input
                                    type="number"
                                    placeholder="Add minutes..."
                                    value={progressInputs[target.id] || ''}
                                    onChange={(e) => setProgressInputs(prev => ({ ...prev, [target.id]: e.target.value }))}
                                    className="flex h-9 w-full max-w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                  />
                                  <button 
                                    onClick={() => handleAddProgress(target.id, 'time')}
                                    disabled={!progressInputs[target.id]}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                                  >
                                    Add
                                  </button>
                                  <button 
                                    onClick={() => handleMarkCompleted(target.id, 'time')}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 gap-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    Mark Done
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {target.trackingType === 'amount' && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Target className="h-4 w-4" />
                                <span>Target: {target.amountTarget} {target.unit}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">{target.amountCompleted || 0} {target.unit}</span>
                                  <span className="text-muted-foreground">
                                    {Math.min(100, Math.round(((target.amountCompleted || 0) / (target.amountTarget || 1)) * 100))}% completed
                                  </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                  <div 
                                    className="h-full bg-primary transition-all" 
                                    style={{ width: `${Math.min(100, ((target.amountCompleted || 0) / (target.amountTarget || 1)) * 100)}%`}}
                                  />
                                </div>
                              </div>
                              {!isAmountCompleted && (
                                <div className="flex items-center gap-2 mt-2">
                                  <input
                                    type="number"
                                    placeholder={`Add ${target.unit}...`}
                                    value={progressInputs[target.id] || ''}
                                    onChange={(e) => setProgressInputs(prev => ({ ...prev, [target.id]: e.target.value }))}
                                    className="flex h-9 w-full max-w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                  />
                                  <button 
                                    onClick={() => handleAddProgress(target.id, 'amount')}
                                    disabled={!progressInputs[target.id]}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                                  >
                                    Add
                                  </button>
                                  <button 
                                    onClick={() => handleMarkCompleted(target.id, 'amount')}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 gap-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    Mark Done
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {target.trackingType === 'completion' && (
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => handleToggleCompletion(target.id)}
                                className={cn(
                                  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 gap-2",
                                  target.isCompleted ? "bg-primary text-primary-foreground shadow hover:bg-primary/90" : "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                {target.isCompleted ? 'Completed' : 'Mark Complete'}
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteTarget(target.id)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-destructive h-9 w-9 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Actions</h2>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card text-card-foreground rounded-xl glass border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:scale-105 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
            <div className="p-6 flex flex-col space-y-1.5">
              <div className="p-3 rounded-xl bg-gradient-primary/10 w-fit mb-2 group-hover:bg-gradient-primary group-hover:shadow-glow transition-all">
                <Wallet className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                Expense Tracker
              </h3>
              <p className="text-sm text-muted-foreground">
                Track and manage your daily expenses
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link 
                to="/expenses" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
              >
                Get Started →
              </Link>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-xl glass border-2 hover:border-success/50 transition-all duration-300 hover:shadow-lg hover:scale-105 group overflow-hidden relative">
            <div className="absolute inset-0 bg-success opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
            <div className="p-6 flex flex-col space-y-1.5">
              <div className="p-3 rounded-xl bg-success/10 w-fit mb-2 group-hover:bg-success group-hover:shadow-lg transition-all">
                <Award className="h-6 w-6 text-success group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold leading-none tracking-tight group-hover:text-success transition-colors">
                CGPA Tracker
              </h3>
              <p className="text-sm text-muted-foreground">
                Monitor your semester grades and CGPA
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link 
                to="/cgpa" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
              >
                Get Started →
              </Link>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-xl glass border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-accent hover:scale-105 group overflow-hidden relative">
            <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
            <div className="p-6 flex flex-col space-y-1.5">
              <div className="p-3 rounded-xl bg-accent/10 w-fit mb-2 group-hover:bg-accent group-hover:shadow-accent transition-all">
                <CalendarIcon className="h-6 w-6 text-accent group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold leading-none tracking-tight group-hover:text-accent transition-colors">
                Attendance Manager
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage schedule and track attendance
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link 
                to="/attendance" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
              >
                Get Started →
              </Link>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-xl glass border-2 hover:border-warning/50 transition-all duration-300 hover:shadow-lg hover:scale-105 group overflow-hidden relative">
            <div className="absolute inset-0 bg-warning opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
            <div className="p-6 flex flex-col space-y-1.5">
              <div className="p-3 rounded-xl bg-warning/10 w-fit mb-2 group-hover:bg-warning group-hover:shadow-lg transition-all">
                <ListTodo className="h-6 w-6 text-warning group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold leading-none tracking-tight group-hover:text-warning transition-colors">
                Todo List
              </h3>
              <p className="text-sm text-muted-foreground">
                Organize tasks with custom categories
              </p>
            </div>
            <div className="p-6 pt-0">
              <Link 
                to="/todo" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full"
              >
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;