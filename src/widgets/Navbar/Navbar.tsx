import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles,
    LogOut,
    Briefcase,
    FileCheck,
    User,
    PlusCircle,
    LayoutDashboard,
    Building2,
} from 'lucide-react';
import { useAuth } from '../../features/auth/store/useAuthStore';
import { NotificationsPopover } from './NotificationsPopover';

export function Navbar() {
    const { user, logout } = useAuth();
    if (!user) return null;

    const applicantLinks = [
        { to: '/vacancies', label: 'Вакансии', icon: Briefcase },
        { to: '/applications', label: 'Мои отклики', icon: FileCheck },
        { to: '/profile', label: 'Профиль', icon: User },
    ];

    const employerLinks = [
        { to: '/employer/dashboard', label: 'Мои вакансии', icon: LayoutDashboard },
        { to: '/employer/create', label: 'Создать вакансию', icon: PlusCircle },
        { to: '/employer/responses', label: 'Входящие отклики', icon: FileCheck },
        { to: '/employer/company', label: 'Профиль компании', icon: Building2 },
        { to: '/scouting', label: 'Скаутинг', icon: Sparkles },
    ];

    const links = user.role === 'Employer' ? employerLinks : applicantLinks;

    return (
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-scoutly-primary text-white">
                            <Sparkles className="h-5 w-5 text-scoutly-accent" />
                        </div>
                        <span className="text-lg font-bold text-scoutly-primary tracking-tight">Scoutly</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        {links.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive ? 'text-scoutly-primary' : 'text-scoutly-muted hover:text-scoutly-dark'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="nav-active-pill"
                                                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                                    className="absolute inset-0 rounded-lg bg-scoutly-primary/8 -z-10"
                                                />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {/* Выпадающее меню уведомлений вместо старой кнопки */}
                    <NotificationsPopover />

                    <div className="hidden sm:flex flex-col items-end text-xs mr-1">
                        <span className="font-medium text-scoutly-dark">{user.email}</span>
                        <span className="text-scoutly-accent font-medium">
              {user.role === 'Employer' ? 'Работодатель' : 'Соискатель'}
            </span>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-scoutly-muted hover:text-status-danger hover:border-status-danger/40 transition-colors cursor-pointer"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Выйти</span>
                    </button>
                </div>
            </div>
        </header>
    );
}