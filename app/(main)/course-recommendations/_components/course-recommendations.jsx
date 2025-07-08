"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Clock,
  Users,
  ExternalLink,
  Filter,
  RefreshCw,
} from "lucide-react";
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
import { toast } from "sonner";
import {
  generateCourseRecommendations,
  getUserCourseRecommendations,
} from "@/actions/course-recommendations";

export default function CourseRecommendations() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const data = await getUserCourseRecommendations();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewRecommendations = async () => {
    setGenerating(true);
    try {
      const newCourses = await generateCourseRecommendations();
      setCourses(newCourses);
      toast.success("New course recommendations generated!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate recommendations");
    } finally {
      setGenerating(false);
    }
  };

  const filteredCourses = courses.filter(
    (course) => filter === "all" || course.category.toLowerCase() === filter
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
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>AI Course Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="data science">Data Science</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateNewRecommendations} disabled={generating}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`}
              />
              {generating ? "Generating..." : "Get New Recommendations"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No course recommendations yet.
            </p>
            <Button onClick={generateNewRecommendations} disabled={generating}>
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          course.level === "Beginner"
                            ? "secondary"
                            : course.level === "Intermediate"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {course.level}
                      </Badge>
                      <span className="font-semibold text-primary">
                        {course.price}
                      </span>
                    </div>
                    <Button size="sm" className="group/btn" asChild>
                      <a
                        href={course.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Course
                        <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
