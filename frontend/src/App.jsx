import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import KanbanBoard from "./pages/KanbanBoard";
import Register from "./pages/Register";
import Members from "./pages/Members";
import { clearToken, getToken } from "./services/api";

function PrivateRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

function TopNav({ theme, onToggleTheme }) {
  const token = getToken();
  const nav = useNavigate();

  function handleLogout() {
    clearToken();
    nav("/login");
  }

  return (
    <header className="app-nav">
      <Link to="/projects" className="app-brand">
        TrackSys
      </Link>
      <div className="flex items-center gap-2">
        <button onClick={onToggleTheme} className="app-btn app-btn-ghost">
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        {token ? (
          <>
            <Link to="/projects" className="app-btn app-btn-ghost">
              Projects
            </Link>
            <button onClick={handleLogout} className="app-btn app-btn-danger">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="app-btn app-btn-ghost">
              Login
            </Link>
            <Link to="/register" className="app-btn app-btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("tracksys_theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tracksys_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app-shell">
        <TopNav theme={theme} onToggleTheme={toggleTheme} />
        <main className="app-main">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <Projects />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <PrivateRoute>
                  <KanbanBoard />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:id/members"
              element={
                <PrivateRoute>
                  <Members />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
