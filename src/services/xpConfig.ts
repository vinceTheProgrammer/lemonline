import { GuildId } from "../constants/guilds.js";
import { getAllChannelXpSettings, getAllLevelRoles, getChannelXpSettings, getServerXpSettings, removeLevelRoleDb, setChannelBaseMessageXp, setChannelBaseThreadXp, setChannelMultiplier, setServerLevelFormula, setServerXpCooldown, upsertLevelRole } from "../utils/database.js";
import { ChannelXpRule, LevelRole, XpConfig } from "../types/xp.js";
import { CustomError } from "../utils/custom-error.js";
import { ErrorType } from "../constants/errors.js";
import { setLocalFormula } from "../utils/xp.js";
import { Container } from "@sapphire/framework";

export async function setChannelBaseXp(options: {
    channelId: string;
    event: 'messageCreate' | 'threadCreate';
    amount: number;
  }) {
    try {
        switch (options.event) {
            case "messageCreate":
                await setChannelBaseMessageXp(options.channelId, options.amount);
                break;
            case "threadCreate":
                await setChannelBaseThreadXp(options.channelId, options.amount);
                break;
            default:
                await setChannelBaseMessageXp(options.channelId, options.amount);    
        }
    } catch (error) {
        throw error
    }
  }
  
  export async function setChannelBoost(options: {
    channelId: string;
    multiplier: number;
    expiresAt: Date | null;
  }) {
    try {
        await setChannelMultiplier(options.channelId, options.multiplier, options.expiresAt);
    } catch (error) {
        throw error
    }
  }
  
  export async function setLevelRole(options: {
    level: number;
    roleId: string;
    type: 'gain' | 'lose';
  }) {
    try {
        const gain = options.type == 'gain' ? true : false;
        await upsertLevelRole(options.level, options.roleId, gain);
    } catch (error) {
        throw error
    }
  }

  export async function removeLevelRole(options: {
    level: number;
    roleId: string;
  }) {
    try {
        await removeLevelRoleDb(options.level, options.roleId);
    } catch (error) {
        throw error
    }
  }
  
  export async function setServerCooldown(
    seconds: number
  ) {
    try {
        await setServerXpCooldown(GuildId.LemonlineStudios, seconds);
    } catch (error) {
        throw error
    }
  }
  
  export async function setLevelFormula(
    formula: string
  ) {
    try {
        await setServerLevelFormula(GuildId.LemonlineStudios, formula);
        setLocalFormula(formula);
    } catch (error) {
        throw error
    }
  }

  export async function updateFullXpConfigWeb(config: XpConfig, container: Container): Promise<void> {
    try {
      // --------------------
      // Server-level settings
      // --------------------
      await Promise.all([
        setServerCooldown(config.serverCooldownSeconds),
        setLevelFormula(config.levelFormula),
      ]);
  
      // --------------------
      // Channel XP Rules
      // --------------------
      const existingChannelXpRules = await fetchChannelXpConfigs(); 

      const desiredChannelIds = new Set(
        config.channelXpRules
          .map(r => r.channelId)
          .filter((id): id is string => !!id)
      );
      
      const existingChannelIds = new Set(
        existingChannelXpRules.map(c => c.channelId)
      );

      for (const channel of config.channelXpRules) {
        if (!channel.channelId) continue;

        await Promise.all([
          setChannelBaseXp({
            channelId: channel.channelId,
            event: 'messageCreate',
            amount: channel.baseMessageCreateAmount,
          }),
          setChannelBaseXp({
            channelId: channel.channelId,
            event: 'threadCreate',
            amount: channel.baseThreadCreateAmount,
          }),
          setChannelBoost({
            channelId: channel.channelId,
            multiplier: channel.multiplier,
            expiresAt: channel.expiration ? new Date(channel.expiration) : null,
          }),
        ]);
      }

      for (const channelId of existingChannelIds) {
        if (!desiredChannelIds.has(channelId)) {
          // Reset to defaults
          await Promise.all([
            setChannelBaseXp({
              channelId,
              event: 'messageCreate',
              amount: 0,
            }),
            setChannelBaseXp({
              channelId,
              event: 'threadCreate',
              amount: 0,
            }),
            setChannelBoost({
              channelId,
              multiplier: 1.0,
              expiresAt: null,
            }),
          ]);
        }
      }
      
  
      // --------------------
      // Level roles (diff-based)
      // --------------------
      const existingRoles = await fetchLevelRoles();

      const guildRoles = await (await container.client.guilds.fetch(GuildId.LemonlineStudios)).roles.fetch(); // however you already do this
      const validRoleIds = new Set(guildRoles.map(r => r.id));

      const validLevelRoles = config.levelRoles.filter(r =>
        r.roleId &&
        validRoleIds.has(r.roleId)
      );      
  
      const desiredKey = (r: LevelRole) =>
        `${r.level}:${r.roleId}`;
  
      const existingKey = (r: { levelId: number; roleId: string; gained: boolean }) =>
        `${r.levelId}:${r.roleId}`;
  
      const desired = new Set(validLevelRoles.map(desiredKey));
  
      // Add missing
      for (const role of validLevelRoles) {
        await setLevelRole({
          level: role.level,
          roleId: role.roleId,
          type: role.result,
        });
      }      
  
      // Remove extra
      for (const role of existingRoles) {
        const key = existingKey(role);
        if (!desired.has(key)) {
        console.log("removing", JSON.stringify(role));
          await removeLevelRole({
            level: role.levelId,
            roleId: role.roleId,
          });
        }
      }
    } catch (error) {
      throw error;
    }
  }  

// =============================================

export async function fetchFullXpConfigWeb() : Promise<XpConfig> {
  try {
    const summary = await fetchXpSummary();

    const channelXpRules : ChannelXpRule[] = summary.channels.map(channel => {
      return {
        channelId: channel.channelId,
        baseMessageCreateAmount: channel.baseMessageCreate,
        baseThreadCreateAmount: channel.baseThreadCreate,
        multiplier: channel.multiplier,
        expiration: channel.multiplierExpiration != null ? channel.multiplierExpiration.toISOString() : null,
      }
    });
    const levelRoles : LevelRole[] = summary.levelRoles.map(role => {
      return {
        level: role.levelId,
        roleId: role.roleId,
        result: role.gained ? 'gain' : 'lose',
      }
    })

    if (!summary.server) throw new CustomError("Failed to find server xp settings", ErrorType.Error);

    const serverCooldownSeconds : number = summary.server.cooldownSeconds;
    const levelFormula : string = summary.server.levelFormula;

    return {
      channelXpRules,
      levelRoles,
      serverCooldownSeconds,
      levelFormula,
    }
  } catch (error) {
    throw error;
  }
}

export async function fetchServerXpConfig() : Promise<{
  guildId: string;
  cooldownSeconds: number;
  levelFormula: string;
} | null> {
  return getServerXpSettings(GuildId.LemonlineStudios);
}

export async function fetchChannelXpConfig(channelId: string) : Promise<{
  channelId: string;
  baseMessageCreate: number;
  baseThreadCreate: number;
  multiplier: number;
  multiplierExpiration: Date | null;
} | null> {
  return getChannelXpSettings(channelId);
}

export async function fetchChannelXpConfigs() : Promise<{
  channelId: string;
  baseMessageCreate: number;
  baseThreadCreate: number;
  multiplier: number;
  multiplierExpiration: Date | null;
}[]> {
  return getAllChannelXpSettings()
}


export async function fetchLevelRoles() : Promise<{
  id: number;
  levelId: number;
  roleId: string;
  gained: boolean;
}[]>{
  return getAllLevelRoles();
}

export async function fetchXpSummary() {
  const [server, channels, levelRoles] = await Promise.all([
    fetchServerXpConfig(),
    fetchChannelXpConfigs(),
    fetchLevelRoles()
  ]);

  return {
    server,
    channels,
    levelRoles
  };
}
