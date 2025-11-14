import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CompanyModel } from "@/app/models/types";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const company = await prisma.company.findUnique({
            where: { id },
        });

        if (!company) {
            return NextResponse.json(
                { error: "Company not found" },
                { status: 404 }
            );
        }

        const formattedCompany: CompanyModel = {
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
        };

        return NextResponse.json(formattedCompany);
    } catch (error) {
        console.error("Error fetching company:", error);
        return NextResponse.json(
            { error: "Failed to fetch company" },
            { status: 500 }
        );
    }
}

