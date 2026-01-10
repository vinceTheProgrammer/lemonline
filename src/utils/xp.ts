// xpCache[level] = total XP required to REACH that level
import { LevelRoleConfig } from "../types/xp";
import { getLevelRolesByLevel } from "./database";
import { RoleManager } from "discord.js";

// level 1 starts at 0 XP
export let xpCache: number[] = [undefined as never, 0];

export let xpPerLevelFn: (level: number) => number = defaultXpPerLevel;

/**
 * Default XP required to advance from level -> level+1
 */
function defaultXpPerLevel(level: number): number {
  return 100 * level;
}

/**
 * Compile and store a new XP-per-level formula
 */
export function setLocalFormula(formula: string) {

  xpPerLevelFn = formula.length === 0
    ? defaultXpPerLevel
    : new Function("level", `return ${formula};`) as (level: number) => number;

  // Reset cache
  xpCache = [undefined as never, 0];
}

/**
 * XP required to advance from level -> level+1
 * Always clamped to >= 1 to preserve monotonicity
 */
export function getXpForNextLevel(level: number): number {
  const raw = xpPerLevelFn(level);
  return Number.isFinite(raw) ? Math.max(1, raw) : 1;
}

/**
 * Total XP required to reach a given level
 */
export function getTotalXp(level: number): number {
  level = Math.max(1, Math.floor(level));

  if (xpCache[level] !== undefined) {
    return xpCache[level];
  }

  for (let l = xpCache.length; l <= level; l++) {
    xpCache[l] = xpCache[l - 1] + getXpForNextLevel(l - 1);
  }

  return xpCache[level];
}

/**
 * XP needed to advance from level -> level+1
 */
export function getDeltaXp(level: number): number {
  return getXpForNextLevel(level);
}

/**
 * XP progress within the current level
 */
export function getRelativeXp(totalXp: number, level?: number): number {
  totalXp = Math.max(0, totalXp);
  const currentLevel = Math.max(1, level ?? getLevelFromXp(totalXp));
  return Math.max(0, totalXp - getTotalXp(currentLevel));
}

/**
 * Determine level from total XP
 */
export function getLevelFromXp(xp: number): number {
  xp = Math.max(0, xp);

  while (getTotalXp(xpCache.length - 1) <= xp) {
    getTotalXp(xpCache.length);
  }

  let low = 1;
  let high = xpCache.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (xpCache[mid] <= xp) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(1, high);
}

/**
 * Returns total XP required to reach each level from 1..maxLevel
 * Index 0 is omitted.
 */
export function getLevelMappings(maxLevel: number): number[] {
  maxLevel = Math.max(1, Math.floor(maxLevel));

  getTotalXp(maxLevel);

  // Return a COPY so callers can’t mutate internal state
  return xpCache.slice(1, maxLevel + 1);
}

export function getLevelMappingsRounded(maxLevel: number): number[] {
  maxLevel = Math.max(1, Math.floor(maxLevel));

  return getLevelMappings(maxLevel).map(xp => Math.round(xp));
}


export function previewLevelMappings(
  formula: string,
  maxLevel: number
): number[] {
  const xpPerLevelFn =
    formula.length === 0
      ? defaultXpPerLevel
      : new Function("level", `return ${formula};`) as (level: number) => number;

  const result: number[] = [];
  let total = 0;

  for (let level = 1; level <= maxLevel; level++) {
    result[level] = total;
    const raw = xpPerLevelFn(level);
    total += Number.isFinite(raw) ? Math.max(1, raw) : 1;
  }

  return result.slice(1);
}

export function previewLevelMappingsSafe(
  formula: string,
  maxLevel: number
): { ok: true; levels: number[] } | { ok: false; error: string } {
  maxLevel = Math.max(1, Math.floor(maxLevel));

  try {
    const fn =
      formula.trim().length === 0
        ? defaultXpPerLevel
        : (new Function("level", `return ${formula};`) as (l: number) => number);

    const result: number[] = [];
    let total = 0;

    for (let level = 1; level <= maxLevel; level++) {
      result.push(total);
      const raw = fn(level);
      total += Number.isFinite(raw) ? Math.max(1, raw) : 1;
    }

    return { ok: true, levels: result };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Invalid formula"
    };
  }
}

export interface LevelRoleWithMeta {
  id: number;
  roleId: string;
  name: string;
  color: number; // Discord-style integer color
  gained: boolean;
}

export interface LevelMappingWithRoles {
  level: number;
  totalXp: number;
  roles: LevelRoleWithMeta[];
}


export async function getLevelMappingsWithRolesRounded(
  maxLevel: number,
  roles: RoleManager,
  levelRoleConfigs?: LevelRoleConfig[]
): Promise<
  | { ok: true; levels: LevelMappingWithRoles[] }
  | { ok: false; error: string }
> {
  maxLevel = Math.max(1, Math.floor(maxLevel));
  try {
    // XP per level (1..maxLevel)
    const xpMappings = getLevelMappingsRounded(maxLevel);

        // Fetch roles per level
    let rolesByLevel: LevelRoleConfig[][];

    if (levelRoleConfigs) {
      rolesByLevel = await Promise.all(
        xpMappings.map((_, index) =>
          levelRoleConfigs.filter(config => config.levelId == index + 1)
        )
      );
    } else {
      rolesByLevel = await Promise.all(
        xpMappings.map((_, index) =>
          getLevelRolesByLevel(index + 1)
        )
      ) as LevelRoleConfig[][];
    }

    // Collect unique role IDs
    const uniqueRoleIds = new Set<string>();
    for (const roles of rolesByLevel) {
      for (const role of roles) {
        uniqueRoleIds.add(role.roleId);
      }
    }

    // Fetch role metadata once
    const roleMetaEntries = await Promise.all(
      [...uniqueRoleIds].map(async roleId => {
        const role = await roles.fetch(roleId);
        return [roleId, role] as const;
      })
    );

    const roleMetaMap = new Map(roleMetaEntries);

    return {
      ok: true,
      levels: xpMappings.map((totalXp, index) => ({
        level: index + 1,
        totalXp,
        roles: rolesByLevel[index].map(role => {
          const meta = roleMetaMap.get(role.roleId);

          return {
            id: role.id,
            roleId: role.roleId,
            name: meta?.name ?? "Unknown Role",
            color: meta?.color ?? 0,
            gained: role.gained,
          };
        }),
      })),
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to load level mappings with roles",
    };
  }
}
