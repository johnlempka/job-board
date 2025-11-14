export type RemotePolicy = "remote" | "hybrid" | "in_office";

export type EmploymentType = "full_time" | "part_time" | "contract" | "temporary" | "internship";

export type LocationModel = {
    city: string;
    state: string;
};

export type JobModel = {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    perks: string[];
    benefits: string[];
    companyId: string;
    locations: LocationModel[];
    url: string;
    remotePolicy: RemotePolicy;
    employmentType: EmploymentType;
    daysPerWeek: number | null;
    techStack: string[];
    createdAt: Date;
    updatedAt: Date;
};

export type CompanyModel = {
    id: string;
    name: string;
    description: string;
    locations: LocationModel[];
    url: string;
    logo: string | null;
    companySize: string;
    ownershipType: string;
    fundingType: string;
    amountRaised: bigint | null;
    lastRoundLetter: string | null;
    createdAt: Date;
    updatedAt: Date;
};

