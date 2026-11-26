/*
  Warnings:

  - Added the required column `category` to the `BlogPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TECHNOLOGY', 'LIFESTYLE', 'HEALTH_FITNESS', 'BUSINESS_FINANCE', 'TRAVEL', 'ENTERTAINMENT', 'FOOD_DRINK', 'ARTS_DESIGN', 'EDUCATION_LEARNING', 'OPINION_POLITICS');

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "category" "Category" NOT NULL;
