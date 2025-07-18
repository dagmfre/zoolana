import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function extractTextFromPDF(buffer) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF');
  }
}

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer and extract text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const resumeText = await extractTextFromPDF(buffer);

    // Generate AI analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Analyze this resume for ATS (Applicant Tracking System) compatibility. 
    Provide a score out of 100 and detailed feedback.

    Resume Text:
    ${resumeText}

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

    // Parse AI response
    let analysis;
    try {
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, "").trim();
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Fallback parsing if AI doesn't return valid JSON
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
        userId,
        fileName: file.name,
        score: analysis.score,
        issues: analysis.issues,
        suggestions: analysis.suggestions,
      },
    });

    return NextResponse.json({
      id: atsAnalysis.id,
      score: analysis.score,
      issues: analysis.issues,
      suggestions: analysis.suggestions,
    });
  } catch (error) {
    console.error("ATS Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
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

    const analyses = await db.aTSAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Get ATS analyses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}
