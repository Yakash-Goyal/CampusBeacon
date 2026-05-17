const CATEGORIES_KEY = 'todo_categories';
const ITEMS_KEY = 'todo_items';

export const todoStorage = {
  // Categories
  getCategories() {
    const data = localStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCategories(categories) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  },

  addCategory(category) {
    const categories = this.getCategories();
    categories.push(category);
    this.saveCategories(categories);
  },

  updateCategory(id, updates) {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      this.saveCategories(categories);
    }
  },

  deleteCategory(id) {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(categories);
    // Also delete all items in this category
    const items = this.getItems().filter(item => item.categoryId !== id);
    this.saveItems(items);
  },

  // Items
  getItems() {
    const data = localStorage.getItem(ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveItems(items) {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  },

  addItem(item) {
    const items = this.getItems();
    items.push(item);
    this.saveItems(items);
  },

  updateItem(id, updates) {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.saveItems(items);
    }
  },

  deleteItem(id) {
    const items = this.getItems().filter(i => i.id !== id);
    this.saveItems(items);
  },

  getItemsByCategory(categoryId) {
    return this.getItems().filter(item => item.categoryId === categoryId);
  },

  getStats() {
    const items = this.getItems();
    const completed = items.filter(i => i.completed).length;
    const pending = items.filter(i => !i.completed).length;
    return { total: items.length, completed, pending };
  }
};
