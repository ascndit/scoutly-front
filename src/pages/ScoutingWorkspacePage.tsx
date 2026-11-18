import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, MessageSquarePlus, CheckCircle2, Layers } from 'lucide-react';
import { Button } from '../shared/ui/Button';

type FunnelStage = 'Скрининг' | 'Первичный контакт' | 'Техническое интервью' | 'Оффер';

interface ScoutedCandidate {
    id: string;
    fullName: string;
    position: string;
    grade: string;
    city: string;
    expectedSalary: string;
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    stage: FunnelStage;
    history: { date: string; event: string; note: string }[];
}

const STAGES: FunnelStage[] = [
    'Скрининг',
    'Первичный контакт',
    'Техническое интервью',
    'Оффер',
];

const INITIAL_CANDIDATES: ScoutedCandidate[] = [
    {
        id: 'sc1',
        fullName: 'Алексей Киреев',
        position: 'Backend-разработчик (C# / .NET)',
        grade: 'Middle',
        city: 'Новосибирск',
        expectedSalary: '180 000 ₽',
        matchScore: 97,
        matchedSkills: ['C#', 'ASP.NET Core', 'PostgreSQL', 'Docker', 'Git'],
        missingSkills: [],
        stage: 'Техническое интервью',
        history: [
            {
                date: '18.11.2026 14:20',
                event: 'Перевод на этап «Техническое интервью»',
                note: 'Отличные знания Vertical Slice Architecture и асинхронности в .NET.',
            },
            {
                date: '16.11.2026 11:05',
                event: 'Автоматический скоринг',
                note: 'Кандидат найден модулем скаутинга (совпадение 97%).',
            },
        ],
    },
    {
        id: 'sc2',
        fullName: 'Максим Волков',
        position: '.NET Backend Engineer',
        grade: 'Middle',
        city: 'Москва',
        expectedSalary: '210 000 ₽',
        matchScore: 88,
        matchedSkills: ['C#', 'ASP.NET Core', 'PostgreSQL'],
        missingSkills: ['Docker'],
        stage: 'Первичный контакт',
        history: [
            {
                date: '17.11.2026 16:40',
                event: 'Первичный контакт',
                note: 'Отправлено приглашение в Telegram, ожидаем ответ по времени созвона.',
            },
        ],
    },
    {
        id: 'sc3',
        fullName: 'Анна Лебедева',
        position: 'Fullstack C# / React Developer',
        grade: 'Middle',
        city: 'Санкт-Петербург',
        expectedSalary: '195 000 ₽',
        matchScore: 82,
        matchedSkills: ['C#', 'PostgreSQL', 'Git'],
        missingSkills: ['ASP.NET Core', 'Docker'],
        stage: 'Скрининг',
        history: [
            {
                date: '18.11.2026 09:15',
                event: 'Добавлена в воронку',
                note: 'Сильный бэкграунд в смежном стеке.',
            },
        ],
    },
];

export function ScoutingWorkspacePage() {
    const [candidates, setCandidates] = useState<ScoutedCandidate[]>(INITIAL_CANDIDATES);
    const [selectedId, setSelectedId] = useState<string>('sc1');
    const [skillFilter, setSkillFilter] = useState('');
    const [noteInput, setNoteInput] = useState('');
    const [isScoring, setIsScoring] = useState(false);

    const selected = candidates.find((c) => c.id === selectedId) || candidates[0];

    const filteredCandidates = candidates.filter(
        (c) =>
            c.fullName.toLowerCase().includes(skillFilter.toLowerCase()) ||
            c.matchedSkills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))
    );

    const handleStageChange = (stage: FunnelStage) => {
        setCandidates((prev) =>
            prev.map((c) =>
                c.id === selected.id
                    ? {
                        ...c,
                        stage,
                        history: [
                            {
                                date: '18.11.2026 Сейчас',
                                event: `Смена этапа на «${stage}»`,
                                note: 'Статус обновлен рекрутером в панели скаутинга.',
                            },
                            ...c.history,
                        ],
                    }
                    : c
            )
        );
    };

    const handleAddNote = () => {
        if (!noteInput.trim()) return;
        setCandidates((prev) =>
            prev.map((c) =>
                c.id === selected.id
                    ? {
                        ...c,
                        history: [
                            {
                                date: '18.11.2026 Сейчас',
                                event: 'Заметка рекрутера',
                                note: noteInput.trim(),
                            },
                            ...c.history,
                        ],
                    }
                    : c
            )
        );
        setNoteInput('');
    };

    const runAutoScoring = () => {
        setIsScoring(true);
        setTimeout(() => setIsScoring(false), 600);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-scoutly-dark">Модуль скаутинга и скоринга</h1>
                    <p className="text-sm text-scoutly-muted mt-0.5">
                        Вакансия: <span className="font-semibold text-scoutly-primary">Backend-разработчик (C# / .NET 9)</span>
                    </p>
                </div>

                <Button variant="action" isLoading={isScoring} onClick={runAutoScoring}>
                    <Sparkles className="h-4 w-4" />
                    <span>Запустить автоподбор (Скоринг)</span>
                </Button>
            </div>

            {/* Трехпанельная компоновка Master-Detail (п. 3.2.1) */}
            <div className="grid lg:grid-cols-12 gap-5 items-start">
                {/* Левая и центральная колонки: Фильтр и ранжированный список (5 колонок) */}
                <div className="lg:col-span-5 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-scoutly-muted" />
                        <input
                            type="text"
                            value={skillFilter}
                            onChange={(e) => setSkillFilter(e.target.value)}
                            placeholder="Фильтр по ФИО или технологии..."
                            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-scoutly-accent"
                        />
                    </div>

                    {filteredCandidates.map((cand) => {
                        const isSelected = cand.id === selected.id;
                        return (
                            <motion.div
                                key={cand.id}
                                whileHover={{ x: 2 }}
                                onClick={() => setSelectedId(cand.id)}
                                className={`rounded-lg p-4 border cursor-pointer transition-all ${
                                    isSelected
                                        ? 'bg-white border-scoutly-primary shadow-md ring-1 ring-scoutly-primary/20'
                                        : 'bg-white border-gray-100 shadow-xs hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="font-bold text-sm text-scoutly-dark">{cand.fullName}</div>
                                        <div className="text-xs text-scoutly-muted mt-0.5">{cand.position}</div>
                                    </div>
                                    <span className="rounded-md bg-status-success/15 text-status-success px-2.5 py-1 text-xs font-bold shrink-0">
                    {cand.matchScore}% match
                  </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-scoutly-muted">
                    {cand.city} • {cand.expectedSalary}
                  </span>
                                    <span className="rounded-md bg-scoutly-primary/10 text-scoutly-primary px-2 py-0.5 font-semibold">
                    {cand.stage}
                  </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Правая колонка: Детальная карточка, скоринг, воронка и аудит-лог (7 колонок) */}
                <div className="lg:col-span-7 rounded-lg bg-white p-6 border border-gray-100 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h2 className="text-xl font-bold text-scoutly-dark">{selected.fullName}</h2>
                                <span className="rounded-md bg-scoutly-bg px-2.5 py-0.5 text-xs font-semibold text-scoutly-primary">
                  {selected.grade}
                </span>
                            </div>
                            <p className="text-xs text-scoutly-muted mt-1">
                                {selected.position} • {selected.city} • Ожидания: {selected.expectedSalary}
                            </p>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl font-bold text-status-success">{selected.matchScore}%</div>
                            <div className="text-[11px] text-scoutly-muted">Итоговый скоринг</div>
                        </div>
                    </div>

                    {/* Детализация совпадений (US-17) */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-lg bg-status-success/8 border border-status-success/20 p-3.5">
                            <div className="text-xs font-semibold text-status-success mb-2 flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Покрытые обязательные навыки</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {selected.matchedSkills.map((s) => (
                                    <span key={s} className="rounded bg-white px-2 py-0.5 text-xs font-medium text-scoutly-dark shadow-2xs">
                    {s}
                  </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg bg-scoutly-bg border border-gray-200/80 p-3.5">
                            <div className="text-xs font-semibold text-scoutly-muted mb-2">
                                Дефицитные компетенции
                            </div>
                            {selected.missingSkills.length === 0 ? (
                                <span className="text-xs text-status-success font-medium">
                  Полное покрытие требований вакансии
                </span>
                            ) : (
                                <div className="flex flex-wrap gap-1.5">
                                    {selected.missingSkills.map((s) => (
                                        <span key={s} className="rounded bg-status-danger/10 text-status-danger px-2 py-0.5 text-xs font-medium">
                      {s}
                    </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Управление этапом воронки (US-18) */}
                    <div>
                        <label className="block text-xs font-semibold text-scoutly-dark mb-2 flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-scoutly-accent" />
                            <span>Этап воронки подбора</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {STAGES.map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStageChange(st)}
                                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                        selected.stage === st
                                            ? 'bg-scoutly-primary text-white border-scoutly-primary shadow-xs'
                                            : 'bg-white text-scoutly-muted border-gray-200 hover:border-scoutly-accent'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* История взаимодействия (US-19) */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-scoutly-dark uppercase tracking-wider">
                            История взаимодействия (Audit Log)
                        </h3>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                placeholder="Добавить протокол звонка или заметку по кандидату..."
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-scoutly-accent"
                            />
                            <Button type="button" variant="secondary" className="py-2 px-3 text-xs" onClick={handleAddNote}>
                                <MessageSquarePlus className="h-3.5 w-3.5" />
                                <span>Записать</span>
                            </Button>
                        </div>

                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                            {selected.history.map((h, idx) => (
                                <div key={idx} className="rounded-lg bg-scoutly-bg p-3 text-xs space-y-1">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-semibold text-scoutly-primary">{h.event}</span>
                                        <span className="text-scoutly-muted">{h.date}</span>
                                    </div>
                                    <p className="text-scoutly-dark/85">{h.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}