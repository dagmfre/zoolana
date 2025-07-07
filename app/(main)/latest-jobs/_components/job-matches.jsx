"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  DollarSign,
  Building,
  ExternalLink,
  Heart,
  Filter,
  RefreshCw,
  Search,
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function JobMatches() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [preferences, setPreferences] = useState({
    location: "",
    remote: "",
    salaryMin: "",
  });

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("type", filter);
      }

      const response = await fetch(`/api/job-matches?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateJobMatches = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/job-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
        toast.success("New job matches found!");
      } else {
        toast.error("Failed to generate job matches");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("An error occurred");
    } finally {
      setGenerating(false);
    }
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        toast.success("Job removed from saved");
      } else {
        newSet.add(jobId);
        toast.success("Job saved!");
      }
      return newSet;
    });
  };

  const filteredJobs = jobs.filter(
    (job) =>
      filter === "all" || job.type.toLowerCase().replace("-", "") === filter
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
      {/* Preferences and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Job Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Preferred location"
              value={preferences.location}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
            />
            <Select
              value={preferences.remote}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, remote: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Work type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Min salary"
              type="number"
              value={preferences.salaryMin}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  salaryMin: e.target.value,
                }))
              }
            />
            <Button
              onClick={generateJobMatches}
              disabled={generating}
              className="w-full"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`}
              />
              {generating ? "Finding..." : "Find Jobs"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Filter className="h-5 w-5" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="fulltime">Full-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="parttime">Part-time</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredJobs.length} jobs found
        </div>
      </div>

      {/* Job List */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No job matches yet.</p>
            <Button onClick={generateJobMatches} disabled={generating}>
              Find Job Matches
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card
              key={job.id || Math.random()}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {job.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <Building className="h-4 w-4" />
                          <span>{job.company}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          {job.matchScore}% Match
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveJob(job.id || Math.random())}
                          className={
                            savedJobs.has(job.id || Math.random())
                              ? "text-red-500"
                              : ""
                          }
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              savedJobs.has(job.id || Math.random())
                                ? "fill-current"
                                : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {job.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                        {job.remote && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            Remote
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{job.postedDate}</span>
                      </div>
                      <Badge variant="outline">{job.type}</Badge>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="group/btn" asChild>
                        <a
                          href={job.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Apply Now
                          <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
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
