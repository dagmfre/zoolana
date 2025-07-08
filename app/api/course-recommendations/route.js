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

    // Get user profile
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        resumes: { take: 1, orderBy: { updatedAt: "desc" } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate AI recommendations based on user profile
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Based on this user profile, recommend relevant online courses:
    
    Industry: ${user.industry || "General"}
    Bio: ${user.bio || "No bio provided"}
    Skills: ${
      user.skills ? JSON.stringify(user.skills) : "No specific skills listed"
    }
    Experience: ${user.experience || "Not specified"}
    
    Generate 6-8 course recommendations with the following JSON structure:
    [
      {
        "title": "Course Title",
        "provider": "Provider Name",
        "rating": 4.5,
        "students": 12000,
        "duration": "8 weeks",
        "level": "Beginner|Intermediate|Advanced",
        "price": "$199",
        "skills": ["skill1", "skill2"],
        "description": "Course description",
        "category": "Programming|Design|Business|Data Science|Marketing",
        "externalUrl": "https://example.com/course",
        "reasons": ["reason1", "reason2"]
      }
    ]
    
    Make recommendations based on:
    1. User's current industry and role
    2. Skills they might want to develop
    3. Career advancement opportunities
    4. Industry trends and demands
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let coursesData;

    try {
      coursesData = JSON.parse(
        response.text().replace(/```json\n?|\n?```/g, "")
      );
    } catch (parseError) {
      // Fallback recommendations
      coursesData = [
        {
          title: "Full Stack Web Development",
          provider: "Tech Academy",
          rating: 4.7,
          students: 15000,
          duration: "12 weeks",
          level: "Intermediate",
          price: "$299",
          skills: ["JavaScript", "React", "Node.js"],
          description: "Complete full stack development course",
          category: "Programming",
          externalUrl: "https://example.com",
          reasons: ["High demand skill", "Matches your profile"],
        },
      ];
    }

    // Save courses and recommendations to database
    const recommendations = [];

    for (const courseData of coursesData) {
      // Create or update course
      const course = await db.course.upsert({
        where: {
          title_provider: {
            title: courseData.title,
            provider: courseData.provider,
          },
        },
        update: {
          rating: courseData.rating,
          students: courseData.students,
          duration: courseData.duration,
          level: courseData.level,
          price: courseData.price,
          skills: courseData.skills,
          description: courseData.description,
          category: courseData.category,
          externalUrl: courseData.externalUrl,
        },
        create: {
          title: courseData.title,
          provider: courseData.provider,
          rating: courseData.rating,
          students: courseData.students,
          duration: courseData.duration,
          level: courseData.level,
          price: courseData.price,
          skills: courseData.skills,
          description: courseData.description,
          category: courseData.category,
          externalUrl: courseData.externalUrl,
        },
      });

      // Create recommendation
      const recommendation = await db.userCourseRecommendation.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
        update: {
          score: Math.random() * 0.3 + 0.7, // 0.7-1.0
          reasons: courseData.reasons,
        },
        create: {
          userId,
          courseId: course.id,
          score: Math.random() * 0.3 + 0.7,
          reasons: courseData.reasons,
        },
      });

      recommendations.push({
        ...course,
        recommendationScore: recommendation.score,
        reasons: recommendation.reasons,
      });
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Course recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
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
    const level = searchParams.get("level");
    const category = searchParams.get("category");

    // Get user's recommendations
    const recommendations = await db.userCourseRecommendation.findMany({
      where: {
        userId,
        ...(level && { course: { level } }),
        ...(category && { course: { category } }),
      },
      include: { course: true },
      orderBy: { score: "desc" },
    });

    const coursesWithRecommendations = recommendations.map((rec) => ({
      ...rec.course,
      recommendationScore: rec.score,
      reasons: rec.reasons,
    }));

    return NextResponse.json(coursesWithRecommendations);
  } catch (error) {
    console.error("Get course recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
