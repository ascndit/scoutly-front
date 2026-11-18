import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, Briefcase } from 'lucide-react';
import { Input } from '../shared/ui/Input';
import { Button } from '../shared/ui/Button';

const SKILL_DICTIONARY = [
    'C#', 'ASP.NET Core', 'PostgreSQL', 'Docker', 'Git',
    'React', 'TypeScript', 'Tailwind CSS', 'Python', 'SQL',
];

export function ProfilePage() {
    const [firstName, setFirstName] = useState('Алексей');
    const [lastName, setLastName] = useState('Киреев');
    const [city, setCity] = useState('Новосибирск');
    const [position, setPosition] = useState('Backend / Fullstack Разработчик');
    const [salary, setSalary] = useState('150000');
    const [grade, setGrade] = useState('Middle');
    const [skills, setSkills] = useState<string[]>(['C#', 'ASP.NET Core', 'PostgreSQL', 'Docker']);
    const [skillInput, setSkillInput] = useState('');
    const [savedNotice, setSavedNotice] = useState(false);

    const addSkill = (name: string) => {
        const trimmed = name.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
        }
        setSkillInput('');
    };

    const removeSkill = (name: string) => {
        setSkills(skills.filter((s) => s !== name));
    };

    const handleSave = () => {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
    };

    return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-scoutly-dark">Профиль специалиста</h1>
                    <p className="text-sm text-scoutly-muted mt-1">
                        Эти данные используются алгоритмом автоматического скоринга рекрутеров
                    </p>
                </div>

                <AnimatePresence>
                    {savedNotice && (
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            className="flex items-center gap-2 rounded-lg bg-status-success/15 text-status-success px-4 py-2 text-xs font-semibold"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Изменения сохранены</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="space-y-6">
                {/* Персональные данные (US-03) */}
                <div className="rounded-lg bg-white p-6 border border-gray-100 shadow-xs space-y-4">
                    <h2 className="text-base font-semibold text-scoutly-primary">Основная информация</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input label="Имя" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <Input label="Фамилия" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        <Input label="Город" value={city} onChange={(e) => setCity(e.target.value)} />
                        <Input
                            label="Ожидаемая зарплата (₽)"
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                        />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 pt-1">
                        <div className="sm:col-span-2">
                            <Input
                                label="Желаемая должность"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-medium text-scoutly-muted mb-1">Грейд</label>
                            <select
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-scoutly-accent"
                            >
                                <option value="Junior">Junior</option>
                                <option value="Middle">Middle</option>
                                <option value="Senior">Senior</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Стек компетенций (US-04) */}
                <div className="rounded-lg bg-white p-6 border border-gray-100 shadow-xs space-y-4">
                    <h2 className="text-base font-semibold text-scoutly-primary">Ключевые компетенции</h2>

                    <div className="flex flex-wrap gap-2">
                        <AnimatePresence>
                            {skills.map((skill) => (
                                <motion.span
                                    key={skill}
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-scoutly-primary/10 text-scoutly-primary px-3 py-1.5 text-xs font-semibold"
                                >
                                    <span>{skill}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className="hover:text-status-danger cursor-pointer"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                            placeholder="Добавить навык из словаря..."
                            className="flex-1 rounded-lg border border-gray-300 px-3.5 py-2 text-sm outline-none focus:border-scoutly-accent"
                        />
                        <Button type="button" variant="secondary" onClick={() => addSkill(skillInput)}>
                            <Plus className="h-4 w-4" />
                            <span>Добавить</span>
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {SKILL_DICTIONARY.filter((s) => !skills.includes(s)).map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => addSkill(item)}
                                className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-scoutly-muted hover:border-scoutly-accent hover:text-scoutly-primary transition-colors cursor-pointer"
                            >
                                + {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Опыт работы */}
                <div className="rounded-lg bg-white p-6 border border-gray-100 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-base font-semibold text-scoutly-primary">
                        <Briefcase className="h-4 w-4" />
                        <span>Опыт работы</span>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-scoutly-bg p-4">
                        <div className="font-semibold text-sm text-scoutly-dark">
                            Backend-разработчик (Учебный / коммерческий проект)
                        </div>
                        <div className="text-xs text-scoutly-muted mt-0.5">2025 — настоящее время</div>
                        <p className="text-xs text-scoutly-dark/80 mt-2 leading-relaxed">
                            Проектирование REST API на C# / ASP.NET Core 9, работа с PostgreSQL, написание модульных тестов и Docker-контейнеризация.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="primary" onClick={handleSave}>
                        Сохранить профиль
                    </Button>
                </div>
            </div>
        </div>
    );
}