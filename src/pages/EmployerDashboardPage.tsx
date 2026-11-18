import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Users, Briefcase, Eye, PauseCircle, PlayCircle, Archive } from 'lucide-react';
import { Button } from '../shared/ui/Button';

interface EmployerVacancy {
    id: string;
    title: string;
    grade: string;
    salary: string;
    responsesCount: number;
    newResponses: number;
    status: 'Active' | 'Paused' | 'Archived';
}

const INITIAL_VACANCIES: EmployerVacancy[] = [
    {
        id: '1',
        title: 'Backend-разработчик (C# / .NET 9)',
        grade: 'Middle',
        salary: '180 000 – 260 000 ₽',
        responsesCount: 24,
        newResponses: 5,
        status: 'Active',
    },
    {
        id: '2',
        title: 'Frontend-разработчик (React + TypeScript)',
        grade: 'Middle',
        salary: '160 000 – 240 000 ₽',
        responsesCount: 18,
        newResponses: 2,
        status: 'Active',
    },
    {
        id: '3',
        title: 'QA Automation Engineer (Python)',
        grade: 'Junior',
        salary: '90 000 – 130 000 ₽',
        responsesCount: 11,
        newResponses: 0,
        status: 'Paused',
    },
];

export function EmployerDashboardPage() {
    const [vacancies, setVacancies] = useState<EmployerVacancy[]>(INITIAL_VACANCIES);

    const toggleStatus = (id: string, nextStatus: EmployerVacancy['status']) => {
        setVacancies((prev) =>
            prev.map((v) => (v.id === id ? { ...v, status: nextStatus } : v))
        );
    };

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-scoutly-dark">Кабинет работодателя</h1>
                    <p className="text-sm text-scoutly-muted mt-1">
                        Управление опубликованными вакансиями и входящими откликами
                    </p>
                </div>
                <Link to="/employer/create">
                    <Button variant="action">
                        <PlusCircle className="h-4 w-4" />
                        <span>Создать вакансию</span>
                    </Button>
                </Link>
            </div>

            {/* Сводные карточки аналитики (SCR-W01) */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Активных вакансий', value: vacancies.filter((v) => v.status === 'Active').length, icon: Briefcase, color: 'text-scoutly-primary' },
                    { label: 'Всего откликов', value: 53, icon: Users, color: 'text-scoutly-accent' },
                    { label: 'Непросмотренных', value: 7, icon: Eye, color: 'text-scoutly-action' },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            whileHover={{ y: -2 }}
                            className="rounded-lg bg-white p-5 border border-gray-100 shadow-xs flex items-center justify-between"
                        >
                            <div>
                                <div className="text-xs font-medium text-scoutly-muted">{stat.label}</div>
                                <div className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-scoutly-bg flex items-center justify-center">
                                <Icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Список вакансий компании (US-12) */}
            <div className="space-y-3">
                {vacancies.map((v) => (
                    <div
                        key={v.id}
                        className="rounded-lg bg-white p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className="text-base font-semibold text-scoutly-dark">{v.title}</h3>
                                <span className="rounded-md bg-scoutly-bg px-2 py-0.5 text-xs font-medium text-scoutly-primary">
                  {v.grade}
                </span>
                                <span
                                    className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                                        v.status === 'Active'
                                            ? 'bg-status-success/15 text-status-success'
                                            : v.status === 'Paused'
                                                ? 'bg-status-warning/20 text-amber-800'
                                                : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                  {v.status === 'Active' ? 'Активна' : v.status === 'Paused' ? 'На паузе' : 'В архиве'}
                </span>
                            </div>
                            <div className="text-xs text-scoutly-muted mt-1.5">
                                Вилка: <span className="font-medium text-scoutly-dark">{v.salary}</span> • Откликов:{' '}
                                <span className="font-semibold text-scoutly-primary">{v.responsesCount}</span>{' '}
                                {v.newResponses > 0 && (
                                    <span className="text-scoutly-action font-semibold">(+{v.newResponses} новых)</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link to="/employer/responses">
                                <Button variant="secondary" className="py-2 px-3 text-xs">
                                    Отклики
                                </Button>
                            </Link>
                            {v.status === 'Active' ? (
                                <button
                                    type="button"
                                    onClick={() => toggleStatus(v.id, 'Paused')}
                                    className="p-2 rounded-lg text-scoutly-muted hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                                    title="Приостановить"
                                >
                                    <PauseCircle className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => toggleStatus(v.id, 'Active')}
                                    className="p-2 rounded-lg text-scoutly-muted hover:text-status-success hover:bg-green-50 cursor-pointer"
                                    title="Активировать"
                                >
                                    <PlayCircle className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => toggleStatus(v.id, 'Archived')}
                                className="p-2 rounded-lg text-scoutly-muted hover:text-status-danger hover:bg-red-50 cursor-pointer"
                                title="В архив"
                            >
                                <Archive className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}