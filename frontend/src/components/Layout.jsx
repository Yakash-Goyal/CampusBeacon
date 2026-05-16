import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Wallet, Home, Award, Calendar, ListTodo, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';

export function Layout({ children }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const navLinkClass = (isActive) => cn(
    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-smooth",
    isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent hover:text-accent-foreground text-foreground"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 transition-smooth">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-xl bg-gradient-primary shadow-glow transition-all duration-300 group-hover:scale-110">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">StudentHub</span>
            </Link>
            
            <div className="flex items-center gap-1.5">
              <Link to="/" className={navLinkClass(location.pathname === '/')}>
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link to="/expenses" className={navLinkClass(location.pathname === '/expenses')}>
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Expenses</span>
              </Link>
              <Link to="/cgpa" className={navLinkClass(location.pathname === '/cgpa')}>
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">CGPA</span>
              </Link>
              <Link to="/attendance" className={navLinkClass(location.pathname === '/attendance')}>
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Attendance</span>
              </Link>
              <Link to="/todo" className={navLinkClass(location.pathname === '/todo')}>
                <ListTodo className="h-4 w-4" />
                <span className="hidden sm:inline">Todo</span>
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-smooth text-foreground"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      {children}
    </div>
  );
}