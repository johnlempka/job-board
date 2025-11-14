import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Helper function to generate employment type
function generateEmploymentType(): string {
    const types = ["full_time", "part_time", "contract", "temporary", "internship"];
    // Weight full_time more heavily
    const weights = [0.7, 0.1, 0.1, 0.05, 0.05];
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < types.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
            return types[i];
        }
    }
    return "full_time";
}

// Helper function to generate perks and benefits
function generatePerksAndBenefits(
    companySize: string,
    remotePolicy: string,
    ownershipType: string
): { perks: string[]; benefits: string[] } {
    const allPerks = [
        "Free lunch",
        "Gym membership",
        "Flexible hours",
        "Unlimited PTO",
        "Stock options",
        "Learning budget",
        "Home office stipend",
        "Wellness program",
        "Pet-friendly office",
        "Game room",
        "Snacks & beverages",
        "Team outings",
        "Conference attendance",
        "Book budget",
        "Commuter benefits",
        "Catered breakfast",
        "On-site gym",
        "Massage therapy",
        "Yoga classes",
        "Happy hours",
        "Co-working space access",
    ];

    const allBenefits = [
        "Health insurance",
        "Dental insurance",
        "Vision insurance",
        "401(k) matching",
        "Life insurance",
        "Disability insurance",
        "Parental leave",
        "FSA/HSA",
        "Mental health support",
        "Employee assistance program",
        "Tuition reimbursement",
        "Professional development",
        "Retirement plan",
        "Short-term disability",
        "Long-term disability",
        "Accident insurance",
        "Critical illness insurance",
    ];

    // Larger companies typically have more benefits
    const isLargeCompany = companySize.includes("200") || companySize.includes("500") || companySize.includes("1000");
    const isPublic = ownershipType === "public";

    // Select perks (3-6 for most companies, more for larger ones)
    // Remote/hybrid jobs are more likely to have remote-friendly perks
    const numPerks = isLargeCompany
        ? faker.number.int({ min: 5, max: 8 })
        : faker.number.int({ min: 3, max: 6 });

    // Weight remote-friendly perks higher for remote/hybrid jobs
    const perkPool = remotePolicy === "remote" || remotePolicy === "hybrid"
        ? [...allPerks, "Home office stipend", "Flexible hours", "Co-working space access"]
        : allPerks;

    const perks = faker.helpers.arrayElements(
        perkPool,
        numPerks
    );

    // Select benefits (more for larger/public companies)
    const numBenefits = isPublic || isLargeCompany
        ? faker.number.int({ min: 8, max: 12 })
        : faker.number.int({ min: 5, max: 8 });

    const benefits = faker.helpers.arrayElements(
        allBenefits,
        numBenefits
    );

    return { perks, benefits };
}

// Helper function to generate realistic job descriptions
function generateJobDescription(
    companyName: string,
    title: string,
    techStack: string[],
    remotePolicy: string
): { description: string; requirements: string[]; responsibilities: string[] } {
    const techStackStr = techStack.join(", ");
    const isRemote = remotePolicy === "remote";
    const isHybrid = remotePolicy === "hybrid";

    const descriptions = [
        `Join ${companyName} as a ${title} and help shape the future of our platform. We're looking for someone passionate about building high-quality software that scales to millions of users.`,

        `At ${companyName}, we're building cutting-edge solutions that make a real impact. As a ${title}, you'll work alongside a talented team of engineers, designers, and product managers to deliver exceptional products.`,

        `We're seeking a ${title} to join our growing team at ${companyName}. This is an exciting opportunity to work on challenging problems, learn from experienced teammates, and contribute to products that customers love.`,
    ];

    const teamDescriptions = [
        `Our engineering team is collaborative, fast-moving, and values clean code and thoughtful architecture. We practice test-driven development, conduct regular code reviews, and believe in continuous learning.`,

        `You'll be part of a cross-functional team that ships features frequently. We prioritize work-life balance, offer flexible scheduling${isRemote || isHybrid ? " and embrace remote collaboration" : ""}, and encourage experimentation.`,

        `The team operates in an agile environment with bi-weekly sprints. We emphasize pair programming, knowledge sharing sessions, and giving engineers autonomy to make technical decisions.`,
    ];

    const description = faker.helpers.arrayElement(descriptions) + "\n\n" +
        faker.helpers.arrayElement(teamDescriptions) + "\n\n" +
        `In this role, you'll primarily work with ${techStackStr}. ${isRemote ? "Since this is a fully remote position, strong communication skills and self-discipline are essential." : isHybrid ? "This hybrid role offers flexibility while maintaining team connection through regular in-office collaboration." : "Our office culture emphasizes collaboration, and we believe in-person interaction strengthens our team bonds."}`;

    const baseRequirements = [
        `5+ years of professional experience in software development`,
        `Strong proficiency in ${techStack.slice(0, 2).join(" and ")}`,
        `Experience building and maintaining production systems`,
        `Excellent problem-solving and debugging skills`,
        `Strong communication skills and ability to work in a team environment`,
    ];

    const additionalRequirements = [
        `Bachelor's degree in Computer Science or related field, or equivalent experience`,
        `Experience with cloud platforms and microservices architecture`,
        `Familiarity with CI/CD pipelines and DevOps practices`,
        `Understanding of system design and scalability principles`,
        `Experience with database design and optimization`,
        `Knowledge of best practices for code quality and testing`,
    ];

    const requirements = [
        ...baseRequirements,
        ...faker.helpers.arrayElements(additionalRequirements, { min: 2, max: 4 }),
    ];

    const baseResponsibilities = [
        `Design, develop, and maintain scalable applications and services`,
        `Collaborate with cross-functional teams to define and implement new features`,
        `Write clean, maintainable, and well-tested code`,
        `Participate in code reviews and contribute to technical discussions`,
        `Troubleshoot and debug issues in production systems`,
    ];

    const additionalResponsibilities = [
        `Mentor junior engineers and contribute to team knowledge sharing`,
        `Work with product managers to refine requirements and technical specifications`,
        `Optimize application performance and identify bottlenecks`,
        `Contribute to architectural decisions and technical roadmap planning`,
        `Stay current with industry trends and emerging technologies`,
        `Participate in on-call rotation for production support`,
    ];

    const responsibilities = [
        ...baseResponsibilities,
        ...faker.helpers.arrayElements(additionalResponsibilities, { min: 2, max: 4 }),
    ];

    return { description, requirements, responsibilities };
}

const companiesData = [
    {
        name: "TechFlow Analytics",
        description: "AI-powered analytics platform helping enterprises make data-driven decisions with real-time insights and predictive modeling.",
        locations: [{ city: "San Francisco", state: "CA" }, { city: "Austin", state: "TX" }],
        url: "https://techflow.io",
        companySize: "50-200",
        ownershipType: "private",
        fundingType: "venture",
        amountRaised: BigInt(15000000),
        lastRoundLetter: "A",
        jobs: [
            {
                title: "Senior Full Stack Engineer",
                description: "Build scalable microservices using TypeScript, React, and Node.js. Work on real-time data pipelines and customer-facing dashboards. 5+ years experience required.",
                locations: [{ city: "San Francisco", state: "CA" }],
                url: "https://techflow.io/careers/senior-engineer",
                remotePolicy: "hybrid",
                daysPerWeek: 3,
                techStack: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker"],
            },
            {
                title: "Machine Learning Engineer",
                description: "Develop ML models for predictive analytics. Experience with Python, TensorFlow, and distributed systems. PhD or equivalent experience preferred.",
                locations: [{ city: "Austin", state: "TX" }, { city: "Remote", state: "US" }],
                url: "https://techflow.io/careers/ml-engineer",
                remotePolicy: "remote",
                daysPerWeek: null,
                techStack: ["Python", "TensorFlow", "PyTorch", "Kubernetes", "Apache Spark"],
            },
        ],
    },
    {
        name: "CloudVault Security",
        description: "Enterprise cybersecurity platform providing zero-trust network access and threat detection for Fortune 500 companies.",
        locations: [{ city: "Seattle", state: "WA" }],
        url: "https://cloudvault.com",
        companySize: "200-500",
        ownershipType: "private",
        fundingType: "venture",
        amountRaised: BigInt(45000000),
        lastRoundLetter: "B",
        jobs: [
            {
                title: "Security Engineer",
                description: "Design and implement security protocols for enterprise clients. Deep knowledge of network security, encryption, and compliance frameworks.",
                locations: [{ city: "Seattle", state: "WA" }],
                url: "https://cloudvault.com/jobs/security-engineer",
                remotePolicy: "hybrid",
                daysPerWeek: 2,
                techStack: ["Go", "Python", "Linux", "Kubernetes", "Terraform", "Ansible"],
            },
            {
                title: "DevOps Engineer",
                description: "Maintain and scale our infrastructure on AWS. Experience with CI/CD, monitoring, and automation tools essential.",
                locations: [{ city: "Seattle", state: "WA" }],
                url: "https://cloudvault.com/jobs/devops",
                remotePolicy: "in_office",
                daysPerWeek: null,
                techStack: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "Prometheus"],
            },
        ],
    },
    {
        name: "GreenCode Solutions",
        description: "Sustainable software development consulting firm helping companies reduce their carbon footprint through efficient cloud architecture.",
        locations: [{ city: "Portland", state: "OR" }, { city: "Denver", state: "CO" }],
        url: "https://greencode.dev",
        companySize: "10-50",
        ownershipType: "private",
        fundingType: "bootstrapped",
        amountRaised: null,
        lastRoundLetter: null,
        jobs: [
            {
                title: "Senior Software Consultant",
                description: "Lead green software initiatives for clients. Strong background in cloud optimization and sustainability metrics. Remote-first role with travel.",
                locations: [{ city: "Remote", state: "US" }],
                url: "https://greencode.dev/careers/consultant",
                remotePolicy: "remote",
                daysPerWeek: null,
                techStack: ["Python", "AWS", "Terraform", "CloudWatch", "Prometheus", "Grafana"],
            },
            {
                title: "Frontend Developer",
                description: "Build beautiful, performant web applications. Focus on minimal bundle sizes and efficient rendering. React and Next.js experience required.",
                locations: [{ city: "Portland", state: "OR" }],
                url: "https://greencode.dev/careers/frontend",
                remotePolicy: "hybrid",
                daysPerWeek: 2,
                techStack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vite"],
            },
        ],
    },
    {
        name: "DataForge Industries",
        description: "Enterprise data platform enabling companies to unify their data sources and build custom analytics solutions.",
        locations: [{ city: "New York", state: "NY" }, { city: "Boston", state: "MA" }],
        url: "https://dataforge.io",
        companySize: "500-1000",
        ownershipType: "public",
        fundingType: "venture",
        amountRaised: BigInt(120000000),
        lastRoundLetter: "C",
        jobs: [
            {
                title: "Data Engineer",
                description: "Build ETL pipelines processing terabytes of data daily. Experience with Apache Airflow, Spark, and data warehouses required.",
                locations: [{ city: "New York", state: "NY" }],
                url: "https://dataforge.io/careers/data-engineer",
                remotePolicy: "hybrid",
                daysPerWeek: 3,
                techStack: ["Python", "Apache Spark", "Apache Airflow", "Snowflake", "dbt", "PostgreSQL"],
            },
            {
                title: "Product Manager",
                description: "Own the roadmap for our data integration products. Work closely with engineering and customers to define features. MBA preferred.",
                locations: [{ city: "Boston", state: "MA" }],
                url: "https://dataforge.io/careers/pm",
                remotePolicy: "in_office",
                daysPerWeek: null,
                techStack: [],
            },
        ],
    },
    {
        name: "MediChart Health",
        description: "Healthcare technology platform connecting patients with providers and streamlining medical record management.",
        locations: [{ city: "Chicago", state: "IL" }],
        url: "https://medichart.com",
        companySize: "200-500",
        ownershipType: "private",
        fundingType: "venture",
        amountRaised: BigInt(35000000),
        lastRoundLetter: "B",
        jobs: [
            {
                title: "Full Stack Developer",
                description: "Develop HIPAA-compliant healthcare applications. React frontend and Python backend. Experience with healthcare data standards a plus.",
                locations: [{ city: "Chicago", state: "IL" }],
                url: "https://medichart.com/careers/developer",
                remotePolicy: "remote",
                daysPerWeek: null,
                techStack: ["React", "Python", "Django", "PostgreSQL", "Redis", "Docker"],
            },
            {
                title: "QA Automation Engineer",
                description: "Build comprehensive test suites for our healthcare platform. Selenium, Playwright, and healthcare domain knowledge preferred.",
                locations: [{ city: "Chicago", state: "IL" }],
                url: "https://medichart.com/careers/qa",
                remotePolicy: "hybrid",
                daysPerWeek: 2,
                techStack: ["Python", "Selenium", "Playwright", "Postman", "Jest", "Cypress"],
            },
        ],
    },
    {
        name: "EduTech Innovations",
        description: "Revolutionizing online learning with interactive courses, AI tutoring, and personalized learning paths for students worldwide.",
        locations: [{ city: "San Diego", state: "CA" }],
        url: "https://edutech.io",
        companySize: "50-200",
        ownershipType: "private",
        fundingType: "bootstrapped",
        amountRaised: null,
        lastRoundLetter: null,
        jobs: [
            {
                title: "React Native Developer",
                description: "Build mobile apps for iOS and Android. Create engaging learning experiences with smooth animations and offline support.",
                locations: [{ city: "San Diego", state: "CA" }],
                url: "https://edutech.io/careers/mobile-dev",
                remotePolicy: "hybrid",
                daysPerWeek: 3,
                techStack: ["React Native", "TypeScript", "Expo", "Firebase", "Redux"],
            },
            {
                title: "AI/ML Researcher",
                description: "Develop personalized learning algorithms. Research adaptive learning systems and natural language processing for educational content.",
                locations: [{ city: "Remote", state: "US" }],
                url: "https://edutech.io/careers/ml-researcher",
                remotePolicy: "remote",
                daysPerWeek: null,
                techStack: ["Python", "PyTorch", "NLP", "Transformers", "LangChain"],
            },
        ],
    },
    {
        name: "FinServe Technologies",
        description: "Digital banking platform providing APIs for fintech companies to build financial products quickly and securely.",
        locations: [{ city: "Charlotte", state: "NC" }, { city: "Miami", state: "FL" }],
        url: "https://finserve.tech",
        companySize: "100-500",
        ownershipType: "private",
        fundingType: "venture",
        amountRaised: BigInt(75000000),
        lastRoundLetter: "B",
        jobs: [
            {
                title: "Backend Engineer (Go)",
                description: "Build high-performance financial APIs. Strong Go experience and understanding of financial regulations required. PCI-DSS compliance knowledge a plus.",
                locations: [{ city: "Charlotte", state: "NC" }],
                url: "https://finserve.tech/jobs/backend-go",
                remotePolicy: "in_office",
                daysPerWeek: null,
                techStack: ["Go", "PostgreSQL", "Redis", "gRPC", "Kafka", "AWS"],
            },
            {
                title: "Security Compliance Specialist",
                description: "Ensure our platform meets all financial regulations and security standards. SOC 2, PCI-DSS, and banking compliance experience required.",
                locations: [{ city: "Miami", state: "FL" }],
                url: "https://finserve.tech/jobs/compliance",
                remotePolicy: "hybrid",
                daysPerWeek: 2,
                techStack: [],
            },
        ],
    },
    {
        name: "AgriTech Systems",
        description: "IoT and AI-powered farming solutions helping farmers optimize crop yields, manage resources, and reduce waste.",
        locations: [{ city: "Des Moines", state: "IA" }],
        url: "https://agritech-systems.com",
        companySize: "10-50",
        ownershipType: "private",
        fundingType: "venture",
        amountRaised: BigInt(8000000),
        lastRoundLetter: "Seed",
        jobs: [
            {
                title: "IoT Firmware Engineer",
                description: "Develop embedded systems for agricultural sensors. C/C++ and embedded Linux experience required. Hardware background preferred.",
                locations: [{ city: "Des Moines", state: "IA" }],
                url: "https://agritech-systems.com/careers/firmware",
                remotePolicy: "in_office",
                daysPerWeek: null,
                techStack: ["C", "C++", "Embedded Linux", "Rust", "MQTT", "Zigbee"],
            },
            {
                title: "Data Scientist",
                description: "Analyze sensor data to create predictive models for crop health and weather patterns. Python and time series analysis experience essential.",
                locations: [{ city: "Des Moines", state: "IA" }, { city: "Remote", state: "US" }],
                url: "https://agritech-systems.com/careers/data-scientist",
                remotePolicy: "hybrid",
                daysPerWeek: 3,
                techStack: ["Python", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "Jupyter"],
            },
        ],
    },
    {
        name: "StreamSync Media",
        description: "Video streaming infrastructure and CDN services powering live events and on-demand content for media companies.",
        locations: [{ city: "Los Angeles", state: "CA" }, { city: "New York", state: "NY" }],
        url: "https://streamsync.com",
        companySize: "200-500",
        ownershipType: "private",
        fundingType: "venture",
        amountRaised: BigInt(60000000),
        lastRoundLetter: "B",
        jobs: [
            {
                title: "Video Streaming Engineer",
                description: "Optimize video encoding and streaming protocols. Deep knowledge of HLS, DASH, and codec technologies. C++ and FFmpeg experience required.",
                locations: [{ city: "Los Angeles", state: "CA" }],
                url: "https://streamsync.com/careers/streaming-engineer",
                remotePolicy: "in_office",
                daysPerWeek: null,
                techStack: ["C++", "FFmpeg", "HLS", "DASH", "WebRTC", "AWS MediaLive"],
            },
            {
                title: "Backend Engineer (Scalability)",
                description: "Build distributed systems handling millions of concurrent video streams. Experience with high-throughput systems and CDN architecture.",
                locations: [{ city: "New York", state: "NY" }],
                url: "https://streamsync.com/careers/backend-scalability",
                remotePolicy: "remote",
                daysPerWeek: null,
                techStack: ["Go", "Kubernetes", "Redis", "Kafka", "Cassandra", "Grafana"],
            },
        ],
    },
    {
        name: "CodeCraft Studios",
        description: "Boutique software agency specializing in custom web applications and mobile apps for startups and mid-size companies.",
        locations: [{ city: "Boulder", state: "CO" }],
        url: "https://codecraft.studio",
        companySize: "10-50",
        ownershipType: "private",
        fundingType: "bootstrapped",
        amountRaised: null,
        lastRoundLetter: null,
        jobs: [
            {
                title: "Senior Full Stack Developer",
                description: "Lead development on client projects. Strong communication skills and ability to work with non-technical stakeholders. Full stack experience across multiple frameworks.",
                locations: [{ city: "Boulder", state: "CO" }],
                url: "https://codecraft.studio/careers/senior-dev",
                remotePolicy: "hybrid",
                daysPerWeek: 2,
                techStack: ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL", "Prisma"],
            },
            {
                title: "UI/UX Designer Developer",
                description: "Design and implement beautiful, user-friendly interfaces. Strong design skills and ability to code in React. Figma and design systems experience required.",
                locations: [{ city: "Boulder", state: "CO" }],
                url: "https://codecraft.studio/careers/designer-dev",
                remotePolicy: "remote",
                daysPerWeek: null,
                techStack: ["React", "Figma", "Tailwind CSS", "Framer Motion", "Storybook"],
            },
        ],
    },
];

async function main() {
    console.log("Starting seed...");

    for (const companyData of companiesData) {
        const { jobs, ...companyFields } = companyData;

        const company = await prisma.company.create({
            data: {
                ...companyFields,
                locations: companyFields.locations as any,
                logo: faker.image.url({
                    width: 200,
                    height: 200,
                }),
            },
        });

        console.log(`Created company: ${company.name}`);

        // Generate a random date within the last month for the company
        // Sometimes both jobs are posted on the same day, sometimes not
        const shouldPostOnSameDay = faker.datatype.boolean({ probability: 0.5 });
        const basePostedDate = faker.date.recent({ days: 30 });

        for (let i = 0; i < jobs.length; i++) {
            const jobData = jobs[i];

            // If posting on same day, use the base date for all jobs
            // Otherwise, generate a new date for each job
            const postedDate = shouldPostOnSameDay
                ? basePostedDate
                : faker.date.recent({ days: 30 });

            // Generate realistic description, requirements, and responsibilities
            const { description, requirements, responsibilities } = generateJobDescription(
                company.name,
                jobData.title,
                jobData.techStack,
                jobData.remotePolicy
            );

            // Generate perks and benefits
            const { perks, benefits } = generatePerksAndBenefits(
                company.companySize,
                jobData.remotePolicy,
                company.ownershipType
            );

            await prisma.job.create({
                data: {
                    ...jobData,
                    description,
                    requirements,
                    responsibilities,
                    perks,
                    benefits,
                    employmentType: generateEmploymentType(),
                    companyId: company.id,
                    locations: jobData.locations as any,
                    createdAt: postedDate,
                    updatedAt: postedDate,
                },
            });
        }

        console.log(`  Created ${jobs.length} jobs for ${company.name}`);
    }

    console.log("Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

