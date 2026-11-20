import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Briefcase,
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
    isTopSkill,
} from '../features/skills/api/skillsApi';

export function VacancyEditorPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: allSkills = [], isLoading: isSkillsLoading } = useSkillsQuery();
    const createSkillMutation = useCreateSkillMutation();

    const companyId = Number(localStorage.getItem('scoutly_company_id') || '1');

    const [title, setTitle] = useState('');
    const [city, setCity] = useState('Новосибирск');
    const [workFormat, setWorkFormat] = useState('Remote');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [description, setDescription] = useState('');

    const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
    const [newSkillName, setNewSkillName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const visibleSkills = useMemo(
        () =>
            allSkills.filter(
                (skill) => isTopSkill(skill) || selectedSkillIds.includes(skill.id)
            ),
        [allSkills, selectedSkillIds]
    );

    const toggleSkill = (skillId: number) => {
        setSelectedSkillIds((prev) =>
            prev.includes(skillId)
                ? prev.filter((id) => id !== skillId)
                : [...prev, skillId]
        );
    };

    const handleQuickAddSkill = async () => {
        const trimmed = newSkillName.trim();
        if (!trimmed) return;

        const existing = allSkills.find(
            (s) => s.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (existing) {
            if (!selectedSkillIds.includes(existing.id)) {
                setSelectedSkillIds((prev) => [...prev, existing.id]);
            }
            setNewSkillName('');
            return;
        }

        try {
            const created = await createSkillMutation.mutateAsync({ name: trimmed });
            setNewSkillName('');
            setSelectedSkillIds((prev) => [...prev, created.id]);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.message || 'Не удалось добавить навык.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        const parsedMin = salaryMin ? Number(salaryMin) : null;
        const parsedMax = salaryMax ? Number(salaryMax) : null;

        if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
            setErrorMessage('«Зарплата от» не может быть больше «Зарплаты до».');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post('/vacancies', {
                companyId,
                title: title.trim(),
                description: description.trim(),
                city: city.trim() || null,
                workFormat,
                salaryMin: parsedMin,
                salaryMax: parsedMax,
                skillIds: selectedSkillIds,
            });

            await queryClient.invalidateQueries({ queryKey: ['vacancies'] });
            navigate('/dashboard');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const data = err.response?.data as
                    | {
                    message?: string;
                    title?: string;
                    detail?: string;
                    errors?: Record<string, string[]>;
                }
                    | string
                    | undefined;

                if (typeof data === 'string' && data.trim()) {
                    setErrorMessage(data);
                } else if (data && typeof data === 'object') {
                    const validationMessages = data.errors
                        ? Object.entries(data.errors)
                            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
                            .join(' | ')
                        : '';

                    setErrorMessage(
                        validationMessages ||
                        data.message ||
                        data.detail ||
                        data.title ||
                        `Ошибка сервера (код ${err.response?.status ?? 'неизвестен'})`
                    );
                } else {
                    setErrorMessage(
                        `Ошибка сервера (код ${err.response?.status ?? 'нет ответа'})`
                    );
                }
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
                            Укажите требования и ключевые навыки для точного подбора кандидатов
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
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Название должности *
                    </label>
                    <input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Senior C# / ASP.NET Core Developer"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                    />
                </div>

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
                            <option value="Remote">Удалённо</option>
                            <option value="Hybrid">Гибрид</option>
                            <option value="Office">Офис</option>
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
                            value={salaryMin}
                            onChange={(e) => setSalaryMin(e.target.value)}
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
                            value={salaryMax}
                            onChange={(e) => setSalaryMax(e.target.value)}
                            placeholder="250000"
                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#1F4E79]" />
                            Требуемые навыки ({selectedSkillIds.length})
                        </label>

                        <div className="flex items-center gap-1.5">
                            <input
                                type="text"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleQuickAddSkill();
                                    }
                                }}
                                placeholder="Другой навык (напр. Kafka)..."
                                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs focus:border-[#1F4E79] focus:outline-none"
                            />
                            <button
                                type="button"
                                disabled={!newSkillName.trim() || createSkillMutation.isPending}
                                onClick={handleQuickAddSkill}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 disabled:opacity-40"
                            >
                                <Plus className="w-3 h-3" />
                                Добавить навык
                            </button>
                        </div>
                    </div>

                    {isSkillsLoading ? (
                        <div className="text-xs text-slate-400">
                            Загрузка списка навыков...
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {visibleSkills.map((skill) => {
                                const isSelected = selectedSkillIds.includes(skill.id);
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
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Описание задач и условий *
                    </label>
                    <textarea
                        required
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Опишите стек проекта, задачи команды, требования к опыту и условия..."
                        className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:border-[#1F4E79] focus:outline-none"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
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