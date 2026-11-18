import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../shared/ui/Input';
import { Button } from '../shared/ui/Button';

const AVAILABLE_SKILLS = ['C#', 'ASP.NET Core', 'PostgreSQL', 'Docker', 'React', 'TypeScript', 'Git'];

export function VacancyEditorPage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [grade, setGrade] = useState('Middle');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>(['C#', 'ASP.NET Core']);
    const [error, setError] = useState('');

    const toggleSkill = (skill: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    const handlePublish = (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Укажите название позиции');
            return;
        }
        navigate('/employer/dashboard');
    };

    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
            <button
                type="button"
                onClick={() => navigate('/employer/dashboard')}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-scoutly-muted hover:text-scoutly-primary mb-4 cursor-pointer"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Назад к списку вакансий</span>
            </button>

            <h1 className="text-2xl font-bold text-scoutly-dark mb-6">Создание новой вакансии</h1>

            <form
                onSubmit={handlePublish}
                className="rounded-lg bg-white p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5"
            >
                <Input
                    label="Название должности (например, Senior .NET Developer)"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setError('');
                    }}
                    error={error}
                />

                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[11px] font-medium text-scoutly-muted mb-1">
                            Требуемый грейд
                        </label>
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
                    <Input
                        label="Зарплата от (₽)"
                        type="number"
                        value={minSalary}
                        onChange={(e) => setMinSalary(e.target.value)}
                    />
                    <Input
                        label="Зарплата до (₽)"
                        type="number"
                        value={maxSalary}
                        onChange={(e) => setMaxSalary(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-scoutly-dark mb-2">
                        Обязательный стек компетенций (из словаря системы)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_SKILLS.map((skill) => {
                            const active = selectedSkills.includes(skill);
                            return (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => toggleSkill(skill)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                                        active
                                            ? 'bg-scoutly-primary text-white border-scoutly-primary'
                                            : 'bg-white text-scoutly-muted border-gray-200 hover:border-scoutly-accent'
                                    }`}
                                >
                                    {skill}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-scoutly-dark mb-1.5">
                        Описание задач и условий работы
                    </label>
                    <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Опишите стек проекта, команду и требования к кандидату..."
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-scoutly-accent focus:ring-2 focus:ring-scoutly-accent/20"
                    />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => navigate('/employer/dashboard')}>
                        Отмена
                    </Button>
                    <Button type="submit" variant="action">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Опубликовать вакансию</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}