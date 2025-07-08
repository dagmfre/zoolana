"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeJobDescription(jobDescription) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  Analyze this job description and extract key requirements:
  
  ${jobDescription}
  
  IMPORTANT: Respond ONLY with valid JSON, no markdown, no explanation:
  
  {
    "requiredSkills": ["skill1", "skill2"],
    "preferredSkills": ["skill3", "skill4"],
    "experience": "3-5 years",
    "education": "Bachelor's degree",
    "keywords": ["keyword1", "keyword2"],
    "jobLevel": "junior",
    "industry": "tech",
    "workType": "remote"
  }
  
  For jobLevel use: junior, mid, or senior
  For industry use: tech, finance, healthcare, marketing, etc
  For workType use: remote, hybrid, or onsite
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;

    let analysis;
    try {
      // Clean the response text
      const cleanedText = response.text()
        .replace(/```json\n?/g, "")
        .replace(/\n?```/g, "")
        .replace(/```/g, "")
        .trim();

      // Find JSON object boundaries
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}') + 1;
      
      let jsonText = cleanedText;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonText = cleanedText.substring(jsonStart, jsonEnd);
      }

      // Additional cleaning
      jsonText = jsonText
        .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
        .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      analysis = {
        requiredSkills: [],
        preferredSkills: [],
        experience: "Not specified",
        education: "Not specified",
        keywords: [],
        jobLevel: "mid",
        industry: "general",
        workType: "hybrid",
      };
    }

    return analysis;
  } catch (error) {
    console.error("Job analysis error:", error?.message || "Unknown error");
    throw new Error("Failed to analyze job description");
  }
}

export async function searchCandidates(query, filters = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
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

    return candidatesWithScores;
  } catch (error) {
    console.error("Candidate search error:", error?.message || "Unknown error");
    throw new Error("Failed to search candidates");
  }
}

export async function processBulkUpload(files) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // This would process multiple resume files
    // For demo purposes, we'll return a success message
    const processedFiles = files.map((file, index) => ({
      name: file.name,
      status: "processed",
      candidateId: `candidate_${index + 1}`,
      extractedData: {
        name: `Candidate ${index + 1}`,
        skills: ["JavaScript", "React", "Node.js"],
        experience: Math.floor(Math.random() * 10) + 1,
      },
    }));

    return {
      processedFiles,
      totalProcessed: processedFiles.length,
      errors: [],
    };
  } catch (error) {
    console.error("Bulk upload error:", error?.message || "Unknown error");
    throw new Error("Failed to process bulk upload");
  }
}
