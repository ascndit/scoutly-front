export type UserRole = 'Applicant' | 'Employer' | 'Recruiter' | 'Admin';

export interface VacancyListItem {
    id: number;
    companyName: string;
    title: string;
    city?: string | null;
    workFormat: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    requiredSkills: string[];
    createdAt: string;
}

export interface VacancyDetails extends VacancyListItem {
    companyId: number;
    description: string;
    status: string;
}

export interface CreateVacancyRequest {
    companyId: number;
    title: string;
    description: string;
    city?: string | null;
    workFormat: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    skillIds: number[];
}

export interface Application {
    id: string;
    candidateId: string;
    vacancyId: number;
    vacancyTitle?: string;
    companyName?: string;
    coverLetter?: string;
    status: 'New' | 'Reviewing' | 'Interview' | 'Offer' | 'Rejected';
    appliedAt: string;
}