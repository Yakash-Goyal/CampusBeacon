import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { attendanceStorage } from '@/lib/attendanceStorage';
import { Plus, Trash2, Check, X, SkipForward } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function AttendanceTracker() {
  const [data, setData] = useState({ subjects: [], schedule: [], records: [] });
  const [subjectName, setSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [scheduleDay, setScheduleDay] = useState('');
  const [scheduleSubject, setScheduleSubject] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('subjects');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setData(attendanceStorage.getData());
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!subjectName) {
      setMessage({ type: 'error', text: 'Please enter subject name' });
      return;
    }
    attendanceStorage.addSubject(subjectName, selectedColor);
    setSubjectName('');
    setSelectedColor(COLORS[0]);
    loadData();
    setMessage({ type: 'success', text: 'Subject added!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteSubject = (id) => {
    if (window.confirm('Are you sure you want to delete this subject and all its records?')) {
      attendanceStorage.deleteSubject(id);
      loadData();
      setMessage({ type: 'success', text: 'Subject deleted' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!scheduleDay || !scheduleSubject || !startTime || !endTime) {
      setMessage({ type: 'error', text: 'Please fill all schedule fields' });
      return;
    }
    attendanceStorage.addScheduleSlot({
      day: scheduleDay,
      subjectId: scheduleSubject,
      startTime,
      endTime,
    });
    setScheduleDay('');
    setScheduleSubject('');
    setStartTime('');
    setEndTime('');
    loadData();
    setMessage({ type: 'success', text: 'Schedule added!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteSchedule = (id) => {
    if (window.confirm('Are you sure you want to delete this schedule slot?')) {
      attendanceStorage.deleteScheduleSlot(id);
      loadData();
      setMessage({ type: 'success', text: 'Schedule deleted' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleMarkAttendance = (subjectId, status) => {
    attendanceStorage.markAttendance(selectedDate, subjectId, status);
    loadData();
    const statusLabel = status === 'skip' ? 'Skipped (No class)' : status;
    setMessage({ type: 'success', text: `Marked ${statusLabel}` });
    setTimeout(() => setMessage(null), 3000);
  };

  const getScheduleForDate = () => {
    const dayName = format(new Date(selectedDate), 'EEEE');
    return data.schedule.filter(s => s.day === dayName);
  };

  const getAttendanceForDate = () => {
    return attendanceStorage.getAttendanceForDate(selectedDate);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Attendance Tracker</h1>
          <p className="text-muted-foreground">Manage subjects, schedule, and track attendance</p>
        </div>

        {message && (
          <div className={`p-3 rounded-md mb-4 text-sm ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
            {message.text}
          </div>
        )}

        <div className="w-full">
          <div className="flex p-1 bg-secondary rounded-lg mb-6 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab('subjects')}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'subjects' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              Subjects
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'schedule' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'attendance' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'stats' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              Statistics
            </button>
          </div>

          {activeTab === 'subjects' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
                <h3 className="text-lg font-semibold mb-4">Add Subject</h3>
                <form onSubmit={handleAddSubject} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="subjectName" className="text-sm font-medium leading-none">Subject Name</label>
                    <input
                      id="subjectName"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      placeholder="Mathematics"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Color</label>
                    <div className="flex gap-2 mt-2">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedColor === color ? 'border-foreground' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Subject
                  </button>
                </form>
              </div>

              <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
                <h3 className="text-lg font-semibold mb-4">Your Subjects</h3>
                <div className="space-y-2">
                  {data.subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-medium">{subject.name}</span>
                      </div>
                      <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent h-9 w-9 p-0 text-destructive"
                        onClick={() => handleDeleteSubject(subject.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {data.subjects.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No subjects added yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
                <h3 className="text-lg font-semibold mb-4">Add Schedule</h3>
                <form onSubmit={handleAddSchedule} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="day" className="text-sm font-medium leading-none">Day</label>
                    <select 
                      value={scheduleDay} 
                      onChange={(e) => setScheduleDay(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select day</option>
                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium leading-none">Subject</label>
                    <select 
                      value={scheduleSubject} 
                      onChange={(e) => setScheduleSubject(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select subject</option>
                      {data.subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="startTime" className="text-sm font-medium leading-none">Start Time</label>
                      <input
                        id="startTime"
                        type="time"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="endTime" className="text-sm font-medium leading-none">End Time</label>
                      <input
                        id="endTime"
                        type="time"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full gap-2 disabled:opacity-50"
                    disabled={data.subjects.length === 0}
                  >
                    <Plus className="h-4 w-4" />
                    Add to Schedule
                  </button>
                </form>
              </div>

              <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
                <div className="space-y-4">
                  {DAYS.map((day) => {
                    const daySchedule = data.schedule.filter(s => s.day === day);
                    return (
                      <div key={day}>
                        <h3 className="font-semibold mb-2">{day}</h3>
                        <div className="space-y-2 ml-4">
                          {daySchedule.map((slot) => {
                            const subject = data.subjects.find(s => s.id === slot.subjectId);
                            return (
                              <div
                                key={slot.id}
                                className="flex items-center justify-between p-2 rounded border text-sm bg-card hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: subject?.color }}
                                  />
                                  <span>{subject?.name}</span>
                                  <span className="text-muted-foreground">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>
                                <button
                                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent h-6 w-6 p-0 text-destructive"
                                  onClick={() => handleDeleteSchedule(slot.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                          {daySchedule.length === 0 && (
                            <p className="text-sm text-muted-foreground">No classes</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
                <h3 className="text-lg font-semibold mb-4">Select Date</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Mark Attendance - {format(new Date(selectedDate), 'PPP')}
                </h3>
                {getScheduleForDate().length > 0 ? (
                  <div className="space-y-3">
                    {getScheduleForDate().map((slot) => {
                      const subject = data.subjects.find(s => s.id === slot.subjectId);
                      const attendance = getAttendanceForDate().find(
                        a => a.subjectId === slot.subjectId
                      );
                      return (
                        <div
                          key={slot.id}
                          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: subject?.color }}
                              />
                              <span className="font-semibold">{subject?.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className={cn(
                                "flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 gap-2",
                                attendance?.status === 'present' ? "bg-primary text-primary-foreground" : "border border-input bg-background hover:bg-accent"
                              )}
                              onClick={() => handleMarkAttendance(slot.subjectId, 'present')}
                            >
                              <Check className="h-4 w-4" />
                              Present
                            </button>
                            <button
                              className={cn(
                                "flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 gap-2",
                                attendance?.status === 'absent' ? "bg-destructive text-destructive-foreground" : "border border-input bg-background hover:bg-accent"
                              )}
                              onClick={() => handleMarkAttendance(slot.subjectId, 'absent')}
                            >
                              <X className="h-4 w-4" />
                              Absent
                            </button>
                            <button
                              className={cn(
                                "flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 gap-2",
                                attendance?.status === 'skip' ? "bg-secondary text-secondary-foreground" : "border border-input bg-background hover:bg-accent"
                              )}
                              onClick={() => handleMarkAttendance(slot.subjectId, 'skip')}
                            >
                              <SkipForward className="h-4 w-4" />
                              Skip
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No classes scheduled for this day
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
              <h3 className="text-lg font-semibold mb-4">Attendance Statistics</h3>
              <div className="space-y-4">
                {data.subjects.map((subject) => {
                  const stats = attendanceStorage.getAttendanceStats(subject.id);
                  return (
                    <div key={subject.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="font-medium">{subject.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg">{stats.percentage}%</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({stats.present}/{stats.total} classes)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${stats.percentage}%`,
                            backgroundColor: subject.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {data.subjects.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Add subjects to see attendance statistics
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
