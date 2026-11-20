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

export const TOP_SKILL_NAMES = new Set([
    '.net 9',
    'asp.net core',
    'c#',
    'ci/cd',
    'cqrs',
    'docker',
    'docker compose',
    'entity framework core',
    'flutter',
    'git',
    'go',
    'javascript',
    'microsoft sql server',
    'postgresql',
    'python',
    'react',
    'redis',
    'rest api',
    'sql',
    'typescript',
    'vertical slice architecture',
    'wpf',
]);

export function isTopSkill(skill: Pick<SkillResponse, 'name'>): boolean {
    return TOP_SKILL_NAMES.has(skill.name.trim().toLowerCase());
}

export const skillsApi = {
    getAll: async (
        search?: string,
        categoryId?: number
    ): Promise<SkillResponse[]> => {
        const { data } = await api.get<SkillResponse[]>('/skill', {
            params: { search: search || undefined, categoryId },
        });
        return data;
    },

    create: async (command: CreateSkillCommand): Promise<SkillResponse> => {
        const { data } = await api.post<SkillResponse>('/skill', command);
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/skill/${id}`);
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

export function useDeleteSkillMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: skillsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
    });
}