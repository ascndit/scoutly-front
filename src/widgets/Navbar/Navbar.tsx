import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Sparkles,
    FileCheck2,
    User,
    LayoutDashboard,
    Inbox,
    Building2,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { useProfileQuery } from '../../features/profiles/api/profilesApi';

const COMPANY_NAMES: Record<number, string> = {
    1: 'Apex Technologies',
    2: 'CloudScale Systems',
    3: 'Nordic Finance Group',
};

const SPECIALIST_NAV = [
    { to: '/vacancies', label: 'Вакансии', icon: Briefcase },
    { to: '/my-applications', label: 'Мои отклики', icon: FileCheck2 },
    { to: '/profile', label: 'Профиль', icon: User },
];

const EMPLOYER_NAV = [
    { to: '/dashboard', label: 'Кабинет HR', icon: LayoutDashboard },
    { to: '/scouting', label: 'Скаутинг', icon: Sparkles },
    { to: '/responses', label: 'Отклики', icon: Inbox },
    { to: '/vacancies', label: 'Все вакансии', icon: Briefcase },
    { to: '/company', label: 'Компания', icon: Building2 },
];

export function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('scoutly_authenticated') === 'true';
    });

    const [role, setRole] = useState<'specialist' | 'employer'>(() => {
        return localStorage.getItem('scoutly_role') === 'employer'
            ? 'employer'
            : 'specialist';
    });

    const [profileId, setProfileId] = useState<number>(() => {
        return Number(localStorage.getItem('scoutly_specialist_profile_id') || '1');
    });

    const [companyId, setCompanyId] = useState<number>(() => {
        return Number(localStorage.getItem('scoutly_company_id') || '1');
    });

    useEffect(() => {
        const syncAuth = () => {
            setIsAuthenticated(
                localStorage.getItem('scoutly_authenticated') === 'true'
            );
            setRole(
                localStorage.getItem('scoutly_role') === 'employer'
                    ? 'employer'
                    : 'specialist'
            );
            setProfileId(
                Number(localStorage.getItem('scoutly_specialist_profile_id') || '1')
            );
            setCompanyId(Number(localStorage.getItem('scoutly_company_id') || '1'));
        };

        syncAuth();
        window.addEventListener('scoutly-auth-change', syncAuth);
        window.addEventListener('storage', syncAuth);
        return () => {
            window.removeEventListener('scoutly-auth-change', syncAuth);
            window.removeEventListener('storage', syncAuth);
        };
    }, [location.pathname]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const { data: profile } = useProfileQuery(
        isAuthenticated && role === 'specialist' ? profileId : 0
    );

    const handleLogout = () => {
        localStorage.removeItem('scoutly_authenticated');
        localStorage.removeItem('scoutly_role');
        window.dispatchEvent(new Event('scoutly-auth-change'));
        navigate('/auth', { replace: true });
    };

    const navItems = role === 'employer' ? EMPLOYER_NAV : SPECIALIST_NAV;
    const displayName =
        role === 'employer'
            ? COMPANY_NAMES[companyId] ?? 'Работодатель'
            : profile?.fullName || 'Специалист';

    const showControls = isAuthenticated && location.pathname !== '/auth';

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                <Link
                    to={
                        !showControls
                            ? '/auth'
                            : role === 'employer'
                                ? '/dashboard'
                                : '/vacancies'
                    }
                    className="flex items-center gap-2.5 shrink-0"
                >
                    <div className="w-9 h-9 rounded-xl bg-[#1F4E79] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                        S
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Scout<span className="text-[#A80036]">ly</span>
          </span>
                </Link>

                {showControls && (
                    <>
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map(({ to, label, icon: Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                            isActive
                                                ? 'bg-[#1F4E79] text-white'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`
                                    }
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex flex-col items-end text-right mr-1">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {displayName}
                </span>
                                <span className="text-[11px] text-slate-400 leading-tight">
                  {role === 'employer' ? 'Работодатель' : 'Соискатель'}
                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-[#A80036] text-xs font-semibold text-slate-700 transition-colors shrink-0"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Выйти</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen((prev) => !prev)}
                                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                                aria-label="Открыть меню"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {showControls && mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                                    isActive
                                        ? 'bg-[#1F4E79] text-white'
                                        : 'text-slate-700 hover:bg-slate-100'
                                }`
                            }
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </NavLink>
                    ))}
                </div>
            )}
        </header>
    );
}