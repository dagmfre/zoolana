import CourseRecommendations from "./_components/course-recommendations";
import { checkUser } from "@/lib/checkUser";

export default async function CourseRecommendationsPage() {
  await checkUser();

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title text-black dark:text-white">
          Course Recommendations
        </h1>
      </div>
      <p className="text-muted-foreground mb-6">
        AI-powered course suggestions tailored to your skills and career goals.
      </p>

      <CourseRecommendations />
    </div>
  );
}
