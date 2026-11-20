import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText,
    Building2,
    Clock,
    CheckCircle2,
    XCircle,
    Sparkles,
    ExternalLink,
} from 'lucide-react';
import { useMyApplicationsQuery } from '../features/applications/api/applicationsApi';

const STATUS_MAP: Record<
    string,
    { label: string; badgeClass: string; icon: typeof Clock }
> = {
    Pending: {
        label: 'На рассмотрении',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Clock,
    },
    Reviewed: {
        label: 'Просмотрено HR',
        badgeClass: 'bg-blue-50 text-[#1F4E79] border-blue-200',
        icon: FileText,
    },
    Interview: {
        label: 'Приглашение на интервью',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: Sparkles,
    },
    Accepted: {
        label: 'Оффер / Принят',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
    },
    Rejected: {
        label: 'Отказ',
        badgeClass: 'bg-rose-50 text-[#A80036] border-rose-200',
        icon: XCircle,
    },
};

export function MyApplicationsPage() {
    const [specialistProfileId, setSpecialistProfileId] = useState<number>(() => {
        const saved = localStorage.getItem('scoutly_specialist_profile_id');
        return saved ? Number(saved) : 1;
    });

    const {
        data: applications = [],
        isLoading,
        isError,
    } = useMyApplicationsQuery(specialistProfileId);

    const handleProfileIdChange = (val: number) => {
        const safeId = val > 0 ? val : 1;
        setSpecialistProfileId(safeId);
        localStorage.setItem('scoutly_specialist_profile_id', String(safeId));
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Мои отклики</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        История отправленных резюме и актуальные статусы из базы Scoutly
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-500">
                        ID профиля соискателя:
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={specialistProfileId}
                        onChange={(e) => handleProfileIdChange(Number(e.target.value))}
                        className="w-20 rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-800 focus:border-[#1F4E79] focus:outline-none"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-28 rounded-2xl bg-slate-200/70 animate-pulse"
                        />
                    ))}
                </div>
            ) : isError ? (
                <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    Не удалось загрузить отклики. Проверьте, запущен ли C#-бэкенд на порту 5202.
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                    <p className="text-slate-600 font-medium">
                        У профиля #{specialistProfileId} пока нет отправленных откликов.
                    </p>
                    <Link
                        to="/vacancies"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A80036] text-white text-sm font-semibold hover:bg-[#8a002c] transition-colors"
                    >
                        Перейти к поиску вакансий
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {applications.map((app) => {
                        const statusInfo = STATUS_MAP[app.status] ?? {
                            label: app.status,
                            badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                            icon: Clock,
                        };
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div
                                key={app.id}
                                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-3"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <h2 className="text-lg font-bold text-slate-900">
                                                {app.vacancyTitle}
                                            </h2>
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}
                                            >
                        <StatusIcon className="w-3.5 h-3.5" />
                                                {statusInfo.label}
                      </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-[#1F4E79]" />
                          {app.companyName}
                      </span>
                                            <span>
                        Отправлен:{' '}
                                                {new Date(app.appliedAt).toLocaleString('ru-RU', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                      </span>
                                        </div>
                                    </div>

                                    <span className="text-xs font-mono text-slate-400">
                    Отклик #{app.id}
                  </span>
                                </div>

                                {app.coverLetter && (
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-500 block mb-1">
                      Сопроводительное письмо:
                    </span>
                                        {app.coverLetter}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}