import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/store/useAuthStore';
import { AuthPage } from './pages/AuthPage';
import { VacanciesFeedPage } from './pages/VacanciesFeedPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EmployerDashboardPage } from './pages/EmployerDashboardPage';
import { VacancyEditorPage } from './pages/VacancyEditorPage';
import { EmployerResponsesPage } from './pages/EmployerResponsesPage';
import { Navbar } from './widgets/Navbar/Navbar';

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
          <Route path="/employer/company" element={<CompanyProfilePage />} />
          <Route path="/scouting" element={<ScoutingWorkspacePage />} />
        </Routes>
    );
  }

  return (
      <div className="min-h-screen bg-scoutly-bg">
        <Navbar />
        <Routes>
          {/* Маршруты Соискателя */}
          <Route path="/vacancies" element={<VacanciesFeedPage />} />
          <Route path="/applications" element={<MyApplicationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Маршруты Работодателя (SCR-W01..W03) */}
          <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
          <Route path="/employer/create" element={<VacancyEditorPage />} />
          <Route path="/employer/responses" element={<EmployerResponsesPage />} />

          <Route
              path="*"
              element={
                <Navigate
                    to={user.role === 'Employer' ? '/employer/dashboard' : '/vacancies'}
                    replace
                />
              }
          />
        </Routes>
      </div>
  );
}

export function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
  );
}

export default App;