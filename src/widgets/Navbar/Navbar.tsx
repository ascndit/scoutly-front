import { Link, NavLink } from 'react-router-dom';
import {
    Briefcase,
    Sparkles,
    FileCheck2,
    User,
    LayoutDashboard,
    Inbox,
    Building2,
    RefreshCw,
} from 'lucide-react';

const NAV_ITEMS = [
    { to: '/vacancies', label: 'Вакансии', icon: Briefcase },
    { to: '/my-applications', label: 'Мои отклики', icon: FileCheck2 },
    { to: '/profile', label: 'Профиль', icon: User },
    { to: '/dashboard', label: 'Кабинет HR', icon: LayoutDashboard },
    { to: '/scouting', label: 'Скаутинг', icon: Sparkles },
    { to: '/responses', label: 'Отклики HR', icon: Inbox },
    { to: '/company', label: 'Компания', icon: Building2 },
];

export function Navbar() {
    const activeProfileId =
        localStorage.getItem('scoutly_specialist_profile_id') || '1';
    const activeCompanyId = localStorage.getItem('scoutly_company_id') || '1';

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                <Link to="/vacancies" className="flex items-center gap-2.5 shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-[#1F4E79] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                        S
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Scout<span className="text-[#A80036]">ly</span>
          </span>
                </Link>

                <nav className="hidden lg:flex items-center gap-1">
                    {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
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

                <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition-colors shrink-0"
                    title="Переключить активный профиль или компанию"
                >
                    <span>Профиль #{activeProfileId}</span>
                    <span className="text-slate-300">|</span>
                    <span>Компания #{activeCompanyId}</span>
                    <RefreshCw className="w-3 h-3 text-[#1F4E79]" />
                </Link>
            </div>
        </header>
    );
}