import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/axiosInstance';

export interface RankedCandidateResponse {
    specialistProfileId: number;
    fullName: string;
    headline: string | null;
    city: string | null;
    expectedSalary: number | null;
    matchScore: number;
    matchedSkills: string[];
}

export interface CandidateMatchScoreResponse {
    vacancyId: number;
    specialistProfileId: number;
    matchPercentage: number;
    passedMandatorySkills: boolean;
    missingRequiredSkills: string[];
    matchedSkills: string[];
}

export interface AddCandidateToPipelineCommand {
    recruiterUserId: number;
    specialistProfileId: number;
    vacancyId: number;
}

export interface RecruiterCandidateResponse {
    id: number;
    recruiterUserId: number;
    specialistProfileId: number;
    vacancyId: number | null;
    matchScore: number | null;
    stage: string;
    createdAt: string;
}

export interface ChangeCandidateStageCommand {
    recruiterCandidateId: number;
    recruiterUserId: number;
    newStage: string;
    comment?: string | null;
}

export interface InteractionHistoryResponse {
    id: number;
    authorUserId: number;
    actionType: string;
    notes: string;
    createdAt: string;
}

export const scoutingApi = {
    autoMatch: async (vacancyId: number): Promise<RankedCandidateResponse[]> => {
        const { data } = await api.get<RankedCandidateResponse[]>(
            `/scouting/auto-match/${vacancyId}`
        );
        return data;
    },

    getMatchScore: async (
        vacancyId: number,
        specialistProfileId: number
    ): Promise<CandidateMatchScoreResponse> => {
        const { data } = await api.get<CandidateMatchScoreResponse>(
            '/scouting/match-score',
            { params: { vacancyId, specialistProfileId } }
        );
        return data;
    },

    addToPipeline: async (
        command: AddCandidateToPipelineCommand
    ): Promise<RecruiterCandidateResponse> => {
        const { data } = await api.post<RecruiterCandidateResponse>(
            '/scouting/pipeline',
            command
        );
        return data;
    },

    changeStage: async (
        command: ChangeCandidateStageCommand
    ): Promise<{ message: string }> => {
        const { data } = await api.post<{ message: string }>(
            '/scouting/change-stage',
            command
        );
        return data;
    },

    getHistory: async (
        recruiterCandidateId: number
    ): Promise<InteractionHistoryResponse[]> => {
        const { data } = await api.get<InteractionHistoryResponse[]>(
            `/scouting/history/${recruiterCandidateId}`
        );
        return data;
    },
};

export function useAutoMatchQuery(vacancyId: number | null) {
    return useQuery({
        queryKey: ['scouting', 'auto-match', vacancyId],
        queryFn: () => scoutingApi.autoMatch(vacancyId!),
        enabled: vacancyId !== null && vacancyId > 0,
    });
}

export function useMatchScoreQuery(
    vacancyId: number | null,
    specialistProfileId: number | null
) {
    return useQuery({
        queryKey: ['scouting', 'match-score', vacancyId, specialistProfileId],
        queryFn: () =>
            scoutingApi.getMatchScore(vacancyId!, specialistProfileId!),
        enabled:
            vacancyId !== null &&
            vacancyId > 0 &&
            specialistProfileId !== null &&
            specialistProfileId > 0,
    });
}

export function useCandidateHistoryQuery(recruiterCandidateId: number | null) {
    return useQuery({
        queryKey: ['scouting', 'history', recruiterCandidateId],
        queryFn: () => scoutingApi.getHistory(recruiterCandidateId!),
        enabled: recruiterCandidateId !== null && recruiterCandidateId > 0,
    });
}

export function useAddToPipelineMutation() {
    return useMutation({
        mutationFn: scoutingApi.addToPipeline,
    });
}

export function useChangeStageMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: scoutingApi.changeStage,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['scouting', 'history', variables.recruiterCandidateId],
            });
        },
    });
}