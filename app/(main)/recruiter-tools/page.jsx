import RecruiterTools from "./_components/recruiter-tools";
import { checkUser } from "@/lib/checkUser";

export default async function RecruiterToolsPage() {
  await checkUser();

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold text-black dark:text-white">Recruiter Tools</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        AI-powered tools to streamline your recruitment process and find top
        talent efficiently.
      </p>

      <RecruiterTools />
    </div>
  );
}
