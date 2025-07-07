"use client";

import { useState } from "react";
import {
  Upload,
  Search,
  Filter,
  Users,
  Star,
  Download,
  Eye,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function RecruiterTools() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobAnalysis, setJobAnalysis] = useState(null);

  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const response = await fetch("/api/recruiter-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "bulk_upload",
          data: { files: files.map((f) => ({ name: f.name, size: f.size })) },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Processed ${data.processedFiles.length} files`);
      } else {
        toast.error("Failed to process files");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload");
    }
  };

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    try {
      const response = await fetch("/api/recruiter-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "analyze_job_description",
          data: { jobDescription },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setJobAnalysis(data);
        toast.success("Job description analyzed!");
      } else {
        toast.error("Failed to analyze job description");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("An error occurred during analysis");
    }
  };

  const searchCandidates = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter search criteria");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/recruiter-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "search_candidates",
          data: { query: searchQuery, filters: {} },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        toast.success(`Found ${data.length} candidates`);
      } else {
        toast.error("Failed to search candidates");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("An error occurred during search");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="candidates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="candidates">Candidate Search</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Find Candidates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by skills, title, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button onClick={searchCandidates} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Job Description
                  </label>
                  <textarea
                    placeholder="Paste job description for AI-powered matching..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full h-32 p-3 border rounded-md resize-none"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <Button onClick={analyzeJobDescription} className="w-full">
                    AI Match Analysis
                  </Button>
                </div>
              </div>

              {/* Job Analysis Results */}
              {jobAnalysis && (
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Job Analysis Results</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">
                          Level:{" "}
                          <span className="capitalize">
                            {jobAnalysis.jobLevel}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">
                          Industry:{" "}
                          <span className="capitalize">
                            {jobAnalysis.industry}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">
                          Work Type:{" "}
                          <span className="capitalize">
                            {jobAnalysis.workType}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">
                          Experience: {jobAnalysis.experience}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="font-medium mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {jobAnalysis.requiredSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="default"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Candidate Results */}
          {candidates.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Matching Candidates ({candidates.length})
                </h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              </div>

              {candidates.map((candidate) => (
                <Card
                  key={candidate.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xl font-semibold">
                              {candidate.name}
                            </h4>
                            <p className="text-muted-foreground">
                              {candidate.industry}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              {candidate.matchScore}% Match
                            </Badge>
                            <Badge variant="outline">
                              ATS: {candidate.atsScore}%
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {candidate.bio}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>{candidate.experience} experience</span>
                          <span>{candidate.availability}</span>
                          <span>Active {candidate.lastActive}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {candidate.skills &&
                            candidate.skills.map((skill, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Profile Match</span>
                            <span>{candidate.matchScore}%</span>
                          </div>
                          <Progress
                            value={candidate.matchScore}
                            className="h-2"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                          <Button variant="outline" size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            Shortlist
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Resume Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  Upload multiple resumes
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports PDF, DOC, DOCX files. AI will automatically parse and
                  categorize.
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleBulkUpload}
                  className="hidden"
                  id="bulk-upload"
                />
                <label htmlFor="bulk-upload">
                  <Button className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Files
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{candidates.length}</div>
                <p className="text-sm text-muted-foreground">
                  In current search
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Match Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {candidates.length > 0
                    ? Math.round(
                        candidates.reduce((acc, c) => acc + c.matchScore, 0) /
                          candidates.length
                      )
                    : 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground">
                  Across all candidates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">High Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {candidates.filter((c) => c.matchScore >= 80).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  80%+ match score
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
