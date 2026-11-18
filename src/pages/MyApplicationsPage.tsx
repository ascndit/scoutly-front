import { motion } from 'framer-motion';
import { Building2, Calendar, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { Application } from '../shared/types/entities';

const MOCK_APPLICATIONS: Application[] = [
    {
        id: 'a1',
        candidateId: 'u1',
        vacancyId: '1',
        vacancyTitle: 'Backend-разработчик (C# / .NET 9)',
        companyName: 'Яндекс',
        coverLetter: 'Имею опыт разработки на ASP.NET Core, PostgreSQL и Vertical Slice Architecture.',
        status: 'Interview',
        appliedAt: '18 ноября 2026',
    },
    {
        id: 'a2',
        candidateId: 'u1',
        vacancyId: '2',
        vacancyTitle: 'Frontend-разработчик (React + TypeScript)',
        companyName: 'Тинькофф Технологии',
        status: 'Reviewing',
        appliedAt: '17 ноября 2026',
    },
    {
        id: 'a3',
        candidateId: 'u1',
        vacancyId: '3',
        vacancyTitle: 'Junior .NET Developer (Стажировка)',
        companyName: 'VK Tech',
        status: 'New',
        appliedAt: '16 ноября 2026',
    },
];

const STATUS_CONFIG: Record<
    Application['status'],
    { label: string; badgeClass: string; icon: typeof Clock }
> = {
    New: {
        label: 'Отправлен',
        badgeClass: 'bg-scoutly-accent/15 text-scoutly-primary border-scoutly-accent/30',
        icon: Clock,
    },
    Reviewing: {
        label: 'На рассмотрении',
        badgeClass: 'bg-status-warning/15 text-amber-800 border-status-warning/40',
        icon: Sparkles,
    },
    Interview: {
        label: 'Приглашение на интервью',
        badgeClass: 'bg-status-success/15 text-status-success border-status-success/30',
        icon: CheckCircle2,
    },
    Offer: {
        label: 'Оффер',
        badgeClass: 'bg-status-success text-white border-status-success',
        icon: CheckCircle2,
    },
    Rejected: {
        label: 'Отказ',
        badgeClass: 'bg-status-danger/12 text-status-danger border-status-danger/30',
        icon: XCircle,
    },
};

export function MyApplicationsPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-scoutly-dark">Мои отклики</h1>
                <p className="text-sm text-scoutly-muted mt-1">
                    Отслеживание статусов рассмотрения ваших резюме работодателями
                </p>
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                className="space-y-4"
            >
                {MOCK_APPLICATIONS.map((app) => {
                    const cfg = STATUS_CONFIG[app.status];
                    const Icon = cfg.icon;
                    return (
                        <motion.div
                            key={app.id}
                            variants={{
                                hidden: { opacity: 0, y: 12 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            className="rounded-lg bg-white p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="space-y-1.5">
                                <h3 className="text-base font-semibold text-scoutly-dark">{app.vacancyTitle}</h3>
                                <div className="flex items-center gap-3 text-xs text-scoutly-muted">
                  <span className="inline-flex items-center gap-1 font-medium text-scoutly-dark">
                    <Building2 className="h-3.5 w-3.5 text-scoutly-accent" />
                      {app.companyName}
                  </span>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                                        {app.appliedAt}
                  </span>
                                </div>
                                {app.coverLetter && (
                                    <p className="text-xs text-scoutly-muted bg-scoutly-bg p-2.5 rounded-md mt-2 max-w-2xl">
                                        «{app.coverLetter}»
                                    </p>
                                )}
                            </div>

                            <div
                                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold shrink-0 ${cfg.badgeClass}`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{cfg.label}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}