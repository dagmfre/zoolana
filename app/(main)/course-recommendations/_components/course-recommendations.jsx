"use client";

import { useState, useEffect } from "react";
import { Star, Clock, Users, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";

export default function CourseRecommendations() {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Mock course data - replace with API call
  useEffect(() => {
    setTimeout(() => {
      setCourses([
        {
          id: 1,
          title: "Advanced React Development",
          provider: "Tech Academy",
          rating: 4.8,
          students: 12450,
          duration: "8 weeks",
          level: "Advanced",
          price: "$199",
          skills: ["React", "JavaScript", "Frontend"],
          description:
            "Master advanced React concepts including hooks, context, and performance optimization.",
          image: "/api/placeholder/300/200",
        },
        {
          id: 2,
          title: "Machine Learning Fundamentals",
          provider: "Data Science Institute",
          rating: 4.7,
          students: 8930,
          duration: "12 weeks",
          level: "Beginner",
          price: "$299",
          skills: ["Python", "ML", "Data Science"],
          description:
            "Learn the fundamentals of machine learning and build your first AI models.",
          image: "/api/placeholder/300/200",
        },
        {
          id: 3,
          title: "Full Stack Development Bootcamp",
          provider: "Code Masters",
          rating: 4.9,
          students: 15670,
          duration: "16 weeks",
          level: "Intermediate",
          price: "$599",
          skills: ["Full Stack", "Node.js", "React", "MongoDB"],
          description:
            "Complete full stack development course covering frontend and backend technologies.",
          image: "/api/placeholder/300/200",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCourses = courses.filter(
    (course) => filter === "all" || course.level.toLowerCase() === filter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Filter className="h-5 w-5" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="group hover:shadow-lg transition-shadow"
          >
            <CardHeader className="p-0">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                <div className="text-4xl font-bold text-primary/50">
                  {course.provider[0]}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {course.level}
                  </Badge>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {course.provider}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {course.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-lg font-bold text-primary">
                    {course.price}
                  </span>
                  <Button size="sm" className="group/btn">
                    View Course
                    <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
