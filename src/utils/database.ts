import prisma from '../utils/prisma.js';
import { handlePrismaError } from './errors.js';
import { Prisma } from '@prisma/client';
import { updateUserRoles } from './roles.js';
import { Guild } from 'discord.js';
import { CustomError } from './custom-error.js';
import { ErrorType } from '../constants/errors.js';

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

export async function searchMembers(q: string, guild: Guild) {
    try {
        const isId = /^\d{17,20}$/.test(q);

        if (isId) {
            return await prisma.user.findMany({
                where: { discordId: q },
                take: 10,
                orderBy: { xp: "desc" }
            });
        } else {
            const result = await guild.members.search({query: q, limit: 10, cache: true});

            const ids = result.map(member => member.id);

            return await prisma.user.findMany({
                where: {
                  discordId: {
                    in: ids,
                  },
                },
              });
        }
    } catch (error) {
        throw handlePrismaError(error);
    }
}  

export async function getUsersPaginated(
    perPage: number, 
    page: number, 
    sortBy: 'xp' | 'messageCount', 
    ascending: boolean
  ) {
    try {
      // Calculate skip: page 1 skips 0, page 2 skips perPage, etc.
      const skip = (page - 1) * perPage;
      const take = perPage;
      const orderBy = { [sortBy]: ascending ? 'asc' : 'desc' };
  
      // Execute both queries in a transaction for consistency
      const [totalCount, users] = await prisma.$transaction([
        prisma.user.count(),
        prisma.user.findMany({
          skip,
          take,
          orderBy,
        }),
      ]);
  
      const totalPages = Math.ceil(totalCount / perPage);
  
      return {
        data: users,
        meta: {
          totalCount,
          totalPages,
          currentPage: page,
          perPage,
        },
      };
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

        // const debug : Prisma.IntroCreateInput = {
        //     user: {
        //         connectOrCreate: {
        //             where: {discordId: discordId},
        //             create: {
        //                 discordId: discordId
        //             }
        //         },
        //     }
        // }

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

export async function addXp(discordId: string, amount: number, guild: Guild) {
    try {
        const user = await prisma.user.upsert({
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

        const oldXp = user.xp - amount;

        updateUserRoles(user, oldXp, guild);

        return user;
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function removeXp(discordId: string, amount: number, guild: Guild) {
    try {
      const user = await prisma.$transaction(async (tx) => {
        // 1. Read current xp
        const existing = await tx.user.findUnique({
          where: { discordId },
          select: { xp: true },
        });
  
        // If user doesn’t exist, create with 0 xp (or handle as error)
        if (!existing) throw new CustomError(`User could not be found in the database when looking for discord id ${discordId}. (removeXp)`, ErrorType.Error);
  
        const oldXp = existing.xp;
        const newXp = Math.max(0, oldXp - amount);
  
        // 3. Update
        const updated = await tx.user.update({
          where: { discordId },
          data: { xp: newXp },
        });
  
        updateUserRoles(updated, oldXp, guild);
  
        return updated;
      });
  
      return user;
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

export async function setXp(discordId: string, amount: number, guild: Guild) {
    try {
        amount = Math.max(0, amount);
      const existing = await prisma.user.findUnique({
        where: { discordId },
        select: { xp: true },
      });

      if (!existing) throw new CustomError(`User could not be found in the database when looking for discord id ${discordId}. (setXp)`, ErrorType.Error);
  
      const oldXp = existing.xp;

      const user = await prisma.user.upsert({
        where: { discordId },
        update: { xp: amount },
        create: { discordId, xp: amount },
      });
  
      updateUserRoles(user, oldXp, guild);
  
      return user;
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
        return await prisma.channelXpSettings.findMany();
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

export async function getAllLevelRoles() {
    try {
        return await prisma.levelRole.findMany({
            where: {

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

export async function upsertLevelRole(level: number, roleId: string, gained: boolean) {
    try {
      return await prisma.levelRole.upsert({
        where: {
          levelId_roleId: {
            levelId: level,
            roleId,
          },
        },
        create: {
          level: {
            connectOrCreate: {
              where: { id: level },
              create: { id: level },
            },
          },
          role: {
            connectOrCreate: {
              where: { roleId },
              create: { roleId },
            },
          },
          gained,
        },
        update: {
          gained,
        },
      });
    } catch (error) {
      throw handlePrismaError(error);
    }
  }

export async function removeLevelRoleDb(level: number, roleId: string) {
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

export async function getRolesForLevel(
    level: number
): Promise<{ add: string[]; remove: string[] }> {
    try {
        const levelRoles = await prisma.levelRole.findMany({
            where: {
                levelId: {
                lte: level,
                },
            },
            orderBy: {
                levelId: "asc",
            },
            select: {
                roleId: true,
                gained: true,
            },
        });

        // Track final state of each leveled role
        const roleState = new Map<string, boolean>();

        for (const lr of levelRoles) {
            roleState.set(lr.roleId, lr.gained);
        }

        const add: string[] = [];
        const remove: string[] = [];

        for (const [roleId, gained] of roleState.entries()) {
            if (gained) {
                add.push(roleId);
            } else {
                remove.push(roleId);
            }
        }

        return { add, remove };
    } catch (error) {
        throw handlePrismaError(error);
    }
}

export async function getAbsoluteRolesAtLevel(
    level: number
): Promise<Set<string>> {
    const levelRoles = await prisma.levelRole.findMany({
        where: {
        levelId: { lte: level },
        },
        orderBy: {
        levelId: "asc",
        },
        select: {
        roleId: true,
        gained: true,
        },
    });

    const finalRoleState = new Map<string, boolean>();

    for (const lr of levelRoles) {
        finalRoleState.set(lr.roleId, lr.gained);
    }

    const roles = new Set<string>();
    for (const [roleId, gained] of finalRoleState) {
        if (gained) roles.add(roleId);
    }

    return roles;
}  

export async function getServerXpSettings(guildId: string) {
    try {
        return await prisma.serverXpSettings.findFirst({
            where: {
                guildId
            },
        })
    } catch (error) {
        console.log(error);
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