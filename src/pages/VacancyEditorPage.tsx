import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Briefcase,
    Building2,
    MapPin,
    Wallet,
    Sparkles,
    Plus,
    Check,
    ArrowLeft,
} from 'lucide-react';
import { api } from '../shared/api/axiosInstance';
import {
    useSkillsQuery,
    useCreateSkillMutation,
} from '../features/skills/api/skillsApi';

interface SelectedVacancySkill {
    skillId: number;
    weight: number;
    isRequired: boolean;
}

export function VacancyEditorPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: allSkills = [], isLoading: isSkillsLoading } = useSkillsQuery();
    const createSkillMutation = useCreateSkillMutation();

    const [companyId, setCompanyId] = useState<number>(() => {
        const saved = localStorage.getItem('scoutly_company_id');
        return saved ? Number(saved) : 1;
    });

    const [title, setTitle] = useState('');
    const [city, setCity] = useState('Новосибирск');
    const [workFormat, setWorkFormat] = useState('Remote');
    const [salaryFrom, setSalaryFrom] = useState('');
    const [salaryTo, setSalaryTo] = useState('');
    const [description, setDescription] = useState('');

    const [selectedSkills, setSelectedSkills] = useState<SelectedVacancySkill[]>(
        []
    );
    const [newSkillName, setNewSkillName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const toggleSkill = (skillId: number) => {
        setSelectedSkills((prev) => {
            const exists = prev.some((s) => s.skillId === skillId);
            if (exists) {
                return prev.filter((s) => s.skillId !== skillId);
            }
            return [...prev, { skillId, weight: 3, isRequired: true }];
        });
    };

    const updateSkillConfig = (
        skillId: number,
        patch: Partial<SelectedVacancySkill>
    ) => {
        setSelectedSkills((prev) =>
            prev.map((s) => (s.skillId === skillId ? { ...s, ...patch } : s))
        );
    };

    const handleQuickAddSkill = async () => {
        const trimmed = newSkillName.trim();
        if (!trimmed) return;

        try {
            const created = await createSkillMutation.mutateAsync({ name: trimmed });
            setNewSkillName('');
            setSelectedSkills((prev) => [
                ...prev,
                { skillId: created.id, weight: 3, isRequired: true },
            ]);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.message || 'Не удалось добавить навык.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            await api.post('/vacancies', {
                title: title.trim(),
                description: description.trim(),
                companyId,
                city: city.trim() || null,
                workFormat,
                salaryFrom: salaryFrom ? Number(salaryFrom) : null,
                salaryTo: salaryTo ? Number(salaryTo) : null,
                skills: selectedSkills,
            });

            await queryClient.invalidateQueries({ queryKey: ['vacancies'] });
            navigate('/vacancies');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorMessage(
                    err.response?.data?.message ||
                    'Ошибка при создании вакансии. Проверьте CompanyId и заполненные поля.'
                );
            } else {
                setErrorMessage('Не удалось соединиться с сервером.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#1F4E79]/10 text-[#1F4E79] flex items-center justify-center">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            Публикация новой вакансии
                        </h1>
                        <p className="text-xs text-slate-500">
                            Параметры и веса навыков сразу используются в скоринге кандидатов
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Назад
                </button>
            </div>

            {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-[#A80036] text-sm font-medium">
                    {errorMessage}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
            >
                {/* Название и ID компании */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Название позиции *
                        </label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Senior C# / ASP.NET Core Developer"
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            CompanyId *
                        </label>
                        <input
                            type="number"
                            min={1}
                            required
                            value={companyId}
                            onChange={(e) => setCompanyId(Number(e.target.value) || 1)}
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold focus:border-[#1F4E79] focus:outline-none"
                        />
                    </div>
                </div>

                {/* Город, формат работы и зарплатная вилка */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            Город
                        </label>
                        <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Новосибирск"
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Формат работы
                        </label>
                        <select
                            value={workFormat}
                            onChange={(e) => setWorkFormat(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:border-[#1F4E79] focus:outline-none"
                        >
                            <option value="Remote">Remote (Удалённо)</option>
                            <option value="Hybrid">Hybrid (Гибрид)</option>
                            <option value="Office">Office (Офис)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5 text-slate-400" />
                            Зарплата от (₽)
                        </label>
                        <input
                            type="number"
                            min={0}
                            step={5000}
                            value={salaryFrom}
                            onChange={(e) => setSalaryFrom(e.target.value)}
                            placeholder="150000"
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Зарплата до (₽)
                        </label>
                        <input
                            type="number"
                            min={0}
                            step={5000}
                            value={salaryTo}
                            onChange={(e) => setSalaryTo(e.target.value)}
                            placeholder="250000"
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                        />
                    </div>
                </div>

                {/* Требуемые навыки из БД (/api/skill) */}
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#1F4E79]" />
                            Стек вакансии (из таблицы skills в PostgreSQL)
                        </label>

                        {/* Быстрое создание нового навыка в БД */}
                        <div className="flex items-center gap-1.5">
                            <input
                                type="text"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                placeholder="Новый навык (напр. Redis)..."
                                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-[#1F4E79] focus:outline-none"
                            />
                            <button
                                type="button"
                                disabled={!newSkillName.trim() || createSkillMutation.isPending}
                                onClick={handleQuickAddSkill}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 disabled:opacity-40"
                            >
                                <Plus className="w-3 h-3" />
                                Добавить в БД
                            </button>
                        </div>
                    </div>

                    {isSkillsLoading ? (
                        <div className="text-xs text-slate-400">
                            Загрузка навыков из /api/skill...
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {allSkills.map((skill) => {
                                const isSelected = selectedSkills.some(
                                    (s) => s.skillId === skill.id
                                );
                                return (
                                    <button
                                        type="button"
                                        key={skill.id}
                                        onClick={() => toggleSkill(skill.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                            isSelected
                                                ? 'bg-[#1F4E79] text-white border-[#1F4E79] shadow-sm'
                                                : 'bg-white text-slate-700 border-slate-300 hover:border-[#1F4E79]'
                                        }`}
                                    >
                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                        {skill.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Настройка веса и обязательности выбранных навыков */}
                    {selectedSkills.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                            {selectedSkills.map((item) => {
                                const skillInfo = allSkills.find((s) => s.id === item.skillId);
                                return (
                                    <div
                                        key={item.skillId}
                                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                    >
                    <span className="font-bold text-slate-800 truncate">
                      {skillInfo?.name ?? `Skill #${item.skillId}`}
                    </span>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <label className="flex items-center gap-1 text-slate-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isRequired}
                                                    onChange={(e) =>
                                                        updateSkillConfig(item.skillId, {
                                                            isRequired: e.target.checked,
                                                        })
                                                    }
                                                    className="accent-[#A80036]"
                                                />
                                                Обяз.
                                            </label>

                                            <select
                                                value={item.weight}
                                                onChange={(e) =>
                                                    updateSkillConfig(item.skillId, {
                                                        weight: Number(e.target.value),
                                                    })
                                                }
                                                className="rounded-lg border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700"
                                            >
                                                <option value={1}>Вес: 1</option>
                                                <option value={2}>Вес: 2</option>
                                                <option value={3}>Вес: 3</option>
                                                <option value={4}>Вес: 4</option>
                                                <option value={5}>Вес: 5</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Описание */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Описание задач и условий *
                    </label>
                    <textarea
                        required
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Опишите стек проекта, задачи команды, требования к опыту и бонусы..."
                        className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:border-[#1F4E79] focus:outline-none"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/vacancies')}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Отмена
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-xl bg-[#A80036] text-white text-sm font-semibold hover:bg-[#8a002c] disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {isSubmitting ? 'Публикация...' : 'Опубликовать вакансию'}
                    </button>
                </div>
            </form>
        </div>
    );
}