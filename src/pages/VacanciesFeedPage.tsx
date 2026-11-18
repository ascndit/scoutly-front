import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Wallet, CheckCircle2, Send, X } from 'lucide-react';
import { Button } from '../shared/ui/Button';
import { VacancyCardSkeleton } from '../shared/ui/Skeleton';
import { api } from '../shared/api/axiosInstance';
import type { Vacancy } from '../shared/types/entities';

// Демо-данные на случай, если C# API еще не запущен (автоматически заменяются ответом от /api/vacancies)
const MOCK_VACANCIES: Vacancy[] = [
    {
        id: '1',
        companyId: 'c1',
        companyName: 'Яндекс',
        title: 'Backend-разработчик (C# / .NET 9)',
        description: 'Разработка высоконагруженных микросервисов платформы поиска и скаутинга, проектирование API и оптимизация запросов к PostgreSQL.',
        minSalary: 180000,
        maxSalary: 260000,
        targetGrade: 'Middle',
        status: 'Active',
        createdAt: '2026-11-18',
        skills: [
            { skillId: 1, skillName: 'C#', isRequired: true },
            { skillId: 2, skillName: 'ASP.NET Core', isRequired: true },
            { skillId: 3, skillName: 'PostgreSQL', isRequired: true },
            { skillId: 4, skillName: 'Docker', isRequired: false },
        ],
    },
    {
        id: '2',
        companyId: 'c2',
        companyName: 'Тинькофф Технологии',
        title: 'Frontend-разработчик (React + TypeScript)',
        description: 'Создание современных SPA-интерфейсов, развитие внутренней дизайн-системы, оптимизация рендеринга и анимаций.',
        minSalary: 160000,
        maxSalary: 240000,
        targetGrade: 'Middle',
        status: 'Active',
        createdAt: '2026-11-17',
        skills: [
            { skillId: 5, skillName: 'React', isRequired: true },
            { skillId: 6, skillName: 'TypeScript', isRequired: true },
            { skillId: 7, skillName: 'Tailwind CSS', isRequired: false },
        ],
    },
    {
        id: '3',
        companyId: 'c3',
        companyName: 'VK Tech',
        title: 'Junior .NET Developer (Стажировка)',
        description: 'Участие в разработке внутренних инструментов автоматизации найма, написание модульных тестов и интеграция с REST API.',
        minSalary: 85000,
        maxSalary: 120000,
        targetGrade: 'Junior',
        status: 'Active',
        createdAt: '2026-11-16',
        skills: [
            { skillId: 1, skillName: 'C#', isRequired: true },
            { skillId: 8, skillName: 'Git', isRequired: true },
            { skillId: 9, skillName: 'SQL', isRequired: true },
        ],
    },
];

export function VacanciesFeedPage() {
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGrade, setSelectedGrade] = useState<string>('All');
    const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [appliedIds, setAppliedIds] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        let active = true;
        const loadVacancies = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.get<Vacancy[]>('/vacancies');
                if (active && Array.isArray(data) && data.length > 0) {
                    setVacancies(data);
                } else if (active) {
                    setVacancies(MOCK_VACANCIES);
                }
            } catch {
                // Имитация плавной загрузки скелетонов при оффлайн-демо
                setTimeout(() => {
                    if (active) setVacancies(MOCK_VACANCIES);
                }, 450);
            } finally {
                setTimeout(() => {
                    if (active) setIsLoading(false);
                }, 450);
            }
        };
        loadVacancies();
        return () => {
            active = false;
        };
    }, []);

    const filtered = vacancies.filter((v) => {
        const matchesText =
            v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.skills.some((s) => s.skillName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesGrade = selectedGrade === 'All' || v.targetGrade === selectedGrade;
        return matchesText && matchesGrade;
    });

    const handleApply = async () => {
        if (!selectedVacancy) return;
        setIsSending(true);
        try {
            await api.post('/applications', {
                vacancyId: selectedVacancy.id,
                coverLetter,
            });
        } catch {
            // В демо-режиме все равно фиксируем отклик локально
        } finally {
            setAppliedIds((prev) => [...prev, selectedVacancy.id]);
            setIsSending(false);
            setSelectedVacancy(null);
            setCoverLetter('');
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Заголовок и панель фильтров (US-05) */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-scoutly-dark">Поиск вакансий</h1>
                <p className="text-sm text-scoutly-muted mt-1">
                    Актуальные предложения от верифицированных работодателей с подбором по стеку
                </p>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-scoutly-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Должность или технология (например, C#, React, PostgreSQL)..."
                            className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-scoutly-accent focus:ring-2 focus:ring-scoutly-accent/20 transition-all"
                        />
                    </div>

                    <div className="flex gap-1.5 bg-white p-1 rounded-lg border border-gray-200">
                        {['All', 'Junior', 'Middle', 'Senior'].map((grade) => (
                            <button
                                key={grade}
                                type="button"
                                onClick={() => setSelectedGrade(grade)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                                    selectedGrade === grade
                                        ? 'bg-scoutly-primary text-white'
                                        : 'text-scoutly-muted hover:text-scoutly-dark'
                                }`}
                            >
                                {grade === 'All' ? 'Все грейды' : grade}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Лента вакансий со скелетонами (п. 3.2.2) */}
            {isLoading ? (
                <div className="space-y-4">
                    <VacancyCardSkeleton />
                    <VacancyCardSkeleton />
                    <VacancyCardSkeleton />
                </div>
            ) : (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.07 } },
                    }}
                    className="space-y-4"
                >
                    {filtered.map((vacancy) => {
                        const isApplied = appliedIds.includes(vacancy.id);
                        return (
                            <motion.div
                                key={vacancy.id}
                                variants={{
                                    hidden: { opacity: 0, y: 14 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                whileHover={{ y: -2 }}
                                transition={{ duration: 0.25 }}
                                className="rounded-lg bg-white p-6 border border-gray-100 shadow-xs hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <h3 className="text-lg font-semibold text-scoutly-dark">{vacancy.title}</h3>
                                            <span className="rounded-md bg-scoutly-accent/12 px-2.5 py-0.5 text-xs font-semibold text-scoutly-primary">
                        {vacancy.targetGrade}
                      </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-scoutly-muted mt-1.5">
                                            <Building2 className="h-3.5 w-3.5 text-scoutly-accent" />
                                            <span className="font-medium text-scoutly-dark">{vacancy.companyName}</span>
                                            <span>•</span>
                                            <span>Опубликовано {vacancy.createdAt}</span>
                                        </div>
                                    </div>

                                    {vacancy.minSalary && (
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-scoutly-primary bg-scoutly-bg px-3 py-1.5 rounded-lg shrink-0">
                                            <Wallet className="h-4 w-4 text-scoutly-accent" />
                                            <span>
                        {vacancy.minSalary.toLocaleString('ru-RU')} –{' '}
                                                {vacancy.maxSalary?.toLocaleString('ru-RU')} ₽
                      </span>
                                        </div>
                                    )}
                                </div>

                                <p className="mt-3.5 text-sm text-scoutly-muted leading-relaxed">
                                    {vacancy.description}
                                </p>

                                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-wrap gap-2">
                                        {vacancy.skills.map((skill) => (
                                            <span
                                                key={skill.skillId}
                                                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                                                    skill.isRequired
                                                        ? 'bg-scoutly-primary/8 text-scoutly-primary border border-scoutly-primary/15'
                                                        : 'bg-gray-100 text-scoutly-muted'
                                                }`}
                                            >
                        {skill.skillName}
                      </span>
                                        ))}
                                    </div>

                                    {isApplied ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-success bg-status-success/10 px-3.5 py-2 rounded-lg">
                      <CheckCircle2 className="h-4 w-4" />
                      Отклик отправлен
                    </span>
                                    ) : (
                                        <Button variant="action" onClick={() => setSelectedVacancy(vacancy)}>
                                            Откликнуться
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Модальное окно отклика (US-07, Диаграмма активности 2) */}
            <AnimatePresence>
                {selectedVacancy && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 12 }}
                            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                            className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                  <span className="text-xs font-semibold text-scoutly-accent uppercase tracking-wider">
                    Отклик на вакансию
                  </span>
                                    <h3 className="text-lg font-bold text-scoutly-dark mt-0.5">
                                        {selectedVacancy.title}
                                    </h3>
                                    <p className="text-xs text-scoutly-muted">{selectedVacancy.companyName}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedVacancy(null)}
                                    className="p-1.5 rounded-lg text-scoutly-muted hover:bg-gray-100 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-4">
                                <label className="block text-xs font-medium text-scoutly-dark mb-1.5">
                                    Сопроводительное письмо (необязательно)
                                </label>
                                <textarea
                                    rows={4}
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    placeholder="Расскажите кратко о вашем опыте со стеком вакансии..."
                                    className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-scoutly-accent focus:ring-2 focus:ring-scoutly-accent/20"
                                />
                            </div>

                            <div className="mt-5 flex justify-end gap-2.5">
                                <Button variant="ghost" onClick={() => setSelectedVacancy(null)}>
                                    Отмена
                                </Button>
                                <Button variant="action" isLoading={isSending} onClick={handleApply}>
                                    <Send className="h-4 w-4" />
                                    <span>Отправить резюме</span>
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}