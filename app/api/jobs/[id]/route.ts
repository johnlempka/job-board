import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { JobModel } from "@/app/models/types";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                company: true,
            },
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        const formattedJob: JobModel = {
            id: job.id,
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            responsibilities: job.responsibilities,
            perks: job.perks || [],
            benefits: job.benefits || [],
            companyId: job.companyId,
            locations: job.locations as JobModel["locations"],
            url: job.url,
            remotePolicy: job.remotePolicy as JobModel["remotePolicy"],
            employmentType: job.employmentType as JobModel["employmentType"],
            daysPerWeek: job.daysPerWeek,
            techStack: job.techStack,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };

        return NextResponse.json(formattedJob);
    } catch (error) {
        console.error("Error fetching job:", error);
        return NextResponse.json(
            { error: "Failed to fetch job" },
            { status: 500 }
        );
    }
}

