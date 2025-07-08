-- CreateTable
CREATE TABLE "ATSAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "issues" JSONB NOT NULL,
    "suggestions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ATSAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "students" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "skills" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "externalUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCourseRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasons" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCourseRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "salary" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "skills" TEXT[],
    "industry" TEXT,
    "experience" TEXT,
    "postedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "externalUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserJobMatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "reasons" JSONB NOT NULL,
    "isViewed" BOOLEAN NOT NULL DEFAULT false,
    "isApplied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserJobMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruiterSearch" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "searchQuery" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruiterSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDescription" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "content" TEXT NOT NULL,
    "analyzedData" JSONB,
    "requiredSkills" TEXT[],
    "preferredSkills" TEXT[],
    "experience" TEXT,
    "education" TEXT,
    "keywords" TEXT[],
    "jobLevel" TEXT,
    "industry" TEXT,
    "workType" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkUpload" (
    "id" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "totalFiles" INTEGER NOT NULL,
    "processedFiles" INTEGER NOT NULL DEFAULT 0,
    "results" JSONB,
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "skills" TEXT[],
    "experience" INTEGER,
    "education" TEXT,
    "location" TEXT,
    "availability" TEXT,
    "resumeContent" TEXT,
    "atsScore" INTEGER,
    "matchHistory" JSONB,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCourseRecommendation_userId_courseId_key" ON "UserCourseRecommendation"("userId", "courseId");

-- CreateIndex
CREATE INDEX "Job_industry_type_remote_idx" ON "Job"("industry", "type", "remote");

-- CreateIndex
CREATE INDEX "Job_postedDate_idx" ON "Job"("postedDate");

-- CreateIndex
CREATE INDEX "UserJobMatch_userId_matchScore_idx" ON "UserJobMatch"("userId", "matchScore");

-- CreateIndex
CREATE UNIQUE INDEX "UserJobMatch_userId_jobId_key" ON "UserJobMatch"("userId", "jobId");

-- CreateIndex
CREATE INDEX "SavedJob_userId_idx" ON "SavedJob"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_jobId_key" ON "SavedJob"("userId", "jobId");

-- CreateIndex
CREATE INDEX "RecruiterSearch_recruiterId_idx" ON "RecruiterSearch"("recruiterId");

-- CreateIndex
CREATE INDEX "RecruiterSearch_createdAt_idx" ON "RecruiterSearch"("createdAt");

-- CreateIndex
CREATE INDEX "JobDescription_industry_jobLevel_idx" ON "JobDescription"("industry", "jobLevel");

-- CreateIndex
CREATE INDEX "JobDescription_createdAt_idx" ON "JobDescription"("createdAt");

-- CreateIndex
CREATE INDEX "BulkUpload_uploadedBy_idx" ON "BulkUpload"("uploadedBy");

-- CreateIndex
CREATE INDEX "BulkUpload_status_idx" ON "BulkUpload"("status");

-- CreateIndex
CREATE INDEX "CandidateProfile_skills_idx" ON "CandidateProfile"("skills");

-- CreateIndex
CREATE INDEX "CandidateProfile_experience_idx" ON "CandidateProfile"("experience");

-- CreateIndex
CREATE INDEX "CandidateProfile_location_idx" ON "CandidateProfile"("location");

-- CreateIndex
CREATE INDEX "CandidateProfile_lastActive_idx" ON "CandidateProfile"("lastActive");

-- AddForeignKey
ALTER TABLE "ATSAnalysis" ADD CONSTRAINT "ATSAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkUserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseRecommendation" ADD CONSTRAINT "UserCourseRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkUserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseRecommendation" ADD CONSTRAINT "UserCourseRecommendation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJobMatch" ADD CONSTRAINT "UserJobMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkUserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJobMatch" ADD CONSTRAINT "UserJobMatch_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerkUserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruiterSearch" ADD CONSTRAINT "RecruiterSearch_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("clerkUserId") ON DELETE RESTRICT ON UPDATE CASCADE;
