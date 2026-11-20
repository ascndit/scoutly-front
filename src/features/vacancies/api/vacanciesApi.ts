import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/axiosInstance';
import type {
    VacancyListItem,
    VacancyDetails,
    CreateVacancyRequest,
} from '../../../shared/types/entities';

export interface GetVacanciesParams {
    search?: string;
    city?: string;
    workFormat?: string;
    salaryMin?: number;
    companyId?: number;
}

export const vacanciesApi = {
    getAll: async (params?: GetVacanciesParams): Promise<VacancyListItem[]> => {
        const { data } = await api.get<VacancyListItem[]>('/vacancies', { params });
        return data;
    },

    getById: async (id: number): Promise<VacancyDetails> => {
        const { data } = await api.get<VacancyDetails>(`/vacancies/${id}`);
        return data;
    },

    create: async (payload: CreateVacancyRequest): Promise<VacancyDetails> => {
        const { data } = await api.post<VacancyDetails>('/vacancies', payload);
        return data;
    },
};

export function useVacanciesQuery(params?: GetVacanciesParams) {
    return useQuery({
        queryKey: ['vacancies', params],
        queryFn: () => vacanciesApi.getAll(params),
    });
}

export function useCreateVacancyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: vacanciesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacancies'] });
        },
    });
}