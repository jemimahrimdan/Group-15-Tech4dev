-- CreateEnum
CREATE TYPE "LearningTrack" AS ENUM ('SOFTWARE_DEVELOPMENT', 'DATA_SCIENCE', 'MOBILE_DEVELOPMENT', 'CLOUD_COMPUTING', 'AI_MACHINE_LEARNING', 'CYBERSECURITY', 'DEVOPS', 'PRODUCT_DESIGN', 'PRODUCT_MANAGEMENT', 'UI_UX_DESIGN');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('JUNIOR', 'MID', 'SENIOR');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "bio" VARCHAR(300),
    "avatar" TEXT,
    "location" TEXT,
    "learningTrack" "LearningTrack",
    "skills" TEXT[],
    "goals" VARCHAR(300),
    "linkedin" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "website" TEXT,
    "experienceLevel" "ExperienceLevel",
    "completion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
