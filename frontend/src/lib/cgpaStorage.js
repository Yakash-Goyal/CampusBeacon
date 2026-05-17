const STORAGE_KEY = 'student_cgpa_data';

export const cgpaStorage = {
  getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return { semesters: [], currentCGPA: 0 };
  },

  saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  addSemester(semester) {
    const data = this.getData();
    const newSemester = {
      ...semester,
      id: Date.now().toString(),
    };
    data.semesters.push(newSemester);
    data.semesters.sort((a, b) => a.semester - b.semester);
    data.currentCGPA = this.calculateCGPA(data.semesters);
    this.saveData(data);
  },

  updateSemester(id, updates) {
    const data = this.getData();
    const index = data.semesters.findIndex(s => s.id === id);
    if (index !== -1) {
      data.semesters[index] = { ...data.semesters[index], ...updates };
      data.currentCGPA = this.calculateCGPA(data.semesters);
      this.saveData(data);
    }
  },

  deleteSemester(id) {
    const data = this.getData();
    data.semesters = data.semesters.filter(s => s.id !== id);
    data.currentCGPA = this.calculateCGPA(data.semesters);
    this.saveData(data);
  },

  calculateCGPA(semesters) {
    if (semesters.length === 0) return 0;
    const total = semesters.reduce((sum, sem) => sum + sem.sgpa, 0);
    return parseFloat((total / semesters.length).toFixed(2));
  }
};