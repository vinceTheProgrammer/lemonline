/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Intro` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Intro_userId_key" ON "Intro"("userId");
