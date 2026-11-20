import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Building2,
    Globe,
    MapPin,
    Briefcase,
    Plus,
} from 'lucide-react';
import { useVacanciesQuery } from '../features/vacancies/api/vacanciesApi';

interface CompanyPreset {
    id: number;
    name: string;
    industry: string;
    city: string;
    website: string;
    description: string;
}

const COMPANIES_DIRECTORY: CompanyPreset[] = [
    {
        id: 1,
        name: 'Apex Technologies',
        industry: 'Enterprise SaaS & Highload',
        city: 'Новосибирск / Remote',
        website: 'https://apex-tech.ru',
        description:
            'Разработка высоконагруженных корпоративных SaaS-систем, инструментов автоматизации рекрутинга и облачных микросервисов на .NET 9 и React.',
    },
    {
        id: 2,
        name: 'CloudScale Systems',
        industry: 'Cloud Infrastructure & DevOps',
        city: 'Москва / Remote',
        website: 'https://cloudscale.ru',
        description:
            'Продуктовая компания, специализирующаяся на облачной инфраструктуре, контейнеризации и отказоустойчивых распределённых хранилищах.',
    },
    {
        id: 3,
        name: 'Nordic Finance Group',
        industry: 'FinTech & Banking',
        city: 'Санкт-Петербург',
        website: 'https://nordicfin.ru',
        description:
            'Финтех-экосистема для дистанционного банковского обслуживания, скоринга транзакций в реальном времени и платёжных шлюзов.',
    },
];

export function CompanyProfilePage() {
    const selectedCompanyId = Number(
        localStorage.getItem('scoutly_company_id') || '1'
    );

    const { data: rawVacancies = [] } = useVacanciesQuery();
    const vacancies = rawVacancies as Array<{
        id: number;
        title: string;
        companyName?: string;
        city?: string | null;
        workFormat?: string | null;
        salaryFrom?: number | null;
    }>;

    const activeCompany = useMemo(
        () =>
            COMPANIES_DIRECTORY.find((c) => c.id === selectedCompanyId) ??
            COMPANIES_DIRECTORY[0],
        [selectedCompanyId]
    );

    const companyVacancies = useMemo(
        () =>
            vacancies.filter(
                (v) =>
                    (v.companyName ?? '').toLowerCase() ===
                    activeCompany.name.toLowerCase()
            ),
        [vacancies, activeCompany]
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#1F4E79] text-white flex items-center justify-center shrink-0">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {activeCompany.name}
                            </h1>
                            <p className="text-sm font-medium text-slate-600 mt-0.5">
                                {activeCompany.industry}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                    {activeCompany.city}
                </span>
                                <a
                                    href={activeCompany.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-[#1F4E79] hover:underline"
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                    {activeCompany.website}
                                </a>
                            </div>
                        </div>
                    </div>

                    <Link
                        to="/vacancies/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A80036] text-white text-sm font-semibold hover:bg-[#8a002c] transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Разместить вакансию
                    </Link>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        О компании
                    </h2>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {activeCompany.description}
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#1F4E79]" />
                    Открытые вакансии ({companyVacancies.length})
                </h2>

                {companyVacancies.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        У компании «{activeCompany.name}» пока нет открытых вакансий.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {companyVacancies.map((v) => (
                            <div
                                key={v.id}
                                className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                            >
                                <div>
                                    <div className="font-bold text-sm text-slate-900">
                                        {v.title}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {v.city ?? 'Город не указан'} • {v.workFormat ?? 'Remote'}
                                    </div>
                                </div>
                                {v.salaryFrom && (
                                    <span className="text-xs font-bold text-emerald-700 shrink-0">
                    от {v.salaryFrom.toLocaleString('ru-RU')} ₽
                  </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}