"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JobModel } from "../models/types";
import { routes } from "../lib/routes";
import CompanyLogo from "./CompanyLogo";

type SortField = "title" | "company" | "remotePolicy" | "location" | "createdAt";
type SortDirection = "asc" | "desc";

function formatLocation(locations: { city: string; state: string }[]): string {
    if (locations.length === 0) return "TBD";
    if (locations.length === 1) {
        return `${locations[0].city}, ${locations[0].state}`;
    }
    return `${locations[0].city}, ${locations[0].state} +${locations.length - 1}`;
}

function formatRemotePolicy(policy: string, daysPerWeek: number | null): string {
    switch (policy) {
        case "remote":
            return "Remote";
        case "hybrid":
            return `Hybrid (${daysPerWeek}d/w)`;
        case "in_office":
            return "On-Site";
        default:
            return policy;
    }
}

type JobWithCompany = {
    id: string;
    title: string;
    company: { name: string; logo: string | null };
    locations: JobModel["locations"];
    remotePolicy: JobModel["remotePolicy"];
    daysPerWeek: number | null;
    techStack: string[];
    createdAt: Date;
};

interface JobsTableProps {
    jobs: JobWithCompany[];
}

type FilterType = "location" | "tech" | "remotePolicy";

type Filter = {
    id: string;
    type: FilterType;
    value: string;
    label: string;
};

export default function JobsTable({ jobs }: JobsTableProps) {
    const router = useRouter();
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [filters, setFilters] = useState<Filter[]>([]);
    const [searchInput, setSearchInput] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Extract unique locations and tech stack items
    const allLocations = Array.from(
        new Set(
            jobs.flatMap((job) =>
                job.locations.map((loc) => `${loc.city}, ${loc.state}`)
            )
        )
    ).sort();

    const allTechStack = Array.from(
        new Set(jobs.flatMap((job) => job.techStack))
    ).sort();

    const remotePolicyOptions = ["Remote", "Hybrid", "On-Site"];

    // Combine all suggestions with type labels
    type Suggestion = {
        type: FilterType;
        value: string;
        label: string;
        displayLabel: string;
    };

    const allSuggestions: Suggestion[] = [
        // Add "Remote" as a location option
        {
            type: "location" as FilterType,
            value: "Remote",
            label: "Remote",
            displayLabel: "Location: Remote",
        },
        ...allLocations.map((loc) => ({
            type: "location" as FilterType,
            value: loc,
            label: loc,
            displayLabel: `Location: ${loc}`,
        })),
        ...allTechStack.map((tech) => ({
            type: "tech" as FilterType,
            value: tech,
            label: tech,
            displayLabel: `Tech: ${tech}`,
        })),
        ...remotePolicyOptions.map((policy) => ({
            type: "remotePolicy" as FilterType,
            value: policy,
            label: policy,
            displayLabel: `Type: ${policy}`,
        })),
    ];

    // Filter suggestions based on input
    const filteredSuggestions = allSuggestions
        .filter((suggestion) =>
            suggestion.label.toLowerCase().includes(searchInput.toLowerCase())
        )
        .filter(
            (suggestion) =>
                !filters.some(
                    (f) => f.type === suggestion.type && f.value === suggestion.value
                )
        )
        .slice(0, 10);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const addFilter = (type: FilterType, value: string, label: string) => {
        if (filters.some((f) => f.type === type && f.value === value)) return;

        setFilters([...filters, { id: `${type}-${value}-${Date.now()}`, type, value, label }]);
        setSearchInput("");
        setShowSuggestions(false);
    };

    const removeFilter = (id: string) => {
        setFilters(filters.filter((f) => f.id !== id));
    };

    const removeLastFilter = () => {
        if (filters.length > 0) {
            setFilters(filters.slice(0, -1));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (searchInput === "" && filters.length > 0) {
                e.preventDefault();
                removeLastFilter();
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredSuggestions.length > 0) {
                const firstSuggestion = filteredSuggestions[0];
                addFilter(firstSuggestion.type, firstSuggestion.value, firstSuggestion.label);
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    // Apply filters
    // Group filters by type, OR within each group, AND across groups
    const filteredJobs = jobs.filter((job) => {
        if (filters.length === 0) return true;

        // Group filters by type
        const locationFilters = filters.filter((f) => f.type === "location");
        const techFilters = filters.filter((f) => f.type === "tech");
        const remotePolicyFilters = filters.filter((f) => f.type === "remotePolicy");

        // Check location filters (OR logic)
        if (locationFilters.length > 0) {
            const matchesLocation = locationFilters.some((filter) => {
                if (filter.value === "Remote") {
                    return job.remotePolicy === "remote";
                }
                return job.locations.some(
                    (loc) => `${loc.city}, ${loc.state}` === filter.value
                );
            });
            if (!matchesLocation) return false;
        }

        // Check tech filters (OR logic)
        if (techFilters.length > 0) {
            const matchesTech = techFilters.some((filter) =>
                job.techStack.includes(filter.value)
            );
            if (!matchesTech) return false;
        }

        // Check remote policy filters (OR logic)
        if (remotePolicyFilters.length > 0) {
            const matchesRemotePolicy = remotePolicyFilters.some((filter) => {
                if (filter.value === "Remote") return job.remotePolicy === "remote";
                if (filter.value === "Hybrid") return job.remotePolicy === "hybrid";
                if (filter.value === "On-Site") return job.remotePolicy === "in_office";
                return false;
            });
            if (!matchesRemotePolicy) return false;
        }

        return true;
    });

    const sortedJobs = [...filteredJobs].sort((a, b) => {
        let aValue: string | Date;
        let bValue: string | Date;

        switch (sortField) {
            case "title":
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
            case "company":
                aValue = a.company.name.toLowerCase();
                bValue = b.company.name.toLowerCase();
                break;
            case "remotePolicy":
                aValue = a.remotePolicy;
                bValue = b.remotePolicy;
                break;
            case "location":
                aValue = formatLocation(a.locations);
                bValue = formatLocation(b.locations);
                break;
            case "createdAt":
                aValue = a.createdAt;
                bValue = b.createdAt;
                break;
            default:
                return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return (
                <svg
                    className="h-4 w-4 text-stone-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                </svg>
            );
        }
        return sortDirection === "asc" ? (
            <svg
                className="h-4 w-4 drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#059669' }}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                />
            </svg>
        ) : (
            <svg
                className="h-4 w-4 drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#059669' }}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        );
    };

    return (
        <div className="font-sans">
            {/* Filters */}
            <div className="mb-6 space-y-3">
                {/* Active Filter Tags */}
                {filters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {filters.map((filter) => (
                            <span
                                key={filter.id}
                                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 border border-emerald-200"
                            >
                                <span className="text-xs text-emerald-600 uppercase">
                                    {filter.type === "location" ? "Location" : filter.type === "tech" ? "Tech" : "Type"}:
                                </span>
                                {filter.label}
                                <button
                                    onClick={() => removeFilter(filter.id)}
                                    className="ml-0.5 rounded-full hover:bg-emerald-200 p-0.5 transition-colors"
                                    aria-label={`Remove ${filter.label} filter`}
                                >
                                    <svg
                                        className="h-3.5 w-3.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Combined Filter Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Filter by location, tech stack, or work type..."
                        className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-stone-200 bg-white shadow-lg">
                            {filteredSuggestions.map((suggestion, idx) => (
                                <button
                                    key={`${suggestion.type}-${suggestion.value}-${idx}`}
                                    onClick={() => addFilter(suggestion.type, suggestion.value, suggestion.label)}
                                    className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-emerald-50 transition-colors"
                                >
                                    <span className="font-medium text-emerald-600">
                                        {suggestion.type === "location" ? "Location" : suggestion.type === "tech" ? "Tech" : "Type"}:
                                    </span>{" "}
                                    {suggestion.label}
                                </button>
                            ))}
                        </div>
                    )}
                    {searchInput && filteredSuggestions.length === 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500 shadow-lg">
                            No matching filters
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="text-sm text-stone-600">
                    Showing {filteredJobs.length} of {jobs.length} jobs
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th
                                className="cursor-pointer pl-0 pr-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-600 hover:opacity-70 transition-opacity"
                                onClick={() => handleSort("title")}
                            >
                                <div className="flex items-center gap-2">
                                    Title
                                    <SortIcon field="title" />
                                </div>
                            </th>
                            <th
                                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-600 hover:opacity-70 transition-opacity"
                                onClick={() => handleSort("company")}
                            >
                                <div className="flex items-center gap-2">
                                    Company
                                    <SortIcon field="company" />
                                </div>
                            </th>
                            <th
                                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-600 hover:opacity-70 transition-opacity"
                                onClick={() => handleSort("location")}
                            >
                                <div className="flex items-center gap-2">
                                    Location
                                    <SortIcon field="location" />
                                </div>
                            </th>
                            <th
                                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-600 hover:opacity-70 transition-opacity"
                                onClick={() => handleSort("remotePolicy")}
                            >
                                <div className="flex items-center gap-2">
                                    Type
                                    <SortIcon field="remotePolicy" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-600">
                                Tech Stack
                            </th>
                            <th
                                className="cursor-pointer pl-6 pr-0 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-600 hover:opacity-70 transition-opacity"
                                onClick={() => handleSort("createdAt")}
                            >
                                <div className="flex items-center gap-2">
                                    Posted
                                    <SortIcon field="createdAt" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedJobs.map((job, idx) => (
                            <tr
                                key={job.id}
                                onClick={(e) => {
                                    // Don't navigate if clicking on sortable header or links
                                    if ((e.target as HTMLElement).closest('th')) return;
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.scrollTo(0, 0);
                                    router.push(routes.jobs.detail(job.id));
                                }}
                                className="border-t border-stone-200 hover:opacity-80 transition-opacity cursor-pointer"
                            >
                                <td className="pl-0 pr-6 py-4">
                                    <span
                                        className={`font-medium text-stone-900 block ${idx === 0 ? 'text-emerald-600 font-semibold' : ''}`}
                                    >
                                        {job.title}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-stone-800">
                                    <div className="flex items-center gap-3">
                                        <CompanyLogo logo={job.company.logo} name={job.company.name} size="small" />
                                        <span>{job.company.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-stone-700">
                                    {formatLocation(job.locations)}
                                </td>
                                <td className="px-6 py-4 text-sm text-stone-700">
                                    {formatRemotePolicy(job.remotePolicy, job.daysPerWeek)}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex flex-wrap gap-2">
                                        {job.techStack.slice(0, 3).map((tech, techIdx) => (
                                            <span
                                                key={techIdx}
                                                className="border border-stone-300 px-2 py-0.5 text-xs font-medium text-stone-800"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                        {job.techStack.length > 3 && (
                                            <span className="border border-stone-300 px-2 py-0.5 text-xs font-medium text-stone-800">
                                                +{job.techStack.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="pl-6 pr-0 py-4 text-sm text-stone-700">
                                    {new Date(job.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

