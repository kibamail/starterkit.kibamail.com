-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "logtoInvitationId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_logtoInvitationId_key" ON "invitations"("logtoInvitationId");

-- CreateIndex
CREATE INDEX "invitations_inviteeEmail_idx" ON "invitations"("inviteeEmail");

-- CreateIndex
CREATE INDEX "invitations_workspaceId_idx" ON "invitations"("workspaceId");

-- CreateIndex
CREATE INDEX "invitations_expiresAt_idx" ON "invitations"("expiresAt");

-- CreateIndex
CREATE INDEX "invitations_status_idx" ON "invitations"("status");
