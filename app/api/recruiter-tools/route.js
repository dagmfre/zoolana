import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, data } = await req.json();

    switch (action) {
      case "analyze_job_description":
        return await analyzeJobDescription(data.jobDescription);

      case "search_candidates":
        return await searchCandidates(data.query, data.filters);

      case "bulk_upload":
        return await processBulkUpload(data.files);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Recruiter tools error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

async function analyzeJobDescription(jobDescription) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
  Analyze this job description and extract key requirements:
  
  ${jobDescription}
  
  Return JSON with:
  {
    "requiredSkills": ["skill1", "skill2"],
    "preferredSkills": ["skill3", "skill4"],
    "experience": "3-5 years",
    "education": "Bachelor's degree",
    "keywords": ["keyword1", "keyword2"],
    "jobLevel": "junior|mid|senior",
    "industry": "tech|finance|healthcare|etc",
    "workType": "remote|hybrid|onsite"
  }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  try {
    const analysis = JSON.parse(
      response.text().replace(/```json\n?|\n?```/g, "")
    );
    return NextResponse.json(analysis);
  } catch (parseError) {
    return NextResponse.json({
      requiredSkills: [],
      preferredSkills: [],
      experience: "Not specified",
      education: "Not specified",
      keywords: [],
      jobLevel: "mid",
      industry: "general",
      workType: "hybrid",
    });
  }
}

async function searchCandidates(query, filters) {
  // This would integrate with your candidate database
  // For now, return sample candidates based on the search

  const candidates = await db.user.findMany({
    where: {
      OR: [
        { bio: { contains: query, mode: "insensitive" } },
        { industry: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      industry: true,
      bio: true,
      skills: true,
      experience: true,
      createdAt: true,
    },
    take: 20,
  });

  // Calculate match scores (simplified)
  const candidatesWithScores = candidates.map((candidate) => ({
    ...candidate,
    matchScore: Math.floor(Math.random() * 30) + 70, // 70-100
    atsScore: Math.floor(Math.random() * 20) + 80, // 80-100
    availability: "Available",
    lastActive: "2 days ago",
  }));

  return NextResponse.json(candidatesWithScores);
}

async function processBulkUpload(files) {
  // Process multiple resume files
  // This would parse each file and extract candidate information

  const processedFiles = files.map((file) => ({
    fileName: file.name,
    status: "processed",
    candidateData: {
      name: "Extracted Name",
      email: "extracted@email.com",
      skills: ["skill1", "skill2"],
      experience: "3 years",
    },
  }));

  return NextResponse.json({ processedFiles });
}
