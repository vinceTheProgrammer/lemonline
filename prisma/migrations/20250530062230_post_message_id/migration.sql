/*
  Warnings:

  - Added the required column `postMessageId` to the `Intro` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Intro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "interests" TEXT NOT NULL,
    "postMessageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Intro_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("discordId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Intro" ("description", "id", "interests", "userId") SELECT "description", "id", "interests", "userId" FROM "Intro";
DROP TABLE "Intro";
ALTER TABLE "new_Intro" RENAME TO "Intro";
CREATE UNIQUE INDEX "Intro_userId_key" ON "Intro"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
