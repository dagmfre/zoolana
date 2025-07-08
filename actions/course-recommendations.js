"use server";

import { auth } from "@clerk/nextjs/server"/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateCourseRecommendations() {
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
  Based on this user profile, recommend relevant online courses:
  
  Industry: ${user.industry || "General"}
  Bio: ${user.bio || "No bio provided"}
  Skills: ${
    user.skills ? JSON.stringify(user.skills) : "No specific skills listed"
  }
  Experience: ${user.experience || "Not specified"} years
  Resume Content: ${user.resume?.content ? "Has resume" : "No resume"}
  
  Generate exactly 6 diverse course recommendations in valid JSON format.
  
  IMPORTANT: Respond ONLY with valid JSON array, no markdown, no explanation:
  
  [
    {
      "title": "Course Name",
      "provider": "Platform Name", 
      "rating": 4.5,
      "students": 15000,
      "duration": "6 weeks",
      "level": "Beginner",
      "price": "$49",
      "skills": ["skill1", "skill2"],
      "description": "Brief course description",
      "category": "Programming",
      "externalUrl": "https://example.com/course"
    }
  ]
  
  Focus on skills gap analysis and career progression.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let coursesText = response.text();

    let courses;
    try {
      // More aggressive cleaning of the response
      coursesText = coursesText
        .replace(/```json\n?/g, "")
        .replace(/\n?```/g, "")
        .replace(/```/g, "")
        .trim();

      // Find JSON array start and end
      const jsonStart = coursesText.indexOf('[');
      const jsonEnd = coursesText.lastIndexOf(']') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        coursesText = coursesText.substring(jsonStart, jsonEnd);
      }

      // Additional cleaning for common JSON issues
      coursesText = coursesText
        .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
        .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

      console.log("Cleaned JSON text:", coursesText.substring(0, 200) + "...");
      
      courses = JSON.parse(coursesText);

      // Ensure courses is an array
      if (!Array.isArray(courses)) {
        throw new Error("Response is not an array");
      }

      // Validate each course has required fields
      courses = courses.filter(course => 
        course.title && 
        course.provider && 
        course.description &&
        course.category
      ).slice(0, 6); // Limit to 6 courses

    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", coursesText);
      
      // Fallback courses
      courses = [
        {
          title: "Complete Web Development Bootcamp",
          provider: "Udemy",
          rating: 4.6,
          students: 45000,
          duration: "12 weeks",
          level: "Beginner",
          price: "$79",
          skills: ["HTML", "CSS", "JavaScript", "React"],
          description: "Learn web development from scratch with hands-on projects",
          category: "Programming",
          externalUrl: "https://udemy.com/course/web-development",
        },
        {
          title: "Data Science with Python",
          provider: "Coursera",
          rating: 4.8,
          students: 32000,
          duration: "10 weeks",
          level: "Intermediate",
          price: "$99",
          skills: ["Python", "Pandas", "Machine Learning"],
          description: "Master data science fundamentals and machine learning",
          category: "Data Science",
          externalUrl: "https://coursera.org/course/data-science-python",
        },
        {
          title: "UI/UX Design Fundamentals",
          provider: "Udemy",
          rating: 4.7,
          students: 28000,
          duration: "8 weeks",
          level: "Beginner",
          price: "$65",
          skills: ["Figma", "Design Thinking", "Prototyping"],
          description: "Learn modern UI/UX design principles and tools",
          category: "Design",
          externalUrl: "https://udemy.com/course/ui-ux-design",
        },
        {
          title: "Digital Marketing Strategy",
          provider: "Coursera",
          rating: 4.5,
          students: 22000,
          duration: "6 weeks",
          level: "Intermediate",
          price: "$89",
          skills: ["SEO", "Social Media", "Analytics"],
          description: "Master digital marketing and grow your online presence",
          category: "Marketing",
          externalUrl: "https://coursera.org/course/digital-marketing",
        },
        {
          title: "Business Analytics with Excel",
          provider: "edX",
          rating: 4.4,
          students: 18000,
          duration: "8 weeks",
          level: "Advanced",
          price: "$129",
          skills: ["Excel", "SQL", "Tableau"],
          description: "Learn business intelligence and data analytics",
          category: "Business",
          externalUrl: "https://edx.org/course/business-analytics",
        },
        {
          title: "Cloud Computing Fundamentals",
          provider: "AWS",
          rating: 4.3,
          students: 25000,
          duration: "4 weeks",
          level: "Intermediate",
          price: "Free",
          skills: ["AWS", "Cloud Architecture", "DevOps"],
          description: "Learn cloud computing basics with AWS",
          category: "Programming",
          externalUrl: "https://aws.amazon.com/training/",
        },
      ];
    }

    // Save courses to database and create recommendations
    const savedCourses = [];

    for (const course of courses) {
      try {
        // Generate a clean course ID
        const courseId = course.title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-")
          .substring(0, 50);

        // Ensure skills is an array
        const skillsArray = Array.isArray(course.skills) ? course.skills : [];

        // Create or update course
        const savedCourse = await db.course.upsert({
          where: { id: courseId },
          update: {
            title: course.title,
            provider: course.provider,
            rating: Number(course.rating) || 4.5,
            students: Number(course.students) || 1000,
            duration: course.duration || "4 weeks",
            level: course.level || "Beginner",
            price: course.price || "Free",
            skills: skillsArray,
            description: course.description,
            category: course.category || "General",
            externalUrl: course.externalUrl || "#",
          },
          create: {
            id: courseId,
            title: course.title,
            provider: course.provider,
            rating: Number(course.rating) || 4.5,
            students: Number(course.students) || 1000,
            duration: course.duration || "4 weeks",
            level: course.level || "Beginner",
            price: course.price || "Free",
            skills: skillsArray,
            description: course.description,
            category: course.category || "General",
            externalUrl: course.externalUrl || "#",
          },
        });

        // Create user recommendation
        await db.userCourseRecommendation.upsert({
          where: {
            userId_courseId: {
              userId: user.clerkUserId,
              courseId: savedCourse.id,
            },
          },
          update: {
            score: Math.floor(Math.random() * 30) + 70,
            reasons: ["AI recommendation based on profile"],
          },
          create: {
            userId: user.clerkUserId,
            courseId: savedCourse.id,
            score: Math.floor(Math.random() * 30) + 70,
            reasons: ["AI recommendation based on profile"],
          },
        });

        savedCourses.push({
          ...course,
          id: savedCourse.id,
        });
      } catch (dbError) {
        console.error("Error saving course:", course.title, dbError.message);
        continue;
      }
    }

    console.log(`Successfully saved ${savedCourses.length} courses`);
    return courses;
  } catch (error) {
    console.error("Course recommendation error:", error);
    throw new Error("Failed to generate course recommendations");
  }
}

export async function getUserCourseRecommendations() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const recommendations = await db.userCourseRecommendation.findMany({
      where: { userId: user.clerkUserId },
      include: { course: true },
      orderBy: { score: "desc" },
    });

    return recommendations.map((rec) => ({
      ...rec.course,
      recommendationScore: rec.score,
      reasons: rec.reasons,
    }));
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}
