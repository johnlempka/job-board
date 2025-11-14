import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import { getJobs, getJob } from "../app/lib/services/jobs";
import { prisma } from "../lib/prisma";

type PrismaJobDelegate = {
    findMany: (...args: any[]) => Promise<any>;
    findUnique: (...args: any[]) => Promise<any>;
};

const prismaJob = prisma.job as unknown as PrismaJobDelegate;

const originalFindMany = prismaJob.findMany;
const originalFindUnique = prismaJob.findUnique;

afterEach(() => {
    prismaJob.findMany = originalFindMany;
    prismaJob.findUnique = originalFindUnique;
});

const baseDate = new Date("2024-01-01T00:00:00.000Z");

const baseCompany = {
    id: "company-1",
    name: "Acme Corp",
    description: "Building next-gen products",
    locations: [
        {
            city: "New York",
            state: "NY",
        },
    ],
    url: "https://acme.example.com",
    logo: "https://cdn.example.com/logo.png",
    companySize: "100-500",
    ownershipType: "private",
    fundingType: "series_b",
    amountRaised: 1_000_000n,
    lastRoundLetter: "B",
    createdAt: baseDate,
    updatedAt: baseDate,
};

const baseJob = {
    id: "job-1",
    title: "Senior Software Engineer",
    description: "Help us ship features quickly.",
    requirements: ["TypeScript"],
    responsibilities: ["Own major features"],
    perks: null,
    benefits: null,
    companyId: baseCompany.id,
    locations: [
        {
            city: "Remote",
            state: "CA",
        },
    ],
    url: "https://acme.example.com/jobs/senior-software-engineer",
    remotePolicy: "remote",
    employmentType: "full_time",
    salaryMin: 120_000,
    salaryMax: 150_000,
    daysPerWeek: 5,
    techStack: ["TypeScript", "Next.js"],
    createdAt: baseDate,
    updatedAt: baseDate,
    company: baseCompany,
};

test("getJobs returns normalized listings with defaults", async () => {
    prismaJob.findMany = async () => [baseJob];

    const jobs = await getJobs();

    assert.equal(jobs.length, 1);
    assert.deepEqual(jobs[0].perks, []);
    assert.deepEqual(jobs[0].benefits, []);
    assert.equal(jobs[0].salaryMin, baseJob.salaryMin);
    assert.equal(jobs[0].salaryMax, baseJob.salaryMax);
    assert.deepEqual(jobs[0].company, {
        name: baseCompany.name,
        logo: baseCompany.logo,
    });
});

test("getJob returns detailed record with company metadata", async () => {
    prismaJob.findUnique = async () => baseJob;

    const job = await getJob(baseJob.id);

    assert.ok(job);
    assert.equal(job?.title, baseJob.title);
    assert.equal(job?.salaryMin, baseJob.salaryMin);
    assert.equal(job?.salaryMax, baseJob.salaryMax);
    assert.deepEqual(job?.perks, []);
    assert.deepEqual(job?.benefits, []);
    assert.deepEqual(job?.company, {
        ...baseCompany,
        locations: baseCompany.locations,
    });
});

test("getJob returns null when no record exists", async () => {
    prismaJob.findUnique = async () => null;

    const job = await getJob("missing");

    assert.equal(job, null);
});
