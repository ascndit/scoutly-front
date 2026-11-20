import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/axiosInstance';

export interface SkillResponse {
    id: number;
    name: string;
    categoryId?: number | null;
    categoryName?: string | null;
}

export interface CreateSkillCommand {
    name: string;
    categoryId?: number | null;
}

export const skillsApi = {
    getAll: async (search?: string, categoryId?: number): Promise<SkillResponse[]> => {
        const { data } = await api.get<SkillResponse[]>('/skill', {
            params: { search: search || undefined, categoryId },
        });
        return data;
    },

    create: async (command: CreateSkillCommand): Promise<SkillResponse> => {
        const { data } = await api.post<SkillResponse>('/skill', command);
        return data;
    },
};

export function useSkillsQuery(search?: string, categoryId?: number) {
    return useQuery({
        queryKey: ['skills', { search, categoryId }],
        queryFn: () => skillsApi.getAll(search, categoryId),
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateSkillMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: skillsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
    });
}