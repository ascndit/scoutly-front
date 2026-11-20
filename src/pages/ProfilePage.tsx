import { useEffect, useState } from 'react';
import {
    User,
    MapPin,
    Phone,
    Send,
    Wallet,
    CheckCircle2,
    Save,
    Sparkles,
} from 'lucide-react';
import {
    useProfileQuery,
    useSaveProfileMutation,
    type SkillInput,
} from '../features/profiles/api/profilesApi';
import { useSkillsQuery } from '../features/skills/api/skillsApi';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export function ProfilePage() {
    const [profileId, setProfileId] = useState<number>(() => {
        const saved = localStorage.getItem('scoutly_specialist_profile_id');
        return saved ? Number(saved) : 1;
    });

    const { data: profile, isLoading: isProfileLoading } = useProfileQuery(profileId);
    const { data: allSkills = [], isLoading: isSkillsLoading } = useSkillsQuery();
    const saveMutation = useSaveProfileMutation();

    const [userId, setUserId] = useState<number>(1);
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
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Заполняем форму данными из PostgreSQL при загрузке профиля
    useEffect(() => {
        if (!profile) return;

        setUserId(profile.userId);
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

    // Сопоставляем строковые названия навыков из ProfileResponse с ID из /api/skill
    useEffect(() => {
        if (!profile || allSkills.length === 0) return;

        const matched: SkillInput[] = profile.skills
            .map((skillName) => {
                const found = allSkills.find(
                    (s) => s.name.toLowerCase() === skillName.toLowerCase()
                );
                return found ? { id: found.id, level: 'Intermediate' } : null;
            })
            .filter((item): item is SkillInput => item !== null);

        setSelectedSkills(matched);
    }, [profile, allSkills]);

    const toggleSkill = (skillId: number) => {
        setSelectedSkills((prev) => {
            const exists = prev.some((s) => s.id === skillId);
            if (exists) {
                return prev.filter((s) => s.id !== skillId);
            }
            return [...prev, { id: skillId, level: 'Intermediate' }];
        });
    };

    const updateSkillLevel = (skillId: number, level: string) => {
        setSelectedSkills((prev) =>
            prev.map((s) => (s.id === skillId ? { ...s, level } : s))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveSuccess(false);

        try {
            const saved = await saveMutation.mutateAsync({
                userId,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                middleName: middleName.trim() || null,
                headline: headline.trim() || null,
                city: city.trim() || null,
                phone: phone.trim() || null,
                telegram: telegram.trim() || null,
                expectedSalary: expectedSalary ? Number(expectedSalary) : null,
                aboutMe: aboutMe.trim() || null,
                skillIds: selectedSkills,
            });

            setProfileId(saved.id);
            localStorage.setItem('scoutly_specialist_profile_id', String(saved.id));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3500);
        } catch (err) {
            console.error('Ошибка сохранения профиля:', err);
            alert('Не удалось сохранить профиль. Проверьте, что UserId существует в таблице users.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1F4E79]/10 text-[#1F4E79] flex items-center justify-center">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Резюме и профиль специалиста
                        </h1>
                        <p className="text-xs text-slate-500">
                            Используется алгоритмом скоринга при автоподборе кандидатов
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div>
                        <label className="block text-[11px] font-medium text-slate-500">
                            ID профиля
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={profileId}
                            onChange={(e) => setProfileId(Number(e.target.value) || 1)}
                            className="w-20 rounded-xl border border-slate-300 px-2.5 py-1.5 text-sm font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-medium text-slate-500">
                            UserId (БД)
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={userId}
                            onChange={(e) => setUserId(Number(e.target.value) || 1)}
                            className="w-20 rounded-xl border border-slate-300 px-2.5 py-1.5 text-sm font-semibold"
                        />
                    </div>
                </div>
            </div>

            {isProfileLoading ? (
                <div className="h-96 rounded-2xl bg-slate-200/70 animate-pulse" />
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
                >
                    {/* ФИО */}
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

                    {/* Желаемая должность и зарплата */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Желаемая должность (Headline)
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
                                Ожидания (₽)
                            </label>
                            <input
                                type="number"
                                min={0}
                                step={5000}
                                value={expectedSalary}
                                onChange={(e) => setExpectedSalary(e.target.value)}
                                placeholder="180000"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1F4E79] focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Контакты и город */}
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

                    {/* Стек компетенций из БД (/api/skill) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#1F4E79]" />
                                Ключевые навыки (из справочника БД)
                            </label>
                            <span className="text-xs text-slate-400">
                Выбрано: {selectedSkills.length}
              </span>
                        </div>

                        {isSkillsLoading ? (
                            <div className="text-xs text-slate-400">
                                Загрузка навыков из /api/skill...
                            </div>
                        ) : allSkills.length === 0 ? (
                            <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                                В таблице <code>skills</code> пока нет записей.
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {allSkills.map((skill) => {
                                    const selected = selectedSkills.find((s) => s.id === skill.id);
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

                        {/* Уровень владения выбранными навыками */}
                        {selectedSkills.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                                {selectedSkills.map((item) => {
                                    const skillObj = allSkills.find((s) => s.id === item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                                        >
                      <span className="font-semibold text-slate-800">
                        {skillObj?.name ?? `Skill #${item.id}`}
                      </span>
                                            <select
                                                value={item.level}
                                                onChange={(e) =>
                                                    updateSkillLevel(item.id, e.target.value)
                                                }
                                                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-[#1F4E79] focus:outline-none"
                                            >
                                                {SKILL_LEVELS.map((lvl) => (
                                                    <option key={lvl} value={lvl}>
                                                        {lvl}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* О себе */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            О себе и опыте работы
                        </label>
                        <textarea
                            rows={4}
                            value={aboutMe}
                            onChange={(e) => setAboutMe(e.target.value)}
                            placeholder="Расскажите о коммерческом опыте, пет-проектах, архитектуре и достижениях..."
                            className="w-full rounded-xl border border-slate-300 p-3.5 text-sm focus:border-[#1F4E79] focus:outline-none"
                        />
                    </div>

                    {/* Кнопка сохранения */}
                    <div className="flex items-center justify-end gap-4 pt-2 border-t border-slate-100">
                        {saveSuccess && (
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Профиль сохранён в PostgreSQL!
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