-- CreateTable
CREATE TABLE "weekly_report_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "financialSnapshot" JSONB NOT NULL,
    "reportData" JSONB NOT NULL,
    "comparativeInsights" JSONB,
    "emailResendId" TEXT,
    "reportVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_report_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_report_snapshots_userId_snapshotDate_idx" ON "weekly_report_snapshots"("userId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_report_snapshots_userId_weekStart_key" ON "weekly_report_snapshots"("userId", "weekStart");

-- AddForeignKey
ALTER TABLE "weekly_report_snapshots" ADD CONSTRAINT "weekly_report_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
