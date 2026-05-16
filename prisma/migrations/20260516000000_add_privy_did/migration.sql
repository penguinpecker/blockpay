-- AlterTable
ALTER TABLE "User" ADD COLUMN "privyDid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_privyDid_key" ON "User"("privyDid");
