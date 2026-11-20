import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserCheck,
    Building2,
    ArrowRight,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';
import { useProfileQuery } from '../features/profiles/api/profilesApi';

const COMPANIES = [
    { id: 1, name: 'Apex Technologies' },
    { id: 2, name: 'CloudScale Systems' },
    { id: 3, name: 'Nordic Finance Group' },
];

export function AuthPage() {
    const navigate = useNavigate();

    const [specialistId, setSpecialistId] = useState<number>(() => {
        const saved = localStorage.getItem('scoutly_specialist_profile_id');
        return saved ? Number(saved) : 1;
    });

    const [companyId, setCompanyId] = useState<number>(() => {
        const saved = localStorage.getItem('scoutly_company_id');
        return saved ? Number(saved) : 1;
    });

    const { data: profilePreview, isError: isProfileNotFound } =
        useProfileQuery(specialistId);

    const handleEnterAsSpecialist = () => {
        localStorage.setItem('scoutly_role', 'specialist');
        localStorage.setItem('scoutly_specialist_profile_id', String(specialistId));
        navigate('/vacancies');
    };

    const handleEnterAsEmployer = () => {
        localStorage.setItem('scoutly_role', 'employer');
        localStorage.setItem('scoutly_company_id', String(companyId));
        navigate('/dashboard');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4E79]/10 text-[#1F4E79] text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#A80036]" />
                    Scoutly Workspace • PostgreSQL Connected
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900">
                    Выбор рабочего профиля
                </h1>
                <p className="text-sm text-slate-500 max-w-xl mx-auto">
                    Переключайтесь между кабинетом соискателя и рабочим местом рекрутера для тестирования откликов, скоринга и воронки найма.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Карточка Соискателя */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1F4E79]/10 text-[#1F4E79] flex items-center justify-center">
                            <UserCheck className="w-6 h-6" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Режим соискателя
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Поиск вакансий, отправка сопроводительных писем, отслеживание статусов откликов и редактирование стека.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                ID профиля специалиста в БД
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={specialistId}
                                onChange={(e) => setSpecialistId(Number(e.target.value) || 1)}
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-[#1F4E79] focus:outline-none"
                            />
                        </div>

                        {profilePreview ? (
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Найден в БД: {profilePreview.fullName}
                                </div>
                                {profilePreview.headline && (
                                    <div className="text-emerald-700">
                                        {profilePreview.headline}
                                    </div>
                                )}
                            </div>
                        ) : (
                            isProfileNotFound && (
                                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                                    Профиль #{specialistId} пока не создан — вы сможете заполнить его на вкладке «Профиль».
                                </div>
                            )
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleEnterAsSpecialist}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F4E79] text-white text-sm font-semibold hover:bg-[#173b5c] transition-colors"
                    >
                        Войти как соискатель
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Карточка Работодателя / Рекрутера */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#A80036] flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Режим работодателя и HR
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Публикация вакансий, интеллектуальный автоподбор кандидатов по навыкам, ведение воронки и разбор откликов.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Выберите компанию (public.companies)
                            </label>
                            <select
                                value={companyId}
                                onChange={(e) => setCompanyId(Number(e.target.value))}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-[#1F4E79] focus:outline-none"
                            >
                                {COMPANIES.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        #{c.id} — {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleEnterAsEmployer}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#A80036] text-white text-sm font-semibold hover:bg-[#8a002c] transition-colors"
                    >
                        Войти как HR / работодатель
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}