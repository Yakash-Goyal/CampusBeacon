import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ExpenseTracker from "./pages/ExpenseTracker";
import CGPATracker from "./pages/CGPATracker";
import AttendanceTracker from "./pages/AttendanceTracker";
import TodoList from "./pages/TodoList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/expenses" element={<ExpenseTracker />} />
        <Route path="/cgpa" element={<CGPATracker />} />
        <Route path="/attendance" element={<AttendanceTracker />} />
        <Route path="/todo" element={<TodoList />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
