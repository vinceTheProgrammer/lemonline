-- CreateTable
CREATE TABLE "ChannelXpSettings" (
    "channelId" TEXT NOT NULL PRIMARY KEY,
    "baseMessageCreate" INTEGER NOT NULL DEFAULT 0,
    "baseThreadCreate" INTEGER NOT NULL DEFAULT 0,
    "multiplier" REAL NOT NULL DEFAULT 1,
    "multiplierExpiration" DATETIME
);
