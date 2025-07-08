import JobMatches from "./_components/job-matches";
import { checkUser } from "@/lib/checkUser";

export default async function LatestJobsPage() {
  await checkUser();

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title text-black dark:text-white">Job Matches</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        AI-powered job recommendations based on your skills and preferences.
      </p>

      <JobMatches />
    </div>
  );
}
