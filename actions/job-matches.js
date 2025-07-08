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
      resumes: { take: 1, orderBy: { updatedAt: "desc" } },
    },
  });

  if (!user) throw new Error("User not found");

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
  Generate job recommendations for this user profile:
  
  Industry: ${user.industry || "General"}
  Bio: ${user.bio || "No bio provided"}
  Skills: ${
    user.skills ? JSON.stringify(user.skills) : "No specific skills listed"
  }
  Experience: ${user.experience || "Not specified"} years
  
  User Preferences:
  Location: ${preferences.location || "Any"}
  Remote: ${preferences.remote || "Any"}
  Minimum Salary: ${preferences.salaryMin || "Not specified"}
  
  Generate 8-12 realistic job opportunities in JSON format:
  [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "type": "Full-time|Part-time|Contract",
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
  
  Base recommendations on:
  1. User's skills and experience
  2. Industry alignment
  3. Career growth potential
  4. Market demand
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;

    let jobsData;
    try {
      jobsData = JSON.parse(response.text().replace(/```json\n?|\n?```/g, ""));
    } catch (parseError) {
      // Fallback jobs
      jobsData = [
        {
          title: "Software Developer",
          company: "Tech Company",
          location: "Remote",
          type: "Full-time",
          salary: "$80k - $120k",
          salaryMin: 80000,
          salaryMax: 120000,
          remote: true,
          postedDate: "1 day ago",
          matchScore: 85,
          skills: ["JavaScript", "React"],
          description: "Join our development team",
          requirements: ["3+ years experience", "JavaScript proficiency"],
          externalUrl: "https://example.com/job",
        },
      ];
    }

    return jobsData;
  } catch (error) {
    console.error("Job matching error:", error);
    throw new Error("Failed to generate job matches");
  }
}

export async function getJobMatches(type = null) {
  // This could fetch from a database if you're storing job matches
  // For now, we'll return a basic set or call generateJobMatches
  try {
    return await generateJobMatches();
  } catch (error) {
    console.error("Failed to get job matches:", error);
    return [];
  }
}
