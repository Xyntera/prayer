import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RoleSelectPage from "./pages/RoleSelectPage";
import ImamDashboard from "./pages/ImamDashboard";
import CreateRequestPage from "./pages/CreateRequestPage";
import PartTimeDashboard from "./pages/PartTimeDashboard";
import EditRequestPage from "./pages/EditRequestPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { auth } from "./firebase";

const ProtectedRoutes: React.FC = () => {
  const { appUser, loading } = useAuth();

  if (loading)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );

  if (!appUser) return <Navigate to="/login" replace />;

  // Force profile first
  if (!appUser.name || !appUser.phone) {
    return <Navigate to="/profile" replace />;
  }

  // Force role selection next
  if (!appUser.role) return <Navigate to="/role" replace />;

  return (
    <Routes>
      {appUser.role === "imam" && (
        <>
          <Route path="/imam" element={<ImamDashboard />} />
          <Route path="/imam/create" element={<CreateRequestPage />} />
          <Route path="/imam/edit/:id" element={<EditRequestPage />} />
        </>
      )}
      {appUser.role === "part_time" && (
        <Route path="/part-time" element={<PartTimeDashboard />} />
      )}

      <Route
        path="*"
        element={
          <Navigate
            to={appUser.role === "imam" ? "/imam" : "/part-time"}
            replace
          />
        }
      />
    </Routes>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { appUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#fdf3e6]">
      <header className="sticky top-0 z-10 border-b border-emerald-50 bg-[#fff9ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link className="text-lg font-semibold text-slate-900" to="/">
            Masjid Connect
          </Link>

          {appUser && (
            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={() => navigate("/profile")}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
};

const AppInner: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/role" element={<RoleSelectPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
