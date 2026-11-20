import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    MapPin,
    Briefcase,
    Wallet,
    Building2,
    CheckCircle2,
    Send,
    Plus,
    X,
} from 'lucide-react';
import { useVacanciesQuery } from '../features/vacancies/api/vacanciesApi';
import {
    useApplyToVacancyMutation,
    useMyApplicationsQuery,
} from '../features/applications/api/applicationsApi';

interface VacancyItem {
    id: number;
    title: string;
    companyName?: string;
    city?: string | null;
    workFormat?: string | null;
    salaryFrom?: number | null;
    salaryTo?: number | null;
    description?: string | null;
    skills?: string[];
    requiredSkills?: string[];
}

export function VacanciesFeedPage() {
    const {
        data: rawVacancies = [],
        isLoading,
        isError,
    } = useVacanciesQuery();

    const vacancies = rawVacancies as VacancyItem[];

    const specialistProfileId = Number(
        localStorage.getItem('scoutly_specialist_profile_id') || '1'
    );

    const { data: myApplications = [] } =
        useMyApplicationsQuery(specialistProfileId);
    const applyMutation = useApplyToVacancyMutation();

    const [searchQuery, setSearchQuery] = useState('');
    const [workFormatFilter, setWorkFormatFilter] = useState('ALL');
    const [cityFilter, setCityFilter] = useState('');

    // Состояние модального окна отклика
    const [applyingVacancy, setApplyingVacancy] = useState<VacancyItem | null>(
        null
    );
    const [coverLetter, setCoverLetter] = useState(
        'Здравствуйте! Заинтересовала ваша вакансия, буду рад обсудить детали.'
    );
    const [feedbackMessage, setFeedbackMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const appliedVacancyIds = useMemo(
        () => new Set(myApplications.map((a) => a.vacancyId)),
        [myApplications]
    );

    const filteredVacancies = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const cityQ = cityFilter.trim().toLowerCase();

        return vacancies.filter((v) => {
            const skillsList = v.skills ?? v.requiredSkills ?? [];
            const matchesQuery =
                !q ||
                v.title.toLowerCase().includes(q) ||
                (v.companyName ?? '').toLowerCase().includes(q) ||
                skillsList.some((s) => s.toLowerCase().includes(q));

            const matchesFormat =
                workFormatFilter === 'ALL' ||
                (v.workFormat ?? '').toLowerCase() === workFormatFilter.toLowerCase();

            const matchesCity =
                !cityQ || (v.city ?? '').toLowerCase().includes(cityQ);

            return matchesQuery && matchesFormat && matchesCity;
        });
    }, [vacancies, searchQuery, workFormatFilter, cityFilter]);

    const formatSalary = (from?: number | null, to?: number | null) => {
        if (from && to) {
            return `${from.toLocaleString('ru-RU')} – ${to.toLocaleString('ru-RU')} ₽`;
        }
        if (from) return `от ${from.toLocaleString('ru-RU')} ₽`;
        if (to) return `до ${to.toLocaleString('ru-RU')} ₽`;
        return 'Зарплата не указана';
    };

    const handleOpenApplyModal = (vacancy: VacancyItem) => {
        setFeedbackMessage(null);
        setApplyingVacancy(vacancy);
    };

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!applyingVacancy) return;

        try {
            await applyMutation.mutateAsync({
                vacancyId: applyingVacancy.id,
                specialistProfileId,
                coverLetter: coverLetter.trim() || null,
            });
            setFeedbackMessage({
                type: 'success',
                text: `Отклик на вакансию «${applyingVacancy.title}» успешно отправлен!`,
            });
            setApplyingVacancy(null);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 409) {
                setFeedbackMessage({
                    type: 'error',
                    text:
                        err.response.data?.message ||
                        'Вы уже откликнулись на эту вакансию.',
                });
            } else {
                setFeedbackMessage({
                    type: 'error',
                    text: 'Ошибка отправки отклика. Проверьте, существует ли профиль соискателя в БД.',
                });
            }
            setApplyingVacancy(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Заголовок и статус API */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-2xl font-bold text-slate-900">
                            Лента вакансий
                        </h1>
                        {!isLoading && !isError && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Подключено к API ({vacancies.length})
              </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        Актуальные позиции из PostgreSQL с прямым откликом в один клик
                    </p>
                </div>

                <Link
                    to="/vacancies/create"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F4E79] text-white text-sm font-semibold hover:bg-[#173b5c] transition-colors shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Создать вакансию
                </Link>
            </div>

            {/* Уведомление об отправке отклика */}
            {feedbackMessage && (
                <div
                    className={`flex items-center justify-between p-4 rounded-xl border text-sm font-medium ${
                        feedbackMessage.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border-rose-200 text-[#A80036]'
                    }`}
                >
                    <span>{feedbackMessage.text}</span>
                    <button
                        type="button"
                        onClick={() => setFeedbackMessage(null)}
                        className="p-1 hover:opacity-70"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Панель поиска и фильтров */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="md:col-span-2 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Должность, компания или навык (C#, React, Docker)..."
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#1F4E79] focus:outline-none"
                    />
                </div>

                <div>
                    <input
                        type="text"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        placeholder="Город (например, Новосибирск)"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:border-[#1F4E79] focus:outline-none"
                    />
                </div>

                <div>
                    <select
                        value={workFormatFilter}
                        onChange={(e) => setWorkFormatFilter(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 focus:border-[#1F4E79] focus:outline-none"
                    >
                        <option value="ALL">Любой формат работы</option>
                        <option value="Remote">Удалённо (Remote)</option>
                        <option value="Hybrid">Гибрид (Hybrid)</option>
                        <option value="Office">Офис (Office)</option>
                    </select>
                </div>
            </div>

            {/* Список карточек вакансий */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-40 rounded-2xl bg-slate-200/70 animate-pulse"
                        />
                    ))}
                </div>
            ) : isError ? (
                <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    Не удалось загрузить вакансии с сервера. Убедитесь, что ASP.NET Core API запущен на порту 5202.
                </div>
            ) : filteredVacancies.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                    Вакансии по заданным фильтрам не найдены.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredVacancies.map((vacancy) => {
                        const skillsList = vacancy.skills ?? vacancy.requiredSkills ?? [];
                        const isApplied = appliedVacancyIds.has(vacancy.id);

                        return (
                            <div
                                key={vacancy.id}
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {vacancy.title}
                                        </h2>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                                            {vacancy.companyName && (
                                                <span className="flex items-center gap-1 font-semibold text-[#1F4E79]">
                          <Building2 className="w-3.5 h-3.5" />
                                                    {vacancy.companyName}
                        </span>
                                            )}
                                            {vacancy.city && (
                                                <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {vacancy.city}
                        </span>
                                            )}
                                            {vacancy.workFormat && (
                                                <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                    {vacancy.workFormat}
                        </span>
                                            )}
                                            <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <Wallet className="w-3.5 h-3.5" />
                                                {formatSalary(vacancy.salaryFrom, vacancy.salaryTo)}
                      </span>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        {isApplied ? (
                                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        Вы откликнулись
                      </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenApplyModal(vacancy)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A80036] text-white text-sm font-semibold hover:bg-[#8a002c] transition-colors shadow-sm"
                                            >
                                                <Send className="w-4 h-4" />
                                                Откликнуться
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {vacancy.description && (
                                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                        {vacancy.description}
                                    </p>
                                )}

                                {skillsList.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {skillsList.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#1F4E79]/10 text-[#1F4E79]"
                                            >
                        {skill}
                      </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Модальное окно отправки отклика */}
            {applyingVacancy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                <span className="text-xs font-semibold text-[#1F4E79]">
                  Отклик от профиля #{specialistProfileId}
                </span>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {applyingVacancy.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setApplyingVacancy(null)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitApplication} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Сопроводительное письмо
                                </label>
                                <textarea
                                    rows={4}
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    placeholder="Расскажите кратко о релевантном опыте..."
                                    className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#1F4E79] focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setApplyingVacancy(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={applyMutation.isPending}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#A80036] text-white text-sm font-semibold hover:bg-[#8a002c] disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    {applyMutation.isPending ? 'Отправка...' : 'Отправить отклик'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VacanciesFeedPage;