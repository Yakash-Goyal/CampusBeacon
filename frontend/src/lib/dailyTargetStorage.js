const TARGETS_KEY = 'daily_targets';

export const dailyTargetStorage = {
  getTargets() {
    const data = localStorage.getItem(TARGETS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveTargets(targets) {
    localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
  },

  addTarget(target) {
    const targets = this.getTargets();
    targets.push(target);
    this.saveTargets(targets);
  },

  updateTarget(id, updates) {
    const targets = this.getTargets();
    const index = targets.findIndex(t => t.id === id);
    if (index !== -1) {
      targets[index] = { ...targets[index], ...updates };
      this.saveTargets(targets);
    }
  },

  deleteTarget(id) {
    const targets = this.getTargets().filter(t => t.id !== id);
    this.saveTargets(targets);
  },

  getTargetsByDate(date) {
    return this.getTargets().filter(t => t.date === date);
  },

  getTodayTargets() {
    const today = new Date().toISOString().split('T')[0];
    return this.getTargetsByDate(today);
  },

  getStats(date) {
    const targets = date ? this.getTargetsByDate(date) : this.getTodayTargets();
    const completed = targets.filter(t => {
      if (t.trackingType === 'time') {
        return t.timeSpent && t.timeSpent >= (t.timeTarget || 0);
      } else if (t.trackingType === 'amount') {
        return t.amountCompleted && t.amountCompleted >= (t.amountTarget || 0);
      } else {
        return t.isCompleted;
      }
    }).length;
    return {
      total: targets.length,
      completed,
      pending: targets.length - completed
    };
  }
};
