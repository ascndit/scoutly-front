import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './features/auth/store/useAuthStore';
import { AuthPage } from './pages/AuthPage';
import { VacanciesFeedPage } from './pages/VacanciesFeedPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EmployerDashboardPage } from './pages/EmployerDashboardPage';
import { VacancyEditorPage } from './pages/VacancyEditorPage';
import { EmployerResponsesPage } from './pages/EmployerResponsesPage';
import { CompanyProfilePage } from './pages/CompanyProfilePage';
import { ScoutingWorkspacePage } from './pages/ScoutingWorkspacePage';
import { Navbar } from './widgets/Navbar/Navbar';

function AppRoutes() {
    const { user } = useAuth();

    if (!user) {
        return (
            <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
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

                {/* Маршруты Работодателя и Скаутинга */}
                <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
                <Route path="/employer/create" element={<VacancyEditorPage />} />
                <Route path="/employer/responses" element={<EmployerResponsesPage />} />
                <Route path="/employer/company" element={<CompanyProfilePage />} />
                <Route path="/scouting" element={<ScoutingWorkspacePage />} />

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

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;