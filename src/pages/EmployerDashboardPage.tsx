import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
    Briefcase,
    Plus,
    Sparkles,
    Trash2,
    MapPin,
    Wallet,
    Building2,
    Users,
} from 'lucide-react';
import { useVacanciesQuery } from '../features/vacancies/api/vacanciesApi';
import { api } from '../shared/api/axiosInstance';

interface VacancyItem {
    id: number;
    title: string;
    companyId?: number;
    companyName?: string;
    city?: string | null;
    workFormat?: string | null;
    salaryFrom?: number | null;
    salaryTo?: number | null;
    skills?: string[];
    requiredSkills?: string[];
}

const COMPANY_NAMES: Record<number, string> = {
    1: 'Apex Technologies',
    2: 'CloudScale Systems',
    3: 'Nordic Finance Group',
};

export function EmployerDashboardPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: rawVacancies = [], isLoading } = useVacanciesQuery();
    const vacancies = rawVacancies as VacancyItem[];

    const companyId = Number(localStorage.getItem('scoutly_company_id') || '1');
    const activeCompanyName = COMPANY_NAMES[companyId] ?? 'Моя компания';
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const companyVacancies = useMemo(() => {
        return vacancies.filter((v) => {
            if (v.companyId !== undefined) return v.companyId === companyId;
            if (v.companyName) {
                return v.companyName.toLowerCase() === activeCompanyName.toLowerCase();
            }
            return true;
        });
    }, [vacancies, companyId, activeCompanyName]);

    const stats = useMemo(() => {
        const salaries = companyVacancies
            .map((v) => v.salaryFrom ?? v.salaryTo)
            .filter((s): s is number => typeof s === 'number' && s > 0);

        const avgSalary =
            salaries.length > 0
                ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
                : 0;

        const uniqueSkills = new Set<string>();
        companyVacancies.forEach((v) => {
            (v.skills ?? v.requiredSkills ?? []).forEach((s) => uniqueSkills.add(s));
        });

        return {
            total: companyVacancies.length,
            avgSalary,
            skillsCount: uniqueSkills.size,
        };
    }, [companyVacancies]);

    const handleDeleteVacancy = async (id: number, title: string) => {
        if (!window.confirm(`Удалить вакансию «${title}»?`)) return;

        setDeletingId(id);
        try {
            await api.delete(`/vacancies/${id}`);
            await queryClient.invalidateQueries({ queryKey: ['vacancies'] });
        } catch (err) {
            console.error('Ошибка при удалении вакансии:', err);
            alert('Не удалось удалить вакансию. Попробуйте позже.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleGoToScouting = (vacancyId: number) => {
        localStorage.setItem('scoutly_selected_vacancy_id', String(vacancyId));
        navigate('/scouting');
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="text-xs font-semibold text-[#1F4E79] mb-1">
                        {activeCompanyName}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Кабинет работодателя
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Управление открытыми вакансиями и запуск автоподбора кандидатов
                    </p>
                </div>

                <Link
                    to="/vacancies/create"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#A80036] text-white text-sm font-semibold hover:bg-[#8a002c] transition-colors shadow-sm shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Новая вакансия
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1F4E79]/10 text-[#1F4E79] flex items-center justify-center">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-500">
                            Активных вакансий
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900">
                            {stats.total}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-500">
                            Среднее предложение
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900">
                            {stats.avgSalary > 0
                                ? `${stats.avgSalary.toLocaleString('ru-RU')} ₽`
                                : '—'}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#A80036] flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-500">
                            Ключевых компетенций
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900">
                            {stats.skillsCount}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">
                        Опубликованные вакансии ({companyVacancies.length})
                    </h2>
                    <Link
                        to="/responses"
                        className="text-xs font-semibold text-[#1F4E79] hover:underline"
                    >
                        Входящие отклики →
                    </Link>
                </div>

                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-20 rounded-xl bg-slate-100 animate-pulse"
                            />
                        ))}
                    </div>
                ) : companyVacancies.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                        У вашей компании пока нет опубликованных вакансий. Нажмите «Новая вакансия», чтобы создать первую.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {companyVacancies.map((v) => {
                            const skills = v.skills ?? v.requiredSkills ?? [];
                            return (
                                <div
                                    key={v.id}
                                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                                >
                                    <div className="space-y-1.5">
                                        <h3 className="text-base font-bold text-slate-900">
                                            {v.title}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                            {v.companyName && (
                                                <span className="flex items-center gap-1 font-medium text-[#1F4E79]">
                          <Building2 className="w-3.5 h-3.5" />
                                                    {v.companyName}
                        </span>
                                            )}
                                            {v.city && (
                                                <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                                                    {v.city}
                        </span>
                                            )}
                                            {v.workFormat && <span>{v.workFormat}</span>}
                                            {(v.salaryFrom || v.salaryTo) && (
                                                <span className="font-semibold text-emerald-700">
                          {v.salaryFrom
                              ? `от ${v.salaryFrom.toLocaleString('ru-RU')} ₽`
                              : `до ${v.salaryTo?.toLocaleString('ru-RU')} ₽`}
                        </span>
                                            )}
                                        </div>

                                        {skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {skills.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                                                    >
                            {s}
                          </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleGoToScouting(v.id)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1F4E79] text-white text-xs font-semibold hover:bg-[#173b5c] transition-colors"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Подобрать кандидатов
                                        </button>

                                        <button
                                            type="button"
                                            disabled={deletingId === v.id}
                                            onClick={() => handleDeleteVacancy(v.id, v.title)}
                                            title="Удалить вакансию"
                                            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-[#A80036] hover:border-rose-200 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}