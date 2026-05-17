const STORAGE_KEY = 'student_attendance_data';

export const attendanceStorage = {
  getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return { subjects: [], schedule: [], records: [] };
  },

  saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Subjects
  addSubject(name, color) {
    const data = this.getData();
    const newSubject = {
      id: Date.now().toString(),
      name,
      color,
    };
    data.subjects.push(newSubject);
    this.saveData(data);
  },

  deleteSubject(id) {
    const data = this.getData();
    data.subjects = data.subjects.filter(s => s.id !== id);
    data.schedule = data.schedule.filter(s => s.subjectId !== id);
    data.records = data.records.filter(r => r.subjectId !== id);
    this.saveData(data);
  },

  // Schedule
  addScheduleSlot(slot) {
    const data = this.getData();
    const newSlot = {
      ...slot,
      id: Date.now().toString(),
    };
    data.schedule.push(newSlot);
    this.saveData(data);
  },

  deleteScheduleSlot(id) {
    const data = this.getData();
    data.schedule = data.schedule.filter(s => s.id !== id);
    this.saveData(data);
  },

  // Attendance Records
  markAttendance(date, subjectId, status) {
    const data = this.getData();
    const existingIndex = data.records.findIndex(
      r => r.date === date && r.subjectId === subjectId
    );
    
    if (existingIndex !== -1) {
      data.records[existingIndex].status = status;
    } else {
      data.records.push({
        id: Date.now().toString(),
        date,
        subjectId,
        status,
      });
    }
    this.saveData(data);
  },

  getAttendanceForDate(date) {
    const data = this.getData();
    return data.records.filter(r => r.date === date);
  },

  getAttendanceStats(subjectId) {
    const data = this.getData();
    // Filter out 'skip' records - they don't count toward attendance
    const records = data.records.filter(r => r.subjectId === subjectId && r.status !== 'skip');
    if (records.length === 0) return { present: 0, total: 0, percentage: 0 };
    const present = records.filter(r => r.status === 'present').length;
    const percentage = parseFloat(((present / records.length) * 100).toFixed(1));
    return { present, total: records.length, percentage };
  },

  getAttendancePercentage(subjectId) {
    return this.getAttendanceStats(subjectId).percentage;
  }
};
