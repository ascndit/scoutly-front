import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/axiosInstance';

export interface SkillInput {
    id: number;
    level: string;
}

export interface CreateOrUpdateProfileCommand {
    userId: number;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    headline?: string | null;
    city?: string | null;
    phone?: string | null;
    telegram?: string | null;
    expectedSalary?: number | null;
    aboutMe?: string | null;
    skillIds: SkillInput[];
}

export interface ProfileResponse {
    id: number;
    userId: number;
    fullName: string;
    headline: string | null;
    city: string | null;
    phone: string | null;
    telegram: string | null;
    expectedSalary: number | null;
    aboutMe: string | null;
    skills: string[];
}

export const profilesApi = {
    getById: async (id: number): Promise<ProfileResponse> => {
        const { data } = await api.get<ProfileResponse>(`/profiles/${id}`);
        return data;
    },

    save: async (command: CreateOrUpdateProfileCommand): Promise<ProfileResponse> => {
        const { data } = await api.post<ProfileResponse>('/profiles', command);
        return data;
    },
};

export function useProfileQuery(id: number) {
    return useQuery({
        queryKey: ['profiles', id],
        queryFn: () => profilesApi.getById(id),
        enabled: id > 0,
        retry: false,
    });
}

export function useSaveProfileMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: profilesApi.save,
        onSuccess: (saved) => {
            queryClient.setQueryData(['profiles', saved.id], saved);
            queryClient.invalidateQueries({ queryKey: ['scouting'] });
        },
    });
}