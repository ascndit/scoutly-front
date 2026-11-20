import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './widgets/Navbar/Navbar';
import { AuthPage } from './pages/AuthPage';
import { VacanciesFeedPage } from './pages/VacanciesFeedPage';
import { VacancyEditorPage } from './pages/VacancyEditorPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EmployerDashboardPage } from './pages/EmployerDashboardPage';
import { ScoutingWorkspacePage } from './pages/ScoutingWorkspacePage';
import { EmployerResponsesPage } from './pages/EmployerResponsesPage';
import { CompanyProfilePage } from './pages/CompanyProfilePage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
    const isAuthenticated =
        localStorage.getItem('scoutly_authenticated') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
}

function RootRedirect() {
    const isAuthenticated =
        localStorage.getItem('scoutly_authenticated') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    const role = localStorage.getItem('scoutly_role');
    return (
        <Navigate
            to={role === 'employer' ? '/dashboard' : '/vacancies'}
            replace
        />
    );
}

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <div className="min-h-screen bg-slate-50 text-slate-900">
                    <Navbar />
                    <main>
                        <Routes>
                            <Route path="/" element={<RootRedirect />} />
                            <Route path="/auth" element={<AuthPage />} />

                            <Route
                                path="/vacancies"
                                element={
                                    <RequireAuth>
                                        <VacanciesFeedPage />
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="/vacancies/create"
                                element={
                                    <RequireAuth>
                                        <VacancyEditorPage />
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="/my-applications"
                                element={
                                    <RequireAuth>
                                        <MyApplicationsPage />
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <RequireAuth>
                                        <ProfilePage />
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <RequireAuth>
                                        <EmployerDashboardPage />
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="/scouting"
                                element={
                                    <RequireAuth>
                                        <ScoutingWorkspacePage />
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="/responses"
                                element={
                                    <RequireAuth>
                                        <EmployerResponsesPage />
                                    </RequireAuth>
                                }
                            />
                            <Route
                                path="/company"
                                element={
                                    <RequireAuth>
                                        <CompanyProfilePage />
                                    </RequireAuth>
                                }
                            />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;