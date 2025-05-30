-- CreateTable
CREATE TABLE "Intro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "interests" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Intro_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("discordId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialMediaLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "introId" INTEGER NOT NULL,
    CONSTRAINT "SocialMediaLink_introId_fkey" FOREIGN KEY ("introId") REFERENCES "Intro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
