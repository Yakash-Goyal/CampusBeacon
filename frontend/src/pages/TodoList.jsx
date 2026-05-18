import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Plus, Trash2, FolderPlus, X } from 'lucide-react';
import { todoStorage } from '@/lib/todoStorage';
import { cn } from '@/lib/utils';

export default function TodoList() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3b82f6' });
  const [newItem, setNewItem] = useState({ title: '', description: '', categoryId: '', dueDate: '', time: '' });
  const [activeTab, setActiveTab] = useState('active');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCategories(todoStorage.getCategories());
    setItems(todoStorage.getItems());
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      setMessage({ type: 'error', text: 'Category name is required' });
      return;
    }

    const category = {
      id: Date.now().toString(),
      name: newCategory.name.trim(),
      color: newCategory.color,
    };

    todoStorage.addCategory(category);
    loadData();
    setNewCategory({ name: '', color: '#3b82f6' });
    setCategoryDialogOpen(false);
    setMessage({ type: 'success', text: 'Category added successfully' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteCategory = (cat) => {
    if (window.confirm(`Are you sure you want to delete category "${cat.name}" and all its tasks?`)) {
      todoStorage.deleteCategory(cat.id);
      loadData();
      if (selectedCategory === cat.id) setSelectedCategory('all');
      setMessage({ type: 'success', text: 'Category deleted' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAddItem = () => {
    if (!newItem.title.trim()) {
      setMessage({ type: 'error', text: 'Task title is required' });
      return;
    }
    if (!newItem.categoryId) {
      setMessage({ type: 'error', text: 'Please select a category' });
      return;
    }

    const item = {
      id: Date.now().toString(),
      categoryId: newItem.categoryId,
      title: newItem.title.trim(),
      description: newItem.description.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: newItem.dueDate || undefined,
      time: newItem.time || undefined,
    };

    todoStorage.addItem(item);
    loadData();
    setNewItem({ title: '', description: '', categoryId: '', dueDate: '', time: '' });
    setItemDialogOpen(false);
    setMessage({ type: 'success', text: 'Task added successfully' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleComplete = (id, completed) => {
    todoStorage.updateItem(id, { completed: !completed });
    loadData();
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      todoStorage.deleteItem(id);
      loadData();
      setMessage({ type: 'success', text: 'Task deleted' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.categoryId === selectedCategory);

  const activeItems = filteredItems.filter(item => !item.completed);
  const completedItems = filteredItems.filter(item => item.completed);

  const getCategoryById = (id) => categories.find(c => c.id === id);

  const stats = todoStorage.getStats();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Todo List</h1>
            <p className="text-muted-foreground">Organize your tasks by category</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCategoryDialogOpen(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 py-2 gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              New Category
            </button>
            <button 
              onClick={() => setItemDialogOpen(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 gap-2"
            >
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-md mb-4 text-sm ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
            {message.text}
          </div>
        )}

        {/* Modals */}
        {categoryDialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-md overflow-hidden glass border-2 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Add Category</h2>
                <button onClick={() => setCategoryDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category Name</label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g., Work, Personal, Study"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <input
                    type="color"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-1 py-1"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  />
                </div>
                <button onClick={handleAddCategory} className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2">
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}

        {itemDialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-md overflow-hidden glass border-2 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Add Task</h2>
                <button onClick={() => setItemDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newItem.categoryId}
                    onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Title</label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Add details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newItem.dueDate}
                      onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <input
                      type="time"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newItem.time}
                      onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                    />
                  </div>
                </div>
                <button onClick={handleAddItem} className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2">
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
            <h3 className="text-sm font-semibold mb-2">Total Tasks</h3>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
            <h3 className="text-sm font-semibold mb-2">Completed</h3>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
            <h3 className="text-sm font-semibold mb-2">Pending</h3>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="flex flex-wrap gap-3">
            <span
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors",
                selectedCategory === 'all' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              All Tasks ({items.length})
            </span>
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-1">
                <span
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors",
                    selectedCategory === cat.id ? "text-white" : "hover:bg-accent"
                  )}
                  style={{ backgroundColor: selectedCategory === cat.id ? cat.color : undefined, borderColor: cat.color }}
                >
                  {cat.name} ({items.filter(i => i.categoryId === cat.id).length})
                </span>
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent h-6 w-6 p-0 text-destructive"
                  onClick={() => handleDeleteCategory(cat)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Tabs */}
        <div className="space-y-4">
          <div className="flex p-1 bg-secondary rounded-lg w-full max-w-md">
            <button
              onClick={() => setActiveTab('active')}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'active' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              Active Tasks ({activeItems.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'completed' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              Completed ({completedItems.length})
            </button>
          </div>

          <div className="space-y-3">
            {(activeTab === 'active' ? activeItems : completedItems).length === 0 ? (
              <div className="bg-card text-card-foreground rounded-xl border-2 p-8 text-center text-muted-foreground">
                {activeTab === 'active' ? 'No active tasks. Add a task to get started!' : 'No completed tasks yet.'}
              </div>
            ) : (
              (activeTab === 'active' ? activeItems : completedItems).map(item => {
                const category = getCategoryById(item.categoryId);
                return (
                  <div key={item.id} className={cn("bg-card text-card-foreground rounded-xl border-2 p-4", item.completed && "opacity-60")}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleComplete(item.id, item.completed)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className={cn("font-medium", item.completed && "line-through")}>{item.title}</h3>
                          {category && (
                            <span 
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white" 
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className={cn("text-sm text-muted-foreground", item.completed && "line-through")}>{item.description}</p>
                        )}
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          {item.dueDate && (
                            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                          )}
                          {item.time && (
                            <span>Time: {item.time}</span>
                          )}
                        </div>
                      </div>
                      <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent h-8 w-8 p-0 text-destructive"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}