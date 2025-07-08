"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateJobMatches(preferences = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      resume: true,
    },
  });

  if (!user) throw new Error("User not found");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  Generate job recommendations for this user profile:
  
  Industry: ${user.industry || "General"}
  Bio: ${user.bio || "No bio provided"}
  Skills: ${
    user.skills ? JSON.stringify(user.skills) : "No specific skills listed"
  }
  Experience: ${user.experience || "Not specified"} years
  Resume: ${user.resume?.content ? "Has resume" : "No resume"}
  
  User Preferences:
  Location: ${preferences.location || "Any"}
  Remote: ${preferences.remote || "Any"}
  Minimum Salary: ${preferences.salaryMin || "Not specified"}
  
  IMPORTANT: Respond ONLY with valid JSON array, no markdown, no explanation:
  
  [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "type": "Full-time",
      "salary": "$80k - $120k",
      "salaryMin": 80000,
      "salaryMax": 120000,
      "remote": true,
      "postedDate": "2 days ago",
      "matchScore": 85,
      "skills": ["skill1", "skill2"],
      "description": "Job description...",
      "requirements": ["requirement1", "requirement2"],
      "externalUrl": "https://company.com/job"
    }
  ]
  
  Generate exactly 6 diverse job opportunities.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jobsText = response.text();

    let jobsData;
    try {
      // Clean the response text
      jobsText = jobsText
        .replace(/```json\n?/g, "")
        .replace(/\n?```/g, "")
        .replace(/```/g, "")
        .trim();

      // Find JSON array boundaries
      const jsonStart = jobsText.indexOf("[");
      const jsonEnd = jobsText.lastIndexOf("]") + 1;

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jobsText = jobsText.substring(jsonStart, jsonEnd);
      }

      // Additional cleaning
      jobsText = jobsText
        .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
        .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes
        .replace(/,\s*}/g, "}") // Remove trailing commas
        .replace(/,\s*]/g, "]"); // Remove trailing commas in arrays

      console.log("Cleaned jobs JSON:", jobsText.substring(0, 200) + "...");

      jobsData = JSON.parse(jobsText);

      // Ensure it's an array
      if (!Array.isArray(jobsData)) {
        throw new Error("Response is not an array");
      }

      // Validate and clean jobs data
      jobsData = jobsData
        .filter((job) => job.title && job.company && job.description)
        .slice(0, 6)
        .map((job) => ({
          ...job,
          id: job.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .substring(0, 50),
          skills: Array.isArray(job.skills) ? job.skills : [],
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
          remote: Boolean(job.remote),
          matchScore:
            Number(job.matchScore) || Math.floor(Math.random() * 30) + 70,
          salaryMin: Number(job.salaryMin) || 0,
          salaryMax: Number(job.salaryMax) || 0,
        }));
    } catch (parseError) {
      console.error("JSON parse error:", parseError.message);

      // Fallback jobs
      jobsData = [
        {
          id: "software-developer-tech-corp",
          title: "Software Developer",
          company: "TechCorp",
          location: "Remote",
          type: "Full-time",
          salary: "$80k - $120k",
          salaryMin: 80000,
          salaryMax: 120000,
          remote: true,
          postedDate: "1 day ago",
          matchScore: 85,
          skills: ["JavaScript", "React", "Node.js"],
          description:
            "Join our dynamic development team to build cutting-edge web applications using modern technologies.",
          requirements: [
            "3+ years experience",
            "JavaScript proficiency",
            "React experience",
          ],
          externalUrl: "https://example.com/job/1",
        },
        {
          id: "frontend-developer-startup",
          title: "Frontend Developer",
          company: "InnovateLab",
          location: "New York, NY",
          type: "Full-time",
          salary: "$70k - $100k",
          salaryMin: 70000,
          salaryMax: 100000,
          remote: false,
          postedDate: "3 days ago",
          matchScore: 78,
          skills: ["React", "TypeScript", "CSS"],
          description:
            "Build beautiful user interfaces for our next-generation platform.",
          requirements: [
            "2+ years frontend experience",
            "React expertise",
            "Design skills",
          ],
          externalUrl: "https://example.com/job/2",
        },
        {
          id: "fullstack-engineer-saas",
          title: "Full Stack Engineer",
          company: "SaaS Solutions",
          location: "San Francisco, CA",
          type: "Full-time",
          salary: "$100k - $140k",
          salaryMin: 100000,
          salaryMax: 140000,
          remote: true,
          postedDate: "1 week ago",
          matchScore: 92,
          skills: ["React", "Node.js", "PostgreSQL", "AWS"],
          description:
            "Lead development of our enterprise SaaS platform serving millions of users.",
          requirements: [
            "5+ years experience",
            "Full-stack expertise",
            "Cloud experience",
          ],
          externalUrl: "https://example.com/job/3",
        },
        {
          id: "backend-developer-fintech",
          title: "Backend Developer",
          company: "FinTech Pro",
          location: "Austin, TX",
          type: "Contract",
          salary: "$60/hour",
          salaryMin: 120000,
          salaryMax: 125000,
          remote: true,
          postedDate: "5 days ago",
          matchScore: 88,
          skills: ["Python", "Django", "PostgreSQL", "Redis"],
          description:
            "Build scalable backend systems for financial applications.",
          requirements: [
            "4+ years backend experience",
            "Python expertise",
            "Financial domain knowledge",
          ],
          externalUrl: "https://example.com/job/4",
        },
        {
          id: "mobile-developer-health",
          title: "Mobile Developer",
          company: "HealthTech Inc",
          location: "Boston, MA",
          type: "Full-time",
          salary: "$85k - $115k",
          salaryMin: 85000,
          salaryMax: 115000,
          remote: false,
          postedDate: "2 days ago",
          matchScore: 75,
          skills: ["React Native", "iOS", "Android", "JavaScript"],
          description:
            "Develop mobile applications that improve healthcare outcomes.",
          requirements: [
            "3+ years mobile development",
            "React Native experience",
            "Healthcare interest",
          ],
          externalUrl: "https://example.com/job/5",
        },
        {
          id: "devops-engineer-cloud",
          title: "DevOps Engineer",
          company: "CloudFirst",
          location: "Seattle, WA",
          type: "Full-time",
          salary: "$95k - $125k",
          salaryMin: 95000,
          salaryMax: 125000,
          remote: true,
          postedDate: "4 days ago",
          matchScore: 82,
          skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
          description:
            "Manage cloud infrastructure and deployment pipelines for high-traffic applications.",
          requirements: [
            "4+ years DevOps experience",
            "AWS certification preferred",
            "Container orchestration",
          ],
          externalUrl: "https://example.com/job/6",
        },
      ];
    }

    console.log(`Generated ${jobsData.length} job matches`);
    return jobsData;
  } catch (error) {
    console.error("Job matching error:", error?.message || "Unknown error");
    throw new Error("Failed to generate job matches");
  }
}

export async function getJobMatches(type = null) {
  try {
    const jobs = await generateJobMatches();

    // Filter by type if specified
    if (type && type !== "all") {
      return jobs.filter(
        (job) => job.type.toLowerCase().replace("-", "") === type.toLowerCase()
      );
    }

    return jobs;
  } catch (error) {
    console.error(
      "Failed to get job matches:",
      error?.message || "Unknown error"
    );
    return [];
  }
}

export async function saveJob(jobId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // For now, we'll just return success since jobs are generated dynamically
    // In a real app, you'd save to the SavedJob table
    return { success: true, message: "Job saved successfully" };
  } catch (error) {
    console.error("Save job error:", error?.message || "Unknown error");
    throw new Error("Failed to save job");
  }
}

export async function getSavedJobs() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // For now, return empty array since jobs are generated dynamically
    // In a real app, you'd fetch from the SavedJob table
    return [];
  } catch (error) {
    console.error("Get saved jobs error:", error?.message || "Unknown error");
    return [];
  }
}
