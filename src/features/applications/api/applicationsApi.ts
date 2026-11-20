import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/axiosInstance';

export interface ApplyToVacancyCommand {
    vacancyId: number;
    specialistProfileId: number;
    coverLetter?: string | null;
}

export interface ApplicationResponse {
    id: number;
    vacancyId: number;
    vacancyTitle: string;
    companyName: string;
    status: string;
    coverLetter: string | null;
    appliedAt: string;
}

export const applicationsApi = {
    apply: async (command: ApplyToVacancyCommand): Promise<ApplicationResponse> => {
        const { data } = await api.post<ApplicationResponse>('/applications', command);
        return data;
    },

    getMyApplications: async (
        specialistProfileId: number
    ): Promise<ApplicationResponse[]> => {
        const { data } = await api.get<ApplicationResponse[]>(
            `/applications/my/${specialistProfileId}`
        );
        return data;
    },
};

export function useMyApplicationsQuery(specialistProfileId: number) {
    return useQuery({
        queryKey: ['applications', 'my', specialistProfileId],
        queryFn: () => applicationsApi.getMyApplications(specialistProfileId),
        enabled: specialistProfileId > 0,
    });
}

export function useApplyToVacancyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: applicationsApi.apply,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['applications', 'my', variables.specialistProfileId],
            });
        },
    });
}