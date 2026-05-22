/*
  Warnings:

  - Added the required column `live_url` to the `Deployment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "live_url" TEXT NOT NULL;
