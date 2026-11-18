import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, XCircle, Sparkles } from 'lucide-react';
import { Button } from '../shared/ui/Button';

interface IncomingResponse {
    id: string;
    candidateName: string;
    grade: string;
    vacancyTitle: string;
    matchScore: number;
    skills: string[];
    status: 'New' | 'Interview' | 'Rejected';
}

const INITIAL_RESPONSES: IncomingResponse[] = [
    {
        id: 'r1',
        candidateName: 'Алексей Киреев',
        grade: 'Middle',
        vacancyTitle: 'Backend-разработчик (C# / .NET 9)',
        matchScore: 96,
        skills: ['C#', 'ASP.NET Core', 'PostgreSQL', 'Docker'],
        status: 'New',
    },
    {
        id: 'r2',
        candidateName: 'Дмитрий Соколов',
        grade: 'Middle',
        vacancyTitle: 'Backend-разработчик (C# / .NET 9)',
        matchScore: 84,
        skills: ['C#', 'Entity Framework', 'MS SQL'],
        status: 'Interview',
    },
    {
        id: 'r3',
        candidateName: 'Елена Морозова',
        grade: 'Middle',
        vacancyTitle: 'Frontend-разработчик (React + TypeScript)',
        matchScore: 92,
        skills: ['React', 'TypeScript', 'Tailwind CSS'],
        status: 'New',
    },
];

export function EmployerResponsesPage() {
    const [responses, setResponses] = useState(INITIAL_RESPONSES);

    const updateStatus = (id: string, status: IncomingResponse['status']) => {
        setResponses((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    };

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-scoutly-dark">Входящие отклики кандидатов</h1>
                <p className="text-sm text-scoutly-muted mt-1">
                    Автоматическая оценка релевантности (MatchScore) и управление статусами рассмотрения
                </p>
            </div>

            <div className="space-y-4">
                {responses.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        className="rounded-lg bg-white p-6 border border-gray-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-base font-bold text-scoutly-dark">{item.candidateName}</h3>
                                <span className="rounded-md bg-scoutly-bg px-2.5 py-0.5 text-xs font-semibold text-scoutly-primary">
                  {item.grade}
                </span>
                                <span className="inline-flex items-center gap-1 rounded-md bg-status-success/15 text-status-success px-2.5 py-0.5 text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Совпадение: {item.matchScore}%
                </span>
                            </div>
                            <div className="text-xs text-scoutly-muted">
                                Вакансия: <span className="font-medium text-scoutly-dark">{item.vacancyTitle}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {item.skills.map((s) => (
                                    <span
                                        key={s}
                                        className="rounded-md bg-scoutly-primary/8 text-scoutly-primary px-2 py-0.5 text-xs font-medium"
                                    >
                    {s}
                  </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            {item.status === 'New' ? (
                                <>
                                    <Button
                                        variant="primary"
                                        className="py-2 px-3.5 text-xs"
                                        onClick={() => updateStatus(item.id, 'Interview')}
                                    >
                                        <UserCheck className="h-4 w-4" />
                                        <span>Пригласить на интервью</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="py-2 px-3 text-xs text-status-danger hover:bg-status-danger/10"
                                        onClick={() => updateStatus(item.id, 'Rejected')}
                                    >
                                        <XCircle className="h-4 w-4" />
                                        <span>Отказать</span>
                                    </Button>
                                </>
                            ) : (
                                <span
                                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                                        item.status === 'Interview'
                                            ? 'bg-status-success/15 text-status-success'
                                            : 'bg-status-danger/12 text-status-danger'
                                    }`}
                                >
                  {item.status === 'Interview' ? 'Приглашен на интервью' : 'Отклонен'}
                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}