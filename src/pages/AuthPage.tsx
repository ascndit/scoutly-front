import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserCheck,
    Building2,
    ArrowRight,
    Lock,
    Mail,
    CheckCircle2,
} from 'lucide-react';
import { useProfileQuery } from '../features/profiles/api/profilesApi';

const COMPANIES = [
    { id: 1, name: 'Apex Technologies', subtitle: 'Enterprise SaaS & Highload' },
    { id: 2, name: 'CloudScale Systems', subtitle: 'Cloud Infrastructure & DevOps' },
    { id: 3, name: 'Nordic Finance Group', subtitle: 'FinTech & Banking' },
];

export function AuthPage() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'specialist' | 'employer'>(
        'specialist'
    );
    const [email, setEmail] = useState('volkov.dev@scoutly.ru');
    const [password, setPassword] = useState('••••••••••••');

    const [specialistId, setSpecialistId] = useState<number>(1);
    const [companyId, setCompanyId] = useState<number>(1);

    const { data: profilePreview } = useProfileQuery(
        activeTab === 'specialist' ? specialistId : 0
    );

    const handleTabSwitch = (tab: 'specialist' | 'employer') => {
        setActiveTab(tab);
        setEmail(
            tab === 'specialist'
                ? 'volkov.dev@scoutly.ru'
                : 'hr@apex-technologies.ru'
        );
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        localStorage.setItem('scoutly_authenticated', 'true');
        localStorage.setItem('scoutly_role', activeTab);

        if (activeTab === 'specialist') {
            localStorage.setItem(
                'scoutly_specialist_profile_id',
                String(specialistId)
            );
            window.dispatchEvent(new Event('scoutly-auth-change'));
            navigate('/vacancies', { replace: true });
        } else {
            localStorage.setItem('scoutly_company_id', String(companyId));
            window.dispatchEvent(new Event('scoutly-auth-change'));
            navigate('/dashboard', { replace: true });
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-slate-900">
                        Вход в Scoutly
                    </h1>
                    <p className="text-xs text-slate-500">
                        Выберите тип аккаунта и войдите в личный кабинет
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100">
                    <button
                        type="button"
                        onClick={() => handleTabSwitch('specialist')}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'specialist'
                                ? 'bg-white text-[#1F4E79] shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <UserCheck className="w-3.5 h-3.5" />
                        Соискатель
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabSwitch('employer')}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === 'employer'
                                ? 'bg-white text-[#A80036] shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Building2 className="w-3.5 h-3.5" />
                        Работодатель
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Электронная почта
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.ru"
                                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#1F4E79] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Пароль
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введите пароль"
                                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#1F4E79] focus:outline-none"
                            />
                        </div>
                    </div>

                    {activeTab === 'specialist' ? (
                        <div className="space-y-2.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Профиль специалиста
                                </label>
                                <select
                                    value={specialistId}
                                    onChange={(e) => setSpecialistId(Number(e.target.value))}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-[#1F4E79] focus:outline-none"
                                >
                                    <option value={1}>Основной профиль</option>
                                    <option value={2}>Второй профиль</option>
                                    <option value={3}>Дополнительный профиль</option>
                                </select>
                            </div>

                            {profilePreview && (
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-0.5">
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {profilePreview.fullName}
                                    </div>
                                    {profilePreview.headline && (
                                        <div className="text-emerald-700">
                                            {profilePreview.headline}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Компания работодателя
                            </label>
                            <select
                                value={companyId}
                                onChange={(e) => setCompanyId(Number(e.target.value))}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-[#1F4E79] focus:outline-none"
                            >
                                {COMPANIES.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.subtitle})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors shadow-sm ${
                            activeTab === 'specialist'
                                ? 'bg-[#1F4E79] hover:bg-[#173b5c]'
                                : 'bg-[#A80036] hover:bg-[#8a002c]'
                        }`}
                    >
                        {activeTab === 'specialist'
                            ? 'Войти как соискатель'
                            : 'Войти как работодатель'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}