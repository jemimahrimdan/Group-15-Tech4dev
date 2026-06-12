-- CreateIndex
CREATE INDEX "Announcement_authorId_idx" ON "Announcement"("authorId");

-- CreateIndex
CREATE INDEX "Announcement_isPinned_createdAt_idx" ON "Announcement"("isPinned", "createdAt");

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_userId_status_idx" ON "Application"("userId", "status");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Opportunity_type_idx" ON "Opportunity"("type");

-- CreateIndex
CREATE INDEX "Opportunity_track_idx" ON "Opportunity"("track");

-- CreateIndex
CREATE INDEX "Opportunity_location_idx" ON "Opportunity"("location");

-- CreateIndex
CREATE INDEX "Opportunity_isClosed_idx" ON "Opportunity"("isClosed");

-- CreateIndex
CREATE INDEX "Opportunity_deadline_idx" ON "Opportunity"("deadline");

-- CreateIndex
CREATE INDEX "Opportunity_postedById_idx" ON "Opportunity"("postedById");

-- CreateIndex
CREATE INDEX "Resource_type_idx" ON "Resource"("type");

-- CreateIndex
CREATE INDEX "Resource_track_idx" ON "Resource"("track");

-- CreateIndex
CREATE INDEX "Resource_postedById_idx" ON "Resource"("postedById");

-- CreateIndex
CREATE INDEX "Upvote_userId_idx" ON "Upvote"("userId");
