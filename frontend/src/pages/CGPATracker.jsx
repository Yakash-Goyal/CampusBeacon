import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { cgpaStorage } from '@/lib/cgpaStorage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2, Plus } from 'lucide-react';

export default function CGPATracker() {
  const [semesters, setSemesters] = useState([]);
  const [currentCGPA, setCurrentCGPA] = useState(0);
  const [semester, setSemester] = useState('');
  const [sgpa, setSgpa] = useState('');
  const [year, setYear] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = cgpaStorage.getData();
    setSemesters(data.semesters);
    setCurrentCGPA(data.currentCGPA);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!semester || !sgpa || !year) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    const sgpaNum = parseFloat(sgpa);
    if (sgpaNum < 0 || sgpaNum > 10) {
      setMessage({ type: 'error', text: 'SGPA must be between 0 and 10' });
      return;
    }

    cgpaStorage.addSemester({
      semester: parseInt(semester),
      sgpa: sgpaNum,
      year,
    });

    setSemester('');
    setSgpa('');
    setYear('');
    loadData();
    setMessage({ type: 'success', text: 'Semester added successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = (sem) => {
    if (window.confirm(`Are you sure you want to delete Semester ${sem.semester}?`)) {
      cgpaStorage.deleteSemester(sem.id);
      loadData();
      setMessage({ type: 'success', text: 'Semester deleted' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">CGPA Tracker</h1>
          <p className="text-muted-foreground">Track your semester grades and overall CGPA</p>
        </div>

        {message && (
          <div className={`p-3 rounded-md mb-4 text-sm ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
            <h3 className="text-lg font-semibold mb-4">Current CGPA</h3>
            <div className="text-5xl font-bold text-primary">{currentCGPA.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on {semesters.length} semester{semesters.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
            <h3 className="text-lg font-semibold mb-4">Add Semester</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="semester" className="text-sm font-medium">Semester</label>
                  <input
                    id="semester"
                    type="number"
                    min="1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="year" className="text-sm font-medium">Year</label>
                  <input
                    id="year"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2024"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="sgpa" className="text-sm font-medium">SGPA</label>
                <input
                  id="sgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sgpa}
                  onChange={(e) => setSgpa(e.target.value)}
                  placeholder="8.50"
                />
              </div>
              <button 
                type="submit" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Semester
              </button>
            </form>
          </div>
        </div>

        {semesters.length > 0 && (
          <>
            <div className="bg-card text-card-foreground rounded-xl border-2 p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">SGPA Trend</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={semesters}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" label={{ value: 'Semester', position: 'insideBottom', offset: -5 }} />
                    <YAxis domain={[0, 10]} label={{ value: 'SGPA', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="sgpa" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card text-card-foreground rounded-xl border-2 p-6">
              <h3 className="text-lg font-semibold mb-4">All Semesters</h3>
              <div className="space-y-2">
                {semesters.map((sem) => (
                  <div
                    key={sem.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">Semester {sem.semester}</p>
                      <p className="text-sm text-muted-foreground">{sem.year}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-primary">{sem.sgpa.toFixed(2)}</div>
                      <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent h-9 w-9 p-0 text-destructive"
                        onClick={() => handleDelete(sem)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}