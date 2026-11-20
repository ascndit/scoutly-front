import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Inbox,
    User,
    MapPin,
    Briefcase,
    Clock,
} from 'lucide-react';
import { api } from '../shared/api/axiosInstance';

interface IncomingApplicationResponse {
    id: number;
    vacancyId: number;
    vacancyTitle: string;
    specialistProfileId: number;
    candidateFullName: string;
    candidateHeadline: string | null;
    candidateCity: string | null;
    status: string;
    coverLetter: string | null;
    appliedAt: string;
}

const APPLICATION_STATUSES = [
    { key: 'Pending', label: 'Новый отклик' },
    { key: 'Reviewed', label: 'Просмотрено' },
    { key: 'Interview', label: 'Интервью' },
    { key: 'Accepted', label: 'Оффер / Принят' },
    { key: 'Rejected', label: 'Отказ' },
];

export function EmployerResponsesPage() {
    const queryClient = useQueryClient();
    const [companyId] = useState<number>(() => {
        const saved = localStorage.getItem('scoutly_company_id');
        return saved ? Number(saved) : 1;
    });

    const {
        data: responses = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['applications', 'incoming', companyId],
        queryFn: async () => {
            const { data } = await api.get<IncomingApplicationResponse[]>(
                '/applications/incoming',
                { params: { companyId } }
            );
            return data;
        },
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            await api.patch(`/applications/${id}/status`, {
                applicationId: id,
                status,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                        <Inbox className="w-6 h-6 text-[#1F4E79]" />
                        Входящие отклики
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Резюме кандидатов, откликнувшихся на вакансии компании #{companyId}
                    </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1F4E79]/10 text-[#1F4E79]">
          Всего: {responses.length}
        </span>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-32 rounded-2xl bg-slate-200/70 animate-pulse"
                        />
                    ))}
                </div>
            ) : isError ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                    Эндпоинт <code>GET /api/applications/incoming</code> ещё не добавлен в{' '}
                    <code>ApplicationsController.cs</code> или бэкенд не перезапущен.
                </div>
            ) : responses.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                    На вакансии компании #{companyId} пока нет входящих откликов.
                </div>
            ) : (
                <div className="space-y-4">
                    {responses.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-[#1F4E79]">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        Вакансия: {item.vacancyTitle} (#{item.vacancyId})
                                    </div>

                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400" />
                                        {item.candidateFullName ||
                                            `Специалист #${item.specialistProfileId}`}
                                    </h2>

                                    {item.candidateHeadline && (
                                        <p className="text-sm text-slate-700">
                                            {item.candidateHeadline}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                                        {item.candidateCity && (
                                            <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                                                {item.candidateCity}
                      </span>
                                        )}
                                        <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                                            {new Date(item.appliedAt).toLocaleString('ru-RU', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                    </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <select
                                        value={item.status}
                                        disabled={statusMutation.isPending}
                                        onChange={(e) =>
                                            statusMutation.mutate({
                                                id: item.id,
                                                status: e.target.value,
                                            })
                                        }
                                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#1F4E79] focus:outline-none"
                                    >
                                        {APPLICATION_STATUSES.map((st) => (
                                            <option key={st.key} value={st.key}>
                                                {st.label} ({st.key})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {item.coverLetter && (
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-500 block mb-1">
                    Сопроводительное письмо кандидата:
                  </span>
                                    {item.coverLetter}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}