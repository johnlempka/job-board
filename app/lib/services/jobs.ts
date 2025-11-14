import { prisma } from "@/lib/prisma";
import type { JobModel, CompanyModel } from "@/app/models/types";

type JobWithCompany = JobModel & {
    company: {
        name: string;
        logo: string | null;
    };
};

type JobDetail = JobModel & {
    company: CompanyModel;
};

/**
 * Service layer for job-related data fetching
 * Used by server components for direct database access
 */
export async function getJobs(): Promise<JobWithCompany[]> {
    const jobs = await prisma.job.findMany({
        include: {
            company: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return jobs.map((job) => ({
        ...job,
        locations: job.locations as JobModel["locations"],
        remotePolicy: job.remotePolicy as JobModel["remotePolicy"],
        perks: job.perks || [],
        benefits: job.benefits || [],
        company: {
            name: job.company.name,
            logo: job.company.logo,
        },
    }));
}

export async function getJob(id: string): Promise<JobDetail | null> {
    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            company: true,
        },
    });

    if (!job) {
        return null;
    }

    return {
        ...job,
        locations: job.locations as JobModel["locations"],
        remotePolicy: job.remotePolicy as JobModel["remotePolicy"],
        perks: job.perks || [],
        benefits: job.benefits || [],
        company: {
            ...job.company,
            locations: job.company.locations as CompanyModel["locations"],
        },
    };
}

