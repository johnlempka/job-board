import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { JobModel } from "@/app/models/types";

export async function GET() {
    try {
        const jobs = await prisma.job.findMany({
            include: {
                company: true,
            },
        });

        const formattedJobs = jobs.map((job) => ({
            id: job.id,
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            responsibilities: job.responsibilities,
            perks: job.perks || [],
            benefits: job.benefits || [],
            companyId: job.companyId,
            company: {
                name: job.company.name,
                logo: job.company.logo,
            },
            locations: job.locations as JobModel["locations"],
            url: job.url,
            remotePolicy: job.remotePolicy as JobModel["remotePolicy"],
            daysPerWeek: job.daysPerWeek,
            techStack: job.techStack,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        }));

        return NextResponse.json(formattedJobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json(
            { error: "Failed to fetch jobs" },
            { status: 500 }
        );
    }
}

