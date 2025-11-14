/**
 * Route configuration and path helpers
 * 
 * Centralizes all route definitions for maintainability.
 * Use this instead of hardcoding paths throughout the application.
 * 
 * @example
 * // In a component
 * import { routes } from "@/app/lib/routes";
 * <Link href={routes.home}>Home</Link>
 * <Link href={routes.jobs.detail(jobId)}>Job Details</Link>
 * 
 * // In API calls
 * fetch(routes.api.jobs.list)
 */
export const routes = {
    home: "/",
    jobs: {
        list: "/",
        detail: (id: string) => `/jobs/${id}`,
    },
    api: {
        jobs: {
            list: "/api/jobs",
            detail: (id: string) => `/api/jobs/${id}`,
            chat: (id: string) => `/api/jobs/${id}/chat`,
        },
        companies: {
            list: "/api/companies",
            detail: (id: string) => `/api/companies/${id}`,
        },
    },
} as const;

