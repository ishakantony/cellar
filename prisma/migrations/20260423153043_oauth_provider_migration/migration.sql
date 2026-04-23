/*
  Warnings:

  - You are about to drop the column `accessToken` on the `OAuthAccessToken` table. All the data in the column will be lost.
  - You are about to drop the column `accessTokenExpiresAt` on the `OAuthAccessToken` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `OAuthAccessToken` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenExpiresAt` on the `OAuthAccessToken` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OAuthAccessToken` table. All the data in the column will be lost.
  - The `scopes` column on the `OAuthAccessToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `consentGiven` on the `OAuthConsent` table. All the data in the column will be lost.
  - The `scopes` column on the `OAuthConsent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `OAuthApplication` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[token]` on the table `OAuthAccessToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiresAt` to the `OAuthAccessToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `OAuthAccessToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OAuthAccessToken" DROP CONSTRAINT "OAuthAccessToken_clientId_fkey";

-- DropForeignKey
ALTER TABLE "OAuthApplication" DROP CONSTRAINT "OAuthApplication_userId_fkey";

-- DropForeignKey
ALTER TABLE "OAuthConsent" DROP CONSTRAINT "OAuthConsent_clientId_fkey";

-- DropIndex
DROP INDEX "OAuthAccessToken_accessToken_key";

-- DropIndex
DROP INDEX "OAuthAccessToken_refreshToken_key";

-- AlterTable
ALTER TABLE "OAuthAccessToken" DROP COLUMN "accessToken",
DROP COLUMN "accessTokenExpiresAt",
DROP COLUMN "refreshToken",
DROP COLUMN "refreshTokenExpiresAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "referenceId" TEXT,
ADD COLUMN     "refreshId" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "token" TEXT NOT NULL,
DROP COLUMN "scopes",
ADD COLUMN     "scopes" TEXT[];

-- AlterTable
ALTER TABLE "OAuthConsent" DROP COLUMN "consentGiven",
ADD COLUMN     "referenceId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL,
DROP COLUMN "scopes",
ADD COLUMN     "scopes" TEXT[];

-- DropTable
DROP TABLE "OAuthApplication";

-- CreateTable
CREATE TABLE "OAuthClient" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT,
    "name" TEXT,
    "icon" TEXT,
    "metadata" JSONB,
    "redirectUris" TEXT[],
    "postLogoutRedirectUris" TEXT[],
    "type" TEXT,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "skipConsent" BOOLEAN,
    "enableEndSession" BOOLEAN,
    "subjectType" TEXT,
    "scopes" TEXT[],
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uri" TEXT,
    "contacts" TEXT[],
    "tos" TEXT,
    "policy" TEXT,
    "softwareId" TEXT,
    "softwareVersion" TEXT,
    "softwareStatement" TEXT,
    "tokenEndpointAuthMethod" TEXT,
    "grantTypes" TEXT[],
    "responseTypes" TEXT[],
    "public" BOOLEAN,
    "requirePKCE" BOOLEAN,
    "referenceId" TEXT,

    CONSTRAINT "OAuthClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthRefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT NOT NULL,
    "referenceId" TEXT,
    "scopes" TEXT[],
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" TIMESTAMP(3),

    CONSTRAINT "OAuthRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthClient_clientId_key" ON "OAuthClient"("clientId");

-- CreateIndex
CREATE INDEX "OAuthClient_userId_idx" ON "OAuthClient"("userId");

-- CreateIndex
CREATE INDEX "OAuthRefreshToken_clientId_idx" ON "OAuthRefreshToken"("clientId");

-- CreateIndex
CREATE INDEX "OAuthRefreshToken_userId_idx" ON "OAuthRefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccessToken_token_key" ON "OAuthAccessToken"("token");

-- AddForeignKey
ALTER TABLE "OAuthClient" ADD CONSTRAINT "OAuthClient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthAccessToken" ADD CONSTRAINT "OAuthAccessToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OAuthClient"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthConsent" ADD CONSTRAINT "OAuthConsent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OAuthClient"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;
