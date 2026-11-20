import { useEffect, useMemo, useState } from 'react';
import {
    Sparkles,
    UserPlus,
    CheckCircle2,
    XCircle,
    History,
    MapPin,
    Wallet,
    ArrowRight,
    SlidersHorizontal,
} from 'lucide-react';
import { useVacanciesQuery } from '../features/vacancies/api/vacanciesApi';
import {
    useAutoMatchQuery,
    useMatchScoreQuery,
    useAddToPipelineMutation,
    useChangeStageMutation,
    useCandidateHistoryQuery,
    type RankedCandidateResponse,
    type RecruiterCandidateResponse,
} from '../features/scouting/api/scoutingApi';
import { Button } from '../shared/ui/Button';

interface PipelineCard extends RecruiterCandidateResponse {
    fullName: string;
    headline: string | null;
}

const PIPELINE_STAGES = [
    { key: 'New', label: 'Новый' },
    { key: 'Contacted', label: 'Контакт' },
    { key: 'Screening', label: 'Скрининг' },
    { key: 'Interview', label: 'Интервью' },
    { key: 'Offer', label: 'Оффер' },
    { key: 'Rejected', label: 'Отказ' },
];

const RECRUITER_USER_ID = 1;
const STORAGE_KEY = 'scoutly_pipeline_cards_v1';

export function ScoutingWorkspacePage() {
    const { data: vacancies = [], isLoading: isVacanciesLoading } =
        useVacanciesQuery();

    const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(
        null
    );
    const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

    // Выбранный кандидат для детального скоринга (match-score)
    const [inspectCandidate, setInspectCandidate] =
        useState<RankedCandidateResponse | null>(null);

    // Кандидат в воронке, для которого открыт журнал истории (history/{id})
    const [activeHistoryCard, setActiveHistoryCard] =
        useState<PipelineCard | null>(null);
    const [stageComment, setStageComment] = useState('');

    // Локальное хранилище добавленных карточек воронки (т.к. на бэкенде нет GET /scouting/pipeline)
    const [pipelineCards, setPipelineCards] = useState<PipelineCard[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pipelineCards));
    }, [pipelineCards]);

    useEffect(() => {
        if (selectedVacancyId === null && vacancies.length > 0) {
            setSelectedVacancyId(vacancies[0].id);
        }
    }, [vacancies, selectedVacancyId]);

    const {
        data: rankedCandidates = [],
        isLoading: isMatching,
        isError: isMatchError,
    } = useAutoMatchQuery(selectedVacancyId);

    const { data: matchScoreDetails, isLoading: isScoreLoading } =
        useMatchScoreQuery(
            selectedVacancyId,
            inspectCandidate?.specialistProfileId ?? null
        );

    const { data: historyEntries = [], isLoading: isHistoryLoading } =
        useCandidateHistoryQuery(activeHistoryCard?.id ?? null);

    const addToPipelineMutation = useAddToPipelineMutation();
    const changeStageMutation = useChangeStageMutation();

    const filteredCandidates = useMemo(
        () =>
            rankedCandidates.filter((c) => Number(c.matchScore) >= minScoreFilter),
        [rankedCandidates, minScoreFilter]
    );

    const currentVacancyPipeline = useMemo(
        () => pipelineCards.filter((c) => c.vacancyId === selectedVacancyId),
        [pipelineCards, selectedVacancyId]
    );

    const handleAddToPipeline = async (candidate: RankedCandidateResponse) => {
        if (!selectedVacancyId) return;

        const alreadyAdded = currentVacancyPipeline.some(
            (c) => c.specialistProfileId === candidate.specialistProfileId
        );
        if (alreadyAdded) return;

        try {
            const created = await addToPipelineMutation.mutateAsync({
                recruiterUserId: RECRUITER_USER_ID,
                specialistProfileId: candidate.specialistProfileId,
                vacancyId: selectedVacancyId,
            });

            const newCard: PipelineCard = {
                ...created,
                fullName: candidate.fullName,
                headline: candidate.headline,
            };

            setPipelineCards((prev) => [newCard, ...prev]);
            setActiveHistoryCard(newCard);
        } catch (err) {
            console.error('Ошибка добавления в воронку:', err);
            alert('Не удалось добавить кандидата в воронку. Проверьте ID рекрутера в БД.');
        }
    };

    const handleChangeStage = async (
        card: PipelineCard,
        newStage: string,
        comment?: string
    ) => {
        try {
            await changeStageMutation.mutateAsync({
                recruiterCandidateId: card.id,
                recruiterUserId: RECRUITER_USER_ID,
                newStage,
                comment: comment || null,
            });

            setPipelineCards((prev) =>
                prev.map((item) =>
                    item.id === card.id ? { ...item, stage: newStage } : item
                )
            );

            if (activeHistoryCard?.id === card.id) {
                setActiveHistoryCard({ ...card, stage: newStage });
            }
            setStageComment('');
        } catch (err) {
            console.error('Ошибка смены этапа:', err);
            alert('Сервер отклонил смену этапа. Проверьте допустимые значения CandidateStages.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Шапка и выбор вакансии */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 text-[#1F4E79] font-semibold text-sm mb-1">
                        <Sparkles className="w-4 h-4 text-[#A80036]" />
                        <span>Интеллектуальный скаутинг и скоринг</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Автоподбор кандидатов
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-slate-500 mb-1">
                            Целевая вакансия
                        </label>
                        <select
                            value={selectedVacancyId ?? ''}
                            onChange={(e) => {
                                setSelectedVacancyId(Number(e.target.value));
                                setInspectCandidate(null);
                            }}
                            disabled={isVacanciesLoading || vacancies.length === 0}
                            className="min-w-[260px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-[#1F4E79] focus:outline-none"
                        >
                            {vacancies.length === 0 && (
                                <option value="">Нет активных вакансий</option>
                            )}
                            {vacancies.map((v) => (
                                <option key={v.id} value={v.id}>
                                    #{v.id} — {v.title} ({v.companyName})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                            <SlidersHorizontal className="w-3 h-3" />
                            Мин. скоринг: {minScoreFilter}%
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={10}
                            value={minScoreFilter}
                            onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                            className="h-9 accent-[#1F4E79] cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Основная сетка: Ранжированная выдача слева + Детали скоринга/Истории справа */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Левая колонка (2/3): Список кандидатов из AutoMatch */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Релевантные специалисты ({filteredCandidates.length})
                        </h2>
                        {selectedVacancyId && (
                            <span className="text-xs text-slate-500">
                GET /api/scouting/auto-match/{selectedVacancyId}
              </span>
                        )}
                    </div>

                    {isMatching ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-32 rounded-2xl bg-slate-200/70 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : isMatchError ? (
                        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                            Не удалось загрузить подборку кандидатов для выбранной вакансии.
                        </div>
                    ) : filteredCandidates.length === 0 ? (
                        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                            По выбранным критериям кандидаты не найдены. Попробуйте снизить порог скоринга или проверьте наличие профилей в таблице{' '}
                            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                                specialist_profiles
                            </code>
                            .
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredCandidates.map((candidate) => {
                                const inPipeline = currentVacancyPipeline.some(
                                    (c) =>
                                        c.specialistProfileId === candidate.specialistProfileId
                                );
                                const score = Number(candidate.matchScore);
                                const badgeColor =
                                    score >= 75
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : score >= 40
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-slate-100 text-slate-600 border-slate-200';

                                return (
                                    <div
                                        key={candidate.specialistProfileId}
                                        className={`bg-white p-5 rounded-2xl border transition-all ${
                                            inspectCandidate?.specialistProfileId ===
                                            candidate.specialistProfileId
                                                ? 'border-[#1F4E79] ring-2 ring-[#1F4E79]/10'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <h3 className="text-base font-bold text-slate-900">
                                                        {candidate.fullName ||
                                                            `Специалист #${candidate.specialistProfileId}`}
                                                    </h3>
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}
                                                    >
                            Совпадение: {score}%
                          </span>
                                                </div>

                                                {candidate.headline && (
                                                    <p className="text-sm font-medium text-[#1F4E79]">
                                                        {candidate.headline}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                                                    {candidate.city && (
                                                        <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                                                            {candidate.city}
                            </span>
                                                    )}
                                                    {candidate.expectedSalary && (
                                                        <span className="flex items-center gap-1">
                              <Wallet className="w-3.5 h-3.5" />
                              от {candidate.expectedSalary.toLocaleString('ru-RU')} ₽
                            </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setInspectCandidate(candidate)}
                                                >
                                                    Разбор скоринга
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    disabled={
                                                        inPipeline || addToPipelineMutation.isPending
                                                    }
                                                    onClick={() => handleAddToPipeline(candidate)}
                                                >
                                                    {inPipeline ? (
                                                        <>
                                                            <CheckCircle2 className="w-4 h-4 mr-1.5" />В воронке
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus className="w-4 h-4 mr-1.5" />В воронку
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {candidate.matchedSkills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100">
                                                {candidate.matchedSkills.map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#1F4E79]/10 text-[#1F4E79]"
                                                    >
                            {skill}
                          </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Правая колонка (1/3): Панель детального скоринга (CalculateMatchScoreQuery) */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Детализация скоринга
                    </h2>

                    {!inspectCandidate ? (
                        <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-300 text-sm text-slate-500 text-center">
                            Нажмите <strong>«Разбор скоринга»</strong> на карточке любого кандидата, чтобы проверить обязательные навыки и веса компетенций.
                        </div>
                    ) : isScoreLoading ? (
                        <div className="h-48 rounded-2xl bg-slate-200/70 animate-pulse" />
                    ) : matchScoreDetails ? (
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <div>
                                <div className="text-xs text-slate-500">Кандидат</div>
                                <div className="font-bold text-slate-900">
                                    {inspectCandidate.fullName}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-sm text-slate-600">Итоговый балл</span>
                                <span className="text-xl font-extrabold text-[#1F4E79]">
                  {matchScoreDetails.matchPercentage}%
                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                {matchScoreDetails.passedMandatorySkills ? (
                                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Обязательные навыки пройдены
                  </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-[#A80036] font-medium">
                    <XCircle className="w-4 h-4" />
                    Не хватает обязательных навыков
                  </span>
                                )}
                            </div>

                            {matchScoreDetails.matchedSkills.length > 0 && (
                                <div>
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Подтверждённые навыки
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {matchScoreDetails.matchedSkills.map((s) => (
                                            <span
                                                key={s}
                                                className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium"
                                            >
                        {s}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {matchScoreDetails.missingRequiredSkills.length > 0 && (
                                <div>
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Отсутствуют (обязательные)
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {matchScoreDetails.missingRequiredSkills.map((s) => (
                                            <span
                                                key={s}
                                                className="px-2 py-0.5 rounded bg-rose-50 text-[#A80036] border border-rose-200 text-xs font-medium"
                                            >
                        {s}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Секция воронки рекрутера и истории взаимодействий */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Воронка рекрутера по вакансии ({currentVacancyPipeline.length})
                        </h2>
                        <p className="text-xs text-slate-500">
                            Управление этапами (POST /api/scouting/change-stage) и журнал событий
                        </p>
                    </div>
                </div>

                {currentVacancyPipeline.length === 0 ? (
                    <div className="text-sm text-slate-500 py-6 text-center bg-slate-50 rounded-xl">
                        Воронка по этой вакансии пока пуста. Добавьте кандидатов из списка выше кнопкой{' '}
                        <strong>«В воронку»</strong>.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Карточки в воронке */}
                        <div className="lg:col-span-2 space-y-3">
                            {currentVacancyPipeline.map((card) => (
                                <div
                                    key={card.id}
                                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                        activeHistoryCard?.id === card.id
                                            ? 'border-[#1F4E79] bg-[#1F4E79]/[0.02]'
                                            : 'border-slate-200'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {card.fullName}
                      </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        Запись #{card.id}
                      </span>
                                            {card.matchScore !== null && (
                                                <span className="text-xs font-semibold text-[#1F4E79]">
                          {card.matchScore}%
                        </span>
                                            )}
                                        </div>
                                        {card.headline && (
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {card.headline}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <select
                                            value={card.stage}
                                            onChange={(e) => handleChangeStage(card, e.target.value)}
                                            disabled={changeStageMutation.isPending}
                                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-[#1F4E79] focus:outline-none"
                                        >
                                            {PIPELINE_STAGES.map((st) => (
                                                <option key={st.key} value={st.key}>
                                                    {st.label} ({st.key})
                                                </option>
                                            ))}
                                        </select>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setActiveHistoryCard(card)}
                                        >
                                            <History className="w-3.5 h-3.5 mr-1" />
                                            История
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Журнал истории (GetCandidateHistoryQuery) */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <History className="w-4 h-4 text-[#1F4E79]" />
                                    История взаимодействий
                                </h3>
                                {activeHistoryCard && (
                                    <span className="text-xs text-slate-500">
                    #{activeHistoryCard.id}
                  </span>
                                )}
                            </div>

                            {!activeHistoryCard ? (
                                <p className="text-xs text-slate-500">
                                    Выберите карточку кандидата в воронке, чтобы просмотреть или дополнить журнал событий.
                                </p>
                            ) : (
                                <>
                                    {/* Быстрый комментарий со сменой/подтверждением этапа */}
                                    <div className="space-y-2">
                    <textarea
                        rows={2}
                        value={stageComment}
                        onChange={(e) => setStageComment(e.target.value)}
                        placeholder="Добавить заметку в историю (например: созвон в 15:00)..."
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:border-[#1F4E79] focus:outline-none"
                    />
                                        <Button
                                            size="sm"
                                            className="w-full"
                                            disabled={
                                                !stageComment.trim() || changeStageMutation.isPending
                                            }
                                            onClick={() =>
                                                handleChangeStage(
                                                    activeHistoryCard,
                                                    activeHistoryCard.stage,
                                                    stageComment
                                                )
                                            }
                                        >
                                            Сохранить заметку
                                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                        </Button>
                                    </div>

                                    {isHistoryLoading ? (
                                        <div className="text-xs text-slate-400">
                                            Загрузка журнала...
                                        </div>
                                    ) : historyEntries.length === 0 ? (
                                        <div className="text-xs text-slate-400">
                                            Записей пока нет.
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                            {historyEntries.map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1"
                                                >
                                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-semibold text-[#1F4E79]">
                              {entry.actionType}
                            </span>
                                                        <span>
                              {new Date(entry.createdAt).toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                              })}
                            </span>
                                                    </div>
                                                    <p className="text-slate-700 leading-relaxed">
                                                        {entry.notes}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}