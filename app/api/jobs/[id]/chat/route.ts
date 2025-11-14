import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function getGeminiResponse(
    userMessage: string,
    jobInfo: any,
    companyInfo: any,
    chatHistory: Array<{ role: string; content: string }>
): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Build system prompt
    const systemPrompt = `You are a helpful assistant that answers questions about job postings. Your task is to help job seekers understand:

1. The job requirements, responsibilities, and expectations
2. Employment type (full-time, part-time, contract, temporary, internship)
3. Details about the company, culture, benefits, and perks
4. Technical requirements and skills needed
5. Location and remote work policies
6. Any other relevant information about the position or company

You should be friendly, professional, and provide accurate information based solely on the job and company information provided to you. If you don't have information to answer a question, say so clearly.

Job Information:
${JSON.stringify(jobInfo, null, 2)}

Company Information:
${JSON.stringify(companyInfo, null, 2)}

Previous Conversation:
${chatHistory.length > 0
            ? chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')
            : 'No previous conversation yet.'
        }

Now answer the user's question based on this context.`;

    try {
        const result = await model.generateContent(systemPrompt + `\n\nUser: ${userMessage}\n\nAssistant:`);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

async function getOrCreateChat(jobId: string, sessionId: string) {
    return await prisma.chat.upsert({
        where: {
            jobId_sessionId: {
                jobId,
                sessionId,
            },
        },
        create: {
            jobId,
            sessionId,
        },
        update: {},
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
            },
        },
    });
}

async function getSessionId(): Promise<string> {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("chat_session_id")?.value;

    if (!sessionId) {
        sessionId = crypto.randomUUID();
        cookieStore.set("chat_session_id", sessionId, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 365, // 1 year
        });
    }

    return sessionId;
}

// GET - Retrieve conversation history
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;
        const sessionId = await getSessionId();

        const chat = await prisma.chat.findUnique({
            where: {
                jobId_sessionId: {
                    jobId,
                    sessionId,
                },
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });

        if (!chat) {
            return NextResponse.json({ messages: [] });
        }

        return NextResponse.json({
            messages: chat.messages.map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt,
            })),
        });
    } catch (error) {
        console.error("Error fetching chat:", error);
        return NextResponse.json(
            { error: "Failed to fetch chat" },
            { status: 500 }
        );
    }
}

// POST - Send a new message
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;
        const { message } = await request.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        const sessionId = await getSessionId();

        // Get job details for context
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: { company: true },
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // Get or create chat
        const chat = await getOrCreateChat(jobId, sessionId);

        // Save user message
        const userMessage = await prisma.message.create({
            data: {
                chatId: chat.id,
                role: "user",
                content: message,
            },
        });

        // Prepare job information (exclude relations)
        const jobInfo = {
            id: job.id,
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            responsibilities: job.responsibilities,
            perks: job.perks || [],
            benefits: job.benefits || [],
            locations: job.locations,
            url: job.url,
            remotePolicy: job.remotePolicy,
            employmentType: job.employmentType,
            daysPerWeek: job.daysPerWeek,
            techStack: job.techStack,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };

        // Prepare company information
        const companyInfo = {
            id: job.company.id,
            name: job.company.name,
            description: job.company.description,
            locations: job.company.locations,
            url: job.company.url,
            companySize: job.company.companySize,
            ownershipType: job.company.ownershipType,
            fundingType: job.company.fundingType,
            amountRaised: job.company.amountRaised?.toString(),
            lastRoundLetter: job.company.lastRoundLetter,
        };

        // Get chat history (excluding the message we just added)
        const historyMessages = chat.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));

        // Generate assistant response using Gemini
        const assistantContent = await getGeminiResponse(
            message,
            jobInfo,
            companyInfo,
            historyMessages
        );

        // Save assistant message
        const assistantMessage = await prisma.message.create({
            data: {
                chatId: chat.id,
                role: "assistant",
                content: assistantContent,
            },
        });

        return NextResponse.json({
            message: {
                id: assistantMessage.id,
                role: assistantMessage.role,
                content: assistantMessage.content,
                createdAt: assistantMessage.createdAt,
            },
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}

