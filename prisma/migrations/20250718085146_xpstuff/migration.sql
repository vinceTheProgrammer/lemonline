-- CreateTable
CREATE TABLE "ServerXpSettings" (
    "guildId" TEXT NOT NULL PRIMARY KEY,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 5,
    "levelFormula" TEXT NOT NULL DEFAULT '100 * (level - 1) * level / 2'
);

-- CreateTable
CREATE TABLE "Level" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Role" (
    "roleId" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "LevelRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "levelId" INTEGER NOT NULL,
    "roleId" TEXT NOT NULL,
    "gained" BOOLEAN NOT NULL,
    CONSTRAINT "LevelRole_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LevelRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("roleId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LevelRole_levelId_roleId_key" ON "LevelRole"("levelId", "roleId");
