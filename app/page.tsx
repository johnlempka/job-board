import JobsTable from "./components/JobsTable";
import { getJobs } from "./lib/services/jobs";
import { routes } from "./lib/routes";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
});

export default async function Home() {
  const jobs = await getJobs();

  return (
    <div className={`${inter.variable} ${playfair.variable} min-h-screen bg-stone-50`}>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className={`text-5xl font-bold text-stone-900 font-playfair relative inline-block`}>
            <span className="relative z-10">Job Board</span>
            <span className="absolute -bottom-2 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full opacity-60"></span>
          </h1>
          <p className="mt-5 text-lg text-stone-700 font-sans">
            Find your next opportunity
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center">
            <p className="text-stone-700 font-sans">
              No jobs available at the moment. Check back soon!
            </p>
          </div>
        ) : (
          <JobsTable jobs={jobs} />
        )}
      </main>
    </div>
  );
}
