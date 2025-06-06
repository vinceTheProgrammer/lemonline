import type { Collection, GuildMember } from 'discord.js';
import prisma from '../utils/prisma.js';
import { handlePrismaError } from './errors.js';
import type { Intro, Prisma } from '@prisma/client';

export async function logMessage(discordId: string, date?: Date) {
    try {
        incrementMessageCount(discordId);
        if (date) {
            return await prisma.message.create({
                data: {
                    discordId: discordId,
                    timestamp: date
                }
            })
        }
        return await prisma.message.create({
            data: {
                discordId: discordId
            }
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function initUser(discordId: string) {
    try {
        return await prisma.user.create({
            data: {
                discordId: discordId
            },
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function getUserMessageCountSinceDate(discordId: string, date: Date): Promise<number> {
    try {
        return await prisma.message.count({
            where: {
                discordId: discordId,
                timestamp: {
                    gte: date,
                },
            },
        });
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function incrementMessageCount(discordId: string) {
    try {
        return await prisma.user.upsert({
            where: {
                discordId: discordId
            },
            update: {
                messageCount: {
                    increment: 1
                }
            },
            create: {
                discordId: discordId,
                messageCount: 1
            }
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function findByDiscordId(discordId: string) {
    try {
        return await prisma.user.findFirst({
            where: {
                discordId: discordId,
            }
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function findByDiscordIdWithIntro(discordId: string) {
    try {
        return await prisma.user.findFirst({
            where: {
                discordId: discordId,
            },
            include: {
                intro: {
                    include: {
                        socials: true
                    }
                }
            }
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function updateIntroByDiscordIdAndIntro(discordId: string, data: Prisma.IntroUpdateInput) {
    try {

        const debug : Prisma.IntroCreateInput = {
            user: {
                connectOrCreate: {
                    where: {discordId: discordId},
                    create: {
                        discordId: discordId
                    }
                },
            }
        }

        const description = typeof data.description == 'string' ? data.description : null
        const username = typeof data.username == 'string' ? data.username : null;
        const interests = typeof data.interests == 'string' ? data.interests : null;
        const postMessageId = typeof data.postMessageId == 'string' ? data.postMessageId : null;

        return await prisma.intro.upsert({
            where: {
                userId: discordId
            },
            update: data,
            create: {
                description,
                username,
                interests,
                postMessageId,
                user: {
                    connectOrCreate: {
                        where: {discordId: discordId},
                        create: {
                            discordId: discordId
                        }
                    }
                },
            }
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}