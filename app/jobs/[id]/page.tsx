import Link from "next/link";
import { notFound } from "next/navigation";
import JobChat from "@/app/components/JobChat";
import CompanyLogo from "@/app/components/CompanyLogo";
import { getJob } from "@/app/lib/services/jobs";
import { routes } from "@/app/lib/routes";

function formatLocation(location: { city: string; state: string }): string {
    return `${location.city}, ${location.state}`;
}

function formatRemotePolicy(policy: string, daysPerWeek: number | null): string {
    switch (policy) {
        case "remote":
            return "Remote";
        case "hybrid":
            return `Hybrid (${daysPerWeek} days per week)`;
        case "in_office":
            return "In Office";
        default:
            return policy;
    }
}

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default async function JobPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const job = await getJob(id);

    if (!job) {
        notFound();
    }

    return (
        <div className="flex min-h-screen bg-beige">
            {/* Left side - Job Details */}
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                    <Link
                        href={routes.home}
                        className="mb-6 inline-flex items-center text-sm font-sans text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
                    >
                        <svg
                            className="mr-2 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Jobs
                    </Link>

                    <div>
                        <div className="mb-10">
                            <div className="mb-6 flex items-center gap-4">
                                <CompanyLogo logo={job.company.logo} name={job.company.name} size="large" />
                                <div>
                                    <h1 className={`text-4xl font-bold text-stone-900 font-playfair`}>
                                        {job.title}
                                    </h1>
                                    <p className="mt-2 text-xl text-stone-700 font-sans">
                                        {job.company.name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-6 text-sm text-stone-700 font-sans">
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <span>
                                        {job.locations.length > 0
                                            ? job.locations.map(formatLocation).join(", ")
                                            : "Location TBD"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>{formatRemotePolicy(job.remotePolicy, job.daysPerWeek)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>Posted {formatDate(job.createdAt)}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {job.techStack.map((tech, idx) => (
                                        <span
                                            key={idx}
                                            className="border border-stone-300 px-3 py-1 text-xs font-medium text-stone-800"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="my-12 flex items-center gap-4">
                            <div className="h-px flex-1 bg-stone-300"></div>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(5,150,105,0.5)]"></div>
                            <div className="h-px flex-1 bg-stone-300"></div>
                        </div>

                        <div className="font-sans">

                            <section className="mb-12">
                                <h2 className={`mb-6 text-2xl font-bold text-stone-900 font-playfair`}>
                                    Job Description
                                </h2>
                                <p className="whitespace-pre-line text-stone-800 leading-relaxed">
                                    {job.description}
                                </p>
                            </section>

                            <div className="my-12 flex items-center gap-4">
                                <div className="h-px flex-1 bg-stone-300"></div>
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(5,150,105,0.5)]"></div>
                                <div className="h-px flex-1 bg-stone-300"></div>
                            </div>

                            <section className="mb-12">
                                <h2 className={`mb-6 text-2xl font-bold text-stone-900 font-playfair`}>
                                    Responsibilities
                                </h2>
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {job.responsibilities.map((responsibility, idx) => (
                                            <tr key={idx} className="border-b border-stone-200">
                                                <td className="w-12 py-4 text-center font-mono text-lg font-semibold text-emerald-600">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </td>
                                                <td className="py-4 text-stone-800 leading-relaxed">
                                                    {responsibility}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>

                            <div className="my-12 flex items-center gap-4">
                                <div className="h-px flex-1 bg-stone-300"></div>
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(5,150,105,0.5)]"></div>
                                <div className="h-px flex-1 bg-stone-300"></div>
                            </div>

                            <section className="mb-12">
                                <h2 className={`mb-6 text-2xl font-bold text-stone-900 font-playfair`}>
                                    Requirements
                                </h2>
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {job.requirements.map((requirement, idx) => (
                                            <tr key={idx} className="border-b border-stone-200">
                                                <td className="w-12 py-4 text-center font-mono text-lg font-semibold text-emerald-600">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </td>
                                                <td className="py-4 text-stone-800 leading-relaxed">
                                                    {requirement}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>

                            {(job.perks && job.perks.length > 0) || (job.benefits && job.benefits.length > 0) ? (
                                <>
                                    <div className="my-12 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-stone-300"></div>
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(5,150,105,0.5)]"></div>
                                        <div className="h-px flex-1 bg-stone-300"></div>
                                    </div>

                                    {(job.perks && job.perks.length > 0) && (
                                        <section className="mb-12">
                                            <h2 className={`mb-6 text-2xl font-bold text-stone-900 font-playfair`}>
                                                Perks
                                            </h2>
                                            <div className="flex flex-wrap gap-3">
                                                {job.perks.map((perk, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 rounded-lg"
                                                    >
                                                        {perk}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {(job.benefits && job.benefits.length > 0) && (
                                        <section className="mb-12">
                                            <h2 className={`mb-6 text-2xl font-bold text-stone-900 font-playfair`}>
                                                Benefits
                                            </h2>
                                            <div className="flex flex-wrap gap-3">
                                                {job.benefits.map((benefit, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 rounded-lg"
                                                    >
                                                        {benefit}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </>
                            ) : null}

                            <div className="my-12 flex items-center gap-4">
                                <div className="h-px flex-1 bg-stone-300"></div>
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(5,150,105,0.5)]"></div>
                                <div className="h-px flex-1 bg-stone-300"></div>
                            </div>

                            <section className="mb-12">
                                <h2 className={`mb-6 text-2xl font-bold text-stone-900 font-playfair`}>
                                    Company Information
                                </h2>
                                <table className="w-full border-collapse">
                                    <tbody>
                                        <tr className="border-b border-stone-200">
                                            <td className="w-32 py-3 font-medium text-stone-700">Description</td>
                                            <td className="py-3 text-stone-800">{job.company.description}</td>
                                        </tr>
                                        <tr className="border-b border-stone-200">
                                            <td className="py-3 font-medium text-stone-700">Size</td>
                                            <td className="py-3 text-stone-800">{job.company.companySize}</td>
                                        </tr>
                                        <tr className="border-b border-stone-200">
                                            <td className="py-3 font-medium text-stone-700">Ownership</td>
                                            <td className="py-3 text-stone-800 capitalize">{job.company.ownershipType}</td>
                                        </tr>
                                        <tr className="border-b border-stone-200">
                                            <td className="py-3 font-medium text-stone-700">Funding</td>
                                            <td className="py-3 text-stone-800 capitalize">
                                                {job.company.fundingType}
                                                {job.company.lastRoundLetter && (
                                                    <> ({job.company.lastRoundLetter} Round)</>
                                                )}
                                                {job.company.amountRaised && (
                                                    <> - ${(Number(job.company.amountRaised) / 1000000).toFixed(1)}M</>
                                                )}
                                            </td>
                                        </tr>
                                        {job.company.locations.length > 0 && (
                                            <tr className="border-b border-stone-200">
                                                <td className="py-3 font-medium text-stone-700">Locations</td>
                                                <td className="py-3 text-stone-800">
                                                    {job.company.locations.map(formatLocation).join(", ")}
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td className="py-3 font-medium text-stone-700">Website</td>
                                            <td className="py-3">
                                                <a
                                                    href={job.company.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-emerald-600 hover:text-emerald-700 underline font-medium transition-colors duration-200"
                                                >
                                                    {job.company.url}
                                                </a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </section>

                            <div className="my-12 flex items-center gap-4">
                                <div className="h-px flex-1 bg-stone-300"></div>
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(5,150,105,0.5)]"></div>
                                <div className="h-px flex-1 bg-stone-300"></div>
                            </div>

                            <div>
                                <Link
                                    href={job.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block border border-emerald-600 px-8 py-3 text-center font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-900/30 hover:shadow-xl hover:shadow-emerald-900/40 transition-all duration-200 rounded"
                                >
                                    Apply Now
                                </Link>
                            </div>
                        </div>

                        <div className="my-12 flex items-center gap-4">
                            <div className="h-px flex-1 bg-stone-300"></div>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(5,150,105,0.5)]"></div>
                            <div className="h-px flex-1 bg-stone-300"></div>
                        </div>

                        {/* Mobile Chat - shown below job details on small screens */}
                        <div className="lg:hidden">
                            <div className="h-[500px]">
                                <JobChat jobId={job.id} jobTitle={job.title} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Right side - Chat (Desktop) */}
            <aside className="hidden lg:block lg:w-96 lg:flex-shrink-0 lg:border-l lg:border-slate-300 bg-slate-800">
                <div className="sticky top-0 h-screen">
                    <JobChat jobId={job.id} jobTitle={job.title} />
                </div>
            </aside>
        </div>
    );
}

