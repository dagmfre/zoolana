"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function ATSChecker() {
  const { user } = useUser();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [previousAnalyses, setPreviousAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch previous analyses
  useEffect(() => {
    fetchPreviousAnalyses();
  }, []);

  const fetchPreviousAnalyses = async () => {
    try {
      const response = await fetch("/api/ats-analysis");
      if (response.ok) {
        const data = await response.json();
        setPreviousAnalyses(data);
      }
    } catch (error) {
      console.error("Failed to fetch previous analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      setResults(null);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const analyzeResume = async () => {
    if (!file) return;

    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ats-analysis", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResults(data);
      toast.success("Analysis complete!");

      // Refresh previous analyses
      fetchPreviousAnalyses();
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop your resume here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF files up to 10MB
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload">
              <Button variant="outline" className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </label>
            {file && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  {file.name}
                </p>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-4 flex justify-center">
              <Button onClick={analyzeResume} disabled={analyzing}>
                {analyzing ? "Analyzing..." : "Check ATS Score"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>ATS Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{results.score}/100</div>
              <Progress
                value={results.score}
                className="w-full max-w-md mx-auto"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {results.score >= 80
                  ? "Excellent"
                  : results.score >= 60
                  ? "Good"
                  : "Needs Improvement"}
              </p>
            </div>

            {/* Issues */}
            <div>
              <h4 className="font-semibold mb-3">Issues Found</h4>
              <div className="space-y-2">
                {results.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    {issue.type === "error" && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {issue.type === "warning" && (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    {issue.type === "success" && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <span className="text-sm">{issue.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="font-semibold mb-3">Improvement Suggestions</h4>
              <ul className="space-y-2">
                {results.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Analyses */}
      {!loading && previousAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Previous Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previousAnalyses.slice(0, 5).map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{analysis.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{analysis.score}/100</div>
                    <div className="text-sm text-muted-foreground">
                      {analysis.score >= 80
                        ? "Excellent"
                        : analysis.score >= 60
                        ? "Good"
                        : "Needs Work"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
