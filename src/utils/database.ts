import type { Collection, GuildMember } from 'discord.js';
import prisma from '../utils/prisma.js';
import { handlePrismaError } from './errors.js';
import { Prisma, type Intro } from '@prisma/client';

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

export async function incrementIntroRepostCount(discordId: string) {
    try {
        return await prisma.intro.upsert({
            where: {
                userId: discordId
            },
            update: {
                repostCount: {
                    increment: 1
                }
            },
            create: {
                userId: discordId
            }
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function addXp(discordId: string, amount: number) {
    try {
        return await prisma.user.upsert({
            where: {
                discordId: discordId
            },
            update: {
                xp: {
                    increment: amount
                }
            },
            create: {
                discordId: discordId,
                xp: amount
            }
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function removeXp(discordId: string, amount: number) 
{
    try {
        return await prisma.user.upsert({
            where: {
                discordId: discordId
            },
            update: {
                xp: {
                    decrement: amount
                }
            },
            create: {
                discordId: discordId,
                xp: 0
            }
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function getXp(discordId: string) {
    try {
        return (await prisma.user.findFirst({
            where: {
                discordId: discordId,
            },
        }))?.xp;
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function setXp(discordId: string, amount: number) {
    try {
        return await prisma.user.upsert({
            where: {
                discordId: discordId
            },
            update: {
                xp: amount
            },
            create: {
                discordId: discordId,
                xp: amount
            }
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function getChannelXpSettings(channelId: string) {
    try {
        return await prisma.channelXpSettings.findFirst({
            where: {
                channelId: channelId,
            },
        });
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function getAllChannelXpSettings() {
    try {
        return await prisma.channelXpSettings.findMany({
            where: {
                
            },
        });
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function setChannelBaseMessageXp(channelId: string, amount: number) {
    try {
        return await prisma.channelXpSettings.upsert({
            where: {
                channelId: channelId,
            },
            create: {
                channelId: channelId,
                baseMessageCreate: amount,
                baseThreadCreate: 0,
                multiplier: 1,
            },
            update: {
                baseMessageCreate: amount
            }
        });
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function setChannelBaseThreadXp(channelId: string, amount: number) {
    try {
        return await prisma.channelXpSettings.upsert({
            where: {
                channelId: channelId,
            },
            create: {
                channelId: channelId,
                baseMessageCreate: 0,
                baseThreadCreate: amount,
                multiplier: 1,
            },
            update: {
                baseThreadCreate: amount
            }
        });
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function setChannelMultiplier(channelId: string, amount: number, expiration: Date | null) {
    try {
        return await prisma.channelXpSettings.upsert({
            where: {
                channelId: channelId,
            },
            create: {
                channelId: channelId,
                baseMessageCreate: 0,
                baseThreadCreate: 0,
                multiplier: amount,
                multiplierExpiration: expiration
            },
            update: {
                multiplier: amount,
                multiplierExpiration: expiration
            }
        });
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function getLevelRolesByLevel(level: number) {
    try {
        return await prisma.levelRole.findMany({
            where: {
                levelId: level,
            },
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function getLevelRolesByRole(roleId: string) {
    try {
        return await prisma.levelRole.findMany({
            where: {
                roleId: roleId,
            },
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function getLevelRole(level: number, roleId: string) {
    try {
        return await prisma.levelRole.findFirst({
            where: {
                levelId: level, roleId
            },
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function addLevelRole(level: number, roleId: string, gained: boolean) {
    try {
        return await prisma.levelRole.create({
            data: {
              level: { connectOrCreate: {
                where: {
                    id: level
                },
                create: {
                    id: level
                }
              } },
              role: { connectOrCreate: {
                where: {
                    roleId
                },
                create: {
                    roleId
                }
              } },
              gained,
            },
          })
    } catch (error) {
        throw handlePrismaError(error); 
    }
}

export async function removeLevelRole(level: number, roleId: string) {
    try {
        return await prisma.levelRole.delete({
            where: {
              levelId_roleId: { levelId: level, roleId },
            },
          })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function removeAllLevelRolesByLevel(level: number) {
    try {
        return await prisma.levelRole.deleteMany({
            where: {
              levelId: level,
            },
          })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function removeAllLevelRolesByRole(roleId: string) {
    try {
        return await prisma.levelRole.deleteMany({
            where: {
              roleId,
            },
          })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function getServerXpSettings(guildId: string) {
    try {
        return await prisma.serverXpSettings.findFirst({
            where: {
                guildId
            },
        })
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function setServerXpCooldown(guildId: string, cooldownSeconds: number) {
    try {
        return await prisma.serverXpSettings.upsert({
            where: {
                guildId,
            },
            create: {
                guildId,
                cooldownSeconds
            },
            update: {
                cooldownSeconds
            }
        });
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function setServerLevelFormula(guildId: string, levelFormula: string) {
    try {
        return await prisma.serverXpSettings.upsert({
            where: {
                guildId,
            },
            create: {
                guildId,
                levelFormula
            },
            update: {
                levelFormula
            }
        });
    } catch (error) {
        throw handlePrismaError(error);
    }
}