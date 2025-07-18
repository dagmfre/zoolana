import ATSChecker from "./_components/ats-checker";
import { checkUser } from "@/lib/checkUser";

export default async function ATSCheckerPage() {
  await checkUser();

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title text-black dark:text-white">ATS Score Checker</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Upload your resume and get instant feedback on ATS compatibility with
        improvement suggestions.
      </p>

      <ATSChecker />
    </div>
  );
}
