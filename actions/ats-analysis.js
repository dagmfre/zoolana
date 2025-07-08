"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeResume(formData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const file = formData.get("file");
  const fileName = file.name;

  try {
    // Convert file to text (simplified - you might want to use pdf-parse)
    const text = await file.text();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze this resume for ATS (Applicant Tracking System) compatibility. 
    Provide a score out of 100 and detailed feedback.

    Resume Text:
    ${text}

    Please respond with a JSON object containing:
    {
      "score": number (0-100),
      "issues": [
        {"type": "error|warning|success", "message": "specific issue"}
      ],
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    }

    Consider these ATS factors:
    - Proper section headings (Experience, Education, Skills)
    - Contact information completeness
    - Keywords and industry terms
    - File format compatibility
    - Font and formatting simplicity
    - Quantifiable achievements
    - Relevant skills matching
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    let analysis;
    try {
      analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, ""));
    } catch (parseError) {
      analysis = {
        score: 75,
        issues: [
          {
            type: "warning",
            message: "Could not fully analyze resume structure",
          },
        ],
        suggestions: [
          "Ensure your resume uses standard section headers",
          "Include contact information at the top",
          "Use bullet points for achievements",
        ],
      };
    }

    // Save to database
    const atsAnalysis = await db.aTSAnalysis.create({
      data: {
        userId: user.clerkUserId,
        fileName,
        score: analysis.score,
        issues: analysis.issues,
        suggestions: analysis.suggestions,
      },
    });

    return {
      id: atsAnalysis.id,
      score: analysis.score,
      issues: analysis.issues,
      suggestions: analysis.suggestions,
    };
  } catch (error) {
    console.error("ATS Analysis error:", error);
    throw new Error("Failed to analyze resume");
  }
}

export async function getATSAnalyses() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.aTSAnalysis.findMany({
    where: { userId: user.clerkUserId },
    orderBy: { createdAt: "desc" },
  });
}
