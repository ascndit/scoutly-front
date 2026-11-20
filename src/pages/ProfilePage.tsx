import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    User,
    MapPin,
    Phone,
    Send,
    Wallet,
    CheckCircle2,
    Save,
    Sparkles,
    Plus,
    X,
} from 'lucide-react';
import {
    useProfileQuery,
    useSaveProfileMutation,
    type SkillInput,
} from '../features/profiles/api/profilesApi';
import {
    useSkillsQuery,
    useCreateSkillMutation,
    useDeleteSkillMutation,
    isTopSkill,
    type SkillResponse,
} from '../features/skills/api/skillsApi';

const SKILL_LEVELS = [
    { value: 'Beginner', label: 'Начальный' },
    { value: 'Intermediate', label: 'Уверенный' },
    { value: 'Advanced', label: 'Продвинутый' },
    { value: 'Expert', label: 'Эксперт' },
];

function getLevelsStorageKey(profileId: number): string {
    return `scoutly_skill_levels_${profileId}`;
}

function readSavedLevels(profileId: number): Record<number, string> {
    try {
        const raw = localStorage.getItem(getLevelsStorageKey(profileId));
        return raw ? (JSON.parse(raw) as Record<number, string>) : {};
    } catch {
        return {};
    }
}

function writeSavedLevels(profileId: number, skills: SkillInput[]): void {
    try {
        const map: Record<number, string> = {};
        skills.forEach((s) => {
            map[s.id] = s.level;
        });
        localStorage.setItem(getLevelsStorageKey(profileId), JSON.stringify(map));
    } catch {
        // ignore storage errors
    }
}

export function ProfilePage() {
    const queryClient = useQueryClient();

    const [profileId, setProfileId] = useState<number>(() => {
        return Number(localStorage.getItem('scoutly_specialist_profile_id') || '1');
    });

    const { data: profile, isLoading: isProfileLoading } =
        useProfileQuery(profileId);
    const { data: allSkills = [], isLoading: isSkillsLoading } = useSkillsQuery();
    const saveMutation = useSaveProfileMutation();
    const createSkillMutation = useCreateSkillMutation();
    const deleteSkillMutation = useDeleteSkillMutation();

    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [headline, setHeadline] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [telegram, setTelegram] = useState('');
    const [expectedSalary, setExpectedSalary] = useState<string>('');
    const [aboutMe, setAboutMe] = useState('');

    const [selectedSkills, setSelectedSkills] = useState<SkillInput[]>([]);
    const [justCreatedSkills, setJustCreatedSkills] = useState<SkillResponse[]>(
        []
    );
    const [sessionCustomSkillIds, setSessionCustomSkillIds] = useState<number[]>(
        []
    );
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
    const [skillError, setSkillError] = useState<string | null>(null);
    const [skillSavedNotice, setSkillSavedNotice] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const lastHydratedSignature = useRef<string | null>(null);

    // Объединяем навыки из API и только что созданные, чтобы избежать гонки refetch
    const knownSkills = useMemo(() => {
        const map = new Map<number, SkillResponse>();
        allSkills.forEach((s) => map.set(s.id, s));
        justCreatedSkills.forEach((s) => {
            if (!map.has(s.id)) map.set(s.id, s);
        });
        return Array.from(map.values());
    }, [allSkills, justCreatedSkills]);

    useEffect(() => {
        if (!profile) return;

        const nameParts = profile.fullName.trim().split(/\s+/);
        setLastName(nameParts[0] ?? '');
        setFirstName(nameParts[1] ?? '');
        setMiddleName(nameParts.slice(2).join(' '));
        setHeadline(profile.headline ?? '');
        setCity(profile.city ?? '');
        setPhone(profile.phone ?? '');
        setTelegram(profile.telegram ?? '');
        setExpectedSalary(
            profile.expectedSalary !== null ? String(profile.expectedSalary) : ''
        );
        setAboutMe(profile.aboutMe ?? '');
    }, [profile]);

    useEffect(() => {
        if (!profile || knownSkills.length === 0) return;

        const savedLevels = readSavedLevels(profile.id);
        const matchedSkills = profile.skills
            .map((skillName) => {
                const found = knownSkills.find(
                    (s) => s.name.toLowerCase() === skillName.toLowerCase()
                );
                return found ?? null;
            })
            .filter((item): item is SkillResponse => item !== null);

        const signature = `${profile.id}:${profile.skills.join('|')}:${matchedSkills.length}`;
        if (lastHydratedSignature.current === signature) return;
        lastHydratedSignature.current = signature;

        setSelectedSkills((prev) => {
            const prevLevelMap = new Map(prev.map((item) => [item.id, item.level]));
            return matchedSkills.map((found) => ({
                id: found.id,
                level:
                    prevLevelMap.get(found.id) ?? savedLevels[found.id] ?? 'Intermediate',
            }));
        });
    }, [profile, knownSkills]);

    const topSkills = useMemo(
        () => knownSkills.filter((skill) => isTopSkill(skill)),
        [knownSkills]
    );

    const personalCustomSkills = useMemo(() => {
        const selectedIds = new Set(selectedSkills.map((s) => s.id));
        const sessionIds = new Set(sessionCustomSkillIds);

        return knownSkills.filter(
            (skill) =>
                !isTopSkill(skill) &&
                (selectedIds.has(skill.id) || sessionIds.has(skill.id))
        );
    }, [knownSkills, selectedSkills, sessionCustomSkillIds]);

    const persistProfileWithSkills = async (nextSkills: SkillInput[]) => {
        writeSavedLevels(profileId, nextSkills);

        if (!firstName.trim() || !lastName.trim()) {
            return null;
        }

        const saved = await saveMutation.mutateAsync({
            userId: profile?.userId ?? profileId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            middleName: middleName.trim() || null,
            headline: headline.trim() || null,
            city: city.trim() || null,
            phone: phone.trim() || null,
            telegram: telegram.trim() || null,
            expectedSalary: expectedSalary ? Number(expectedSalary) : null,
            aboutMe: aboutMe.trim() || null,
            skillIds: nextSkills,
        });

        writeSavedLevels(saved.id, nextSkills);
        setProfileId(saved.id);
        localStorage.setItem('scoutly_specialist_profile_id', String(saved.id));

        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['profile'] }),
            queryClient.invalidateQueries({ queryKey: ['profiles'] }),
            queryClient.invalidateQueries({ queryKey: ['skills'] }),
        ]);

        return saved;
    };

    const toggleSkill = (skillId: number) => {
        setSelectedSkills((prev) => {
            const exists = prev.some((s) => s.id === skillId);
            const next = exists
                ? prev.filter((s) => s.id !== skillId)
                : [...prev, { id: skillId, level: 'Intermediate' }];
            writeSavedLevels(profileId, next);
            return next;
        });
    };

    const updateSkillLevel = (skillId: number, level: string) => {
        setSelectedSkills((prev) => {
            const exists = prev.some((s) => s.id === skillId);
            const next = exists
                ? prev.map((s) => (s.id === skillId ? { ...s, level } : s))
                : [...prev, { id: skillId, level }];
            writeSavedLevels(profileId, next);
            return next;
        });
    };

    const removeCustomSkill = async (skillId: number) => {
        const nextSkills = selectedSkills.filter((s) => s.id !== skillId);
        setSelectedSkills(nextSkills);
        setSessionCustomSkillIds((prev) => prev.filter((id) => id !== skillId));
        setJustCreatedSkills((prev) => prev.filter((s) => s.id !== skillId));

        try {
            await persistProfileWithSkills(nextSkills);
            await deleteSkillMutation.mutateAsync(skillId);
        } catch {
            // Если навык используется в другой сущности БД, он всё равно отвязан от текущего профиля
        }
    };

    const handleAddCustomSkill = async () => {
        const trimmed = newSkillName.trim();
        if (!trimmed) return;
        setSkillError(null);
        setSkillSavedNotice(null);

        try {
            let targetSkill = knownSkills.find(
                (s) => s.name.toLowerCase() === trimmed.toLowerCase()
            );

            if (!targetSkill) {
                targetSkill = await createSkillMutation.mutateAsync({ name: trimmed });
                setJustCreatedSkills((prev) => [...prev, targetSkill!]);
            }

            const existsInSelected = selectedSkills.some(
                (s) => s.id === targetSkill!.id
            );
            const nextSkills: SkillInput[] = existsInSelected
                ? selectedSkills.map((s) =>
                    s.id === targetSkill!.id ? { ...s, level: newSkillLevel } : s
                )
                : [...selectedSkills, { id: targetSkill.id, level: newSkillLevel }];

            setSelectedSkills(nextSkills);
            if (!isTopSkill(targetSkill)) {
                setSessionCustomSkillIds((prev) =>
                    prev.includes(targetSkill!.id) ? prev : [...prev, targetSkill!.id]
                );
            }

            setNewSkillName('');
            setNewSkillLevel('Intermediate');

            const saved = await persistProfileWithSkills(nextSkills);
            if (saved) {
                setSkillSavedNotice(`Навык «${targetSkill.name}» добавлен и сохранён`);
                setTimeout(() => setSkillSavedNotice(null), 3000);
            } else {
                setSkillSavedNotice(
                    'Навык добавлен — заполните имя и фамилию, затем нажмите «Сохранить профиль»'
                );
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setSkillError(
                    err.response?.data?.message || 'Не удалось добавить навык.'
                );
            } else {
                setSkillError('Не удалось добавить навык.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveSuccess(false);

        try {
            await persistProfileWithSkills(selectedSkills);
            window.dispatchEvent(new Event('scoutly-auth-change'));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3500);
        } catch (err) {
            console.error('Ошибка сохранения профиля:', err);
            alert('Не удалось сохранить изменения профиля. Попробуйте позже.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#1F4E79]/10 text-[#1F4E79] flex items-center justify-center shrink-0">
                    <User className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Мой профиль и резюме
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Заполните опыт и ключевые навыки, чтобы работодатели находили вас в рекомендациях
                    </p>
                </div>
            </div>

            {isProfileLoading ? (
                <div className="h-96 rounded-2xl bg-slate-200/70 animate-pulse" />
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Фамилия *
                            </label>
                            <input
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Иванов"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Имя *
                            </label>
                            <input
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Алексей"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Отчество
                            </label>
                            <input
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                placeholder="Сергеевич"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Желаемая должность
                            </label>
                            <input
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                placeholder="Middle C# / ASP.NET Core Backend Developer"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                <Wallet className="w-3.5 h-3.5 text-slate-400" />
                                Ожидаемая зарплата (₽)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={expectedSalary}
                                onChange={(e) => setExpectedSalary(e.target.value)}
                                placeholder="180000"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                Телефон
                            </label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+7 (999) 123-45-67"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                <Send className="w-3.5 h-3.5 text-slate-400" />
                                Telegram
                            </label>
                            <input
                                value={telegram}
                                onChange={(e) => setTelegram(e.target.value)}
                                placeholder="@username"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Блок 1: Топ навыков */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#1F4E79]" />
                                Топ навыков
                            </label>
                            <span className="text-xs text-slate-400">
                Выбрано всего: {selectedSkills.length}
              </span>
                        </div>

                        {isSkillsLoading ? (
                            <div className="text-xs text-slate-400">
                                Загрузка списка навыков...
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {topSkills.map((skill) => {
                                    const selected = selectedSkills.some((s) => s.id === skill.id);
                                    return (
                                        <button
                                            type="button"
                                            key={skill.id}
                                            onClick={() => toggleSkill(skill.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                                selected
                                                    ? 'bg-[#1F4E79] text-white border-[#1F4E79] shadow-sm'
                                                    : 'bg-white text-slate-700 border-slate-300 hover:border-[#1F4E79]'
                                            }`}
                                        >
                                            {skill.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Блок 2: Личные дополнительные навыки (автосохранение в профиль) */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <div className="text-xs font-bold text-slate-800">
                                    Мои дополнительные навыки
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    Добавьте свои технологии и укажите уровень владения ими
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <input
                                    type="text"
                                    value={newSkillName}
                                    onChange={(e) => {
                                        setNewSkillName(e.target.value);
                                        if (skillError) setSkillError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustomSkill();
                                        }
                                    }}
                                    placeholder="Например: RabbitMQ, Kafka..."
                                    className="w-44 sm:w-52 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-[#1F4E79] focus:outline-none"
                                />

                                <select
                                    value={newSkillLevel}
                                    onChange={(e) => setNewSkillLevel(e.target.value)}
                                    aria-label="Уровень нового навыка"
                                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#1F4E79] focus:outline-none"
                                >
                                    {SKILL_LEVELS.map((lvl) => (
                                        <option key={lvl.value} value={lvl.value}>
                                            {lvl.label}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    disabled={
                                        !newSkillName.trim() ||
                                        createSkillMutation.isPending ||
                                        saveMutation.isPending
                                    }
                                    onClick={handleAddCustomSkill}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1F4E79] text-white text-xs font-semibold hover:bg-[#173b5c] disabled:opacity-40 transition-colors shrink-0"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    {createSkillMutation.isPending || saveMutation.isPending
                                        ? 'Сохранение...'
                                        : 'Добавить'}
                                </button>
                            </div>
                        </div>

                        {skillError && (
                            <p className="text-xs font-medium text-[#A80036]">{skillError}</p>
                        )}

                        {skillSavedNotice && (
                            <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {skillSavedNotice}
                            </p>
                        )}

                        {personalCustomSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {personalCustomSkills.map((skill) => {
                                    const selectedEntry = selectedSkills.find(
                                        (s) => s.id === skill.id
                                    );
                                    const isSelected = Boolean(selectedEntry);

                                    return (
                                        <div
                                            key={skill.id}
                                            className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                                isSelected
                                                    ? 'bg-[#1F4E79] text-white border-[#1F4E79] shadow-sm'
                                                    : 'bg-white text-slate-700 border-slate-300'
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleSkill(skill.id)}
                                            >
                                                {skill.name}
                                            </button>

                                            <select
                                                value={selectedEntry?.level ?? 'Intermediate'}
                                                onChange={(e) =>
                                                    updateSkillLevel(skill.id, e.target.value)
                                                }
                                                aria-label={`Уровень владения: ${skill.name}`}
                                                className={`rounded-lg px-1.5 py-0.5 text-[11px] font-medium border focus:outline-none cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-white/15 text-white border-white/30 [&>option]:text-slate-900'
                                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}
                                            >
                                                {SKILL_LEVELS.map((lvl) => (
                                                    <option key={lvl.value} value={lvl.value}>
                                                        {lvl.label}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                type="button"
                                                disabled={deleteSkillMutation.isPending}
                                                onClick={() => removeCustomSkill(skill.id)}
                                                title="Удалить навык"
                                                className="p-0.5 rounded opacity-75 hover:opacity-100 disabled:opacity-30"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Общий список выбранных навыков и их уровней */}
                    {selectedSkills.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-slate-600">
                                Уровень владения выбранными навыками
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {selectedSkills.map((item) => {
                                    const skillObj = knownSkills.find((s) => s.id === item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                        >
                      <span className="font-semibold text-slate-800">
                        {skillObj?.name ?? 'Навык'}
                      </span>
                                            <select
                                                value={item.level}
                                                onChange={(e) =>
                                                    updateSkillLevel(item.id, e.target.value)
                                                }
                                                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-[#1F4E79] focus:outline-none"
                                            >
                                                {SKILL_LEVELS.map((lvl) => (
                                                    <option key={lvl.value} value={lvl.value}>
                                                        {lvl.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            О себе и опыте работы
                        </label>
                        <textarea
                            rows={4}
                            value={aboutMe}
                            onChange={(e) => setAboutMe(e.target.value)}
                            placeholder="Расскажите о коммерческом опыте, проектах и достижениях..."
                            className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:border-[#1F4E79] focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-2 border-t border-slate-100">
                        {saveSuccess && (
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Изменения сохранены
              </span>
                        )}

                        <button
                            type="submit"
                            disabled={saveMutation.isPending}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A80036] text-white text-sm font-semibold hover:bg-[#8a002c] disabled:opacity-50 transition-colors shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            {saveMutation.isPending ? 'Сохранение...' : 'Сохранить профиль'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}