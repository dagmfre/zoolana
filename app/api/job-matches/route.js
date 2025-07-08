import { auth } from "@clerk/nextjs/server";import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { preferences } = await req.json();

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        resumes: { take: 1, orderBy: { updatedAt: "desc" } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Generate job recommendations for this user:
    
    User Profile:
    - Industry: ${user.industry || "General"}
    - Bio: ${user.bio || "No bio provided"}
    - Skills: ${user.skills ? JSON.stringify(user.skills) : "No specific skills"}
    - Experience: ${user.experience || "Not specified"}
    
    Preferences: ${JSON.stringify(preferences || {})}
    
    Generate 8-10 job recommendations with this JSON structure:
    [
      {
        "title": "Job Title",
        "company": "Company Name",
        "location": "City, State",
        "type": "Full-time|Part-time|Contract|Freelance",
        "salary": "$80k - $120k",
        "salaryMin": 80000,
        "salaryMax": 120000,
        "postedDate": "2 days ago",
        "matchScore": 95,
        "skills": ["skill1", "skill2"],
        "description": "Job description...",
        "requirements": ["requirement1", "requirement2"],
        "benefits": ["benefit1", "benefit2"],
        "remote": true,
        "urgency": "high|medium|low",
        "companySize": "startup|small|medium|large",
        "externalUrl": "https://company.com/job"
      }
    ]
    
    Base recommendations on:
    1. User's skills and experience
    2. Industry alignment
    3. Career growth potential
    4. Market demand
    `;

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
          postedDate: "1 day ago",
          matchScore: 85,
          skills: ["JavaScript", "React"],
          description: "Join our development team",
          requirements: ["3+ years experience"],
          benefits: ["Health insurance", "Remote work"],
          remote: true,
          urgency: "medium",
          companySize: "medium",
          externalUrl: "https://example.com"
        }
      ];
    }

    return NextResponse.json(jobsData);
  } catch (error) {
    console.error("Job matching error:", error);
    return NextResponse.json(
      { error: "Failed to generate job matches" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const remote = searchParams.get("remote");
    const location = searchParams.get("location");

    // This would typically fetch from a job board API or database
    // For now, return cached/stored job matches
    
    return NextResponse.json([]);
  } catch (error) {
    console.error("Get job matches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch job matches" },
      { status: 500 }
    );
  }
}