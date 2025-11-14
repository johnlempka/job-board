import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CompanyModel } from "@/app/models/types";

export async function GET() {
    try {
        const companies = await prisma.company.findMany();

        const formattedCompanies: CompanyModel[] = companies.map((company) => ({
            id: company.id,
            name: company.name,
            description: company.description,
            locations: company.locations as CompanyModel["locations"],
            url: company.url,
            logo: company.logo,
            companySize: company.companySize,
            ownershipType: company.ownershipType,
            fundingType: company.fundingType,
            amountRaised: company.amountRaised,
            lastRoundLetter: company.lastRoundLetter,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        }));

        return NextResponse.json(formattedCompanies);
    } catch (error) {
        console.error("Error fetching companies:", error);
        return NextResponse.json(
            { error: "Failed to fetch companies" },
            { status: 500 }
        );
    }
}

