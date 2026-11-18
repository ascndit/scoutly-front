export type UserRole = 'Applicant' | 'Employer' | 'Recruiter' | 'Admin';

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: UserRole;
    };
}

export interface Skill {
    id: number;
    name: string;
    categoryId: number;
}

export interface Vacancy {
    id: string;
    companyId: string;
    companyName?: string;
    title: string;
    description: string;
    minSalary?: number;
    maxSalary?: number;
    targetGrade: string;
    status: 'Active' | 'Paused' | 'Archived';
    createdAt: string;
    skills: {
        skillId: number;
        skillName: string;
        isRequired: boolean;
    }[];
}

export interface Application {
    id: string;
    candidateId: string;
    vacancyId: string;
    vacancyTitle?: string;
    companyName?: string;
    coverLetter?: string;
    status: 'New' | 'Reviewing' | 'Interview' | 'Offer' | 'Rejected';
    appliedAt: string;
}